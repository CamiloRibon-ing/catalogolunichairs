// Sistema de gestión de productos conectado a Supabase
class ProductManager {
  constructor() {
    this.products = [];
    this.initialized = false;
    this.fullyInitialized = false;
    this.initializationPromise = null;
    this.catalogPageCache = new Map();
    this.sizes = ['Pequeño', 'Mediano', 'Grande'];
  }

  // Inicializar y cargar productos
  async initialize() {
    if (this.fullyInitialized) {
      return this.products;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      // console.log('🚀 Inicializando ProductManager - solo productos de Supabase...');
      
      const cachedProducts = this.loadProductCache();
      if (cachedProducts?.length) {
        this.products = cachedProducts;
        this.initialized = true;
        this.fullyInitialized = true;
        this.refreshFromSupabase();
        return this.products;
      }

      const loadedProducts = await this.loadProductsFromSupabase();
      if (loadedProducts === null) {
        throw new Error('No se pudieron cargar los productos');
      }

      this.products = loadedProducts;
      this.initialized = true;
      this.fullyInitialized = true;
      
      // console.log(`✅ ProductManager inicializado con ${this.products.length} productos de Supabase`);
      return this.products;
    })().finally(() => {
      this.initializationPromise = null;
    });

    return this.initializationPromise;
  }

  // Cargar productos desde Supabase
  async loadProductsFromSupabase() {
    try {
      const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
      const restProducts = await this.loadProductsFast();
      if (restProducts) {
        return restProducts;
      }

      if (!client) {
        console.error('Supabase Client no disponible al cargar productos');
        return null;
      }
      // console.log('📡 Conectando a Supabase para cargar productos...');
      const query = client
        .from('products')
        .select('id,name,category,price,color,size,description,image,stock,available,created_at')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        // console.error('❌ Error cargando productos de Supabase:', error);
        console.error('Error cargando productos de Supabase:', error);
        return null;
      }

      if (!data || data.length === 0) {
        // console.log('📭 No hay productos en Supabase aún');
        return [];
      }

      // console.log(`✅ ${data.length} productos cargados desde Supabase`);

      // Mapear productos de Supabase al formato local
      const products = data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        color: product.color,
        size: product.size,
        image: product.image,
        images: this.parseProductImages(product),
        available: product.available,
        stock: product.stock || 0,
        description: product.description,
        createdAt: new Date(product.created_at).getTime(),
        fromSupabase: true
      }));

      this.saveProductCache(products);
      return products;

    } catch (error) {
      // console.error('Error conectando a Supabase para productos:', error);
      console.error('Error conectando a Supabase para productos:', error);
      return [];
    }
  }

  async refreshFromSupabase() {
    try {
      const products = await this.loadProductsFromSupabase();
      if (!products) return;

      this.products = products;
      this.saveProductCache(products);

      if (typeof window.renderProductCatalog === 'function') {
        window.renderProductCatalog({ skipInitialize: true });
      }
    } catch (error) {
      console.warn('No se pudo refrescar productos en segundo plano:', error);
    }
  }

  async loadProductsFast() {
    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey || typeof fetch === 'undefined') {
      return null;
    }

    try {
      const columns = 'id,name,category,price,color,size,description,image,stock,available,created_at';
      const url = `${config.url}/rest/v1/products?select=${columns}&order=created_at.desc`;
      const response = await fetch(url, {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error REST cargando productos:', response.status, await response.text());
        return null;
      }

      const data = await response.json();
      const products = data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        color: product.color,
        size: product.size,
        image: product.image,
        images: this.parseProductImages(product),
        available: product.available,
        stock: product.stock || 0,
        description: product.description,
        createdAt: new Date(product.created_at).getTime(),
        fromSupabase: true
      }));

      this.saveProductCache(products);
      return products;
    } catch (error) {
      console.error('Error REST conectando a Supabase para productos:', error);
      return null;
    }
  }

  mapSupabaseProducts(data) {
    return (data || []).map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      color: product.color,
      size: product.size,
      image: product.image,
      images: this.parseProductImages(product),
      available: product.available,
      stock: product.stock || 0,
      description: product.description,
      createdAt: new Date(product.created_at).getTime(),
      fromSupabase: true
    }));
  }

  mergeLoadedProducts(products) {
    const productMap = new Map(this.products.map(product => [product.id, product]));
    products.forEach(product => productMap.set(product.id, product));
    this.products = Array.from(productMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    this.initialized = this.products.length > 0;
  }

  async loadCatalogPage({ page = 1, pageSize = 12, category = 'all' } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 12);
    const cacheKey = `${category}:${safePage}:${safePageSize}`;

    if (this.catalogPageCache.has(cacheKey)) {
      return this.catalogPageCache.get(cacheKey);
    }

    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;
    const columns = 'id,name,category,price,color,size,description,image,stock,available,created_at';

    try {
      const config = window.SUPABASE_CONFIG;
      if (config?.url && config?.anonKey && typeof fetch !== 'undefined') {
        const categoryFilter = category && category !== 'all'
          ? `&category=eq.${encodeURIComponent(category)}`
          : '';
        const url = `${config.url}/rest/v1/products?select=${columns}&available=eq.true${categoryFilter}&order=created_at.desc`;
        const response = await fetch(url, {
          headers: {
            apikey: config.anonKey,
            Authorization: `Bearer ${config.anonKey}`,
            Accept: 'application/json',
            Prefer: 'count=exact',
            Range: `${from}-${to}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const products = this.mapSupabaseProducts(data);
          const total = this.getTotalFromContentRange(response.headers.get('content-range')) || products.length;
          const result = { products, total };
          this.mergeLoadedProducts(products);
          this.catalogPageCache.set(cacheKey, result);
          return result;
        }
      }

      const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
      if (!client) {
        return { products: [], total: 0 };
      }

      let query = client
        .from('products')
        .select(columns, { count: 'exact' })
        .eq('available', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;
      if (error) {
        console.error('Error cargando pagina de productos:', error);
        return { products: [], total: 0 };
      }

      const products = this.mapSupabaseProducts(data);
      const result = { products, total: count || products.length };
      this.mergeLoadedProducts(products);
      this.catalogPageCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error cargando pagina de productos:', error);
      return { products: [], total: 0 };
    }
  }

  getTotalFromContentRange(contentRange) {
    if (!contentRange || !contentRange.includes('/')) return null;
    const total = Number(contentRange.split('/').pop());
    return Number.isFinite(total) ? total : null;
  }

  invalidateCatalogCache() {
    this.catalogPageCache.clear();
    localStorage.removeItem('luni_products_cache');
    this.fullyInitialized = false;
  }

  saveProductCache(products) {
    try {
      localStorage.setItem('luni_products_cache', JSON.stringify({
        products,
        savedAt: Date.now()
      }));
    } catch (error) {
      // Cache opcional.
    }
  }

  loadProductCache() {
    try {
      const stored = localStorage.getItem('luni_products_cache');
      if (!stored) return null;

      const cache = JSON.parse(stored);
      return Array.isArray(cache.products) ? cache.products : null;
    } catch (error) {
      return null;
    }
  }

  async loadProductsFromRest() {
    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey || typeof fetch === 'undefined') {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const url = `${config.url}/rest/v1/products?select=*&order=created_at.desc`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Accept: 'application/json'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        console.error('Error REST cargando productos:', response.status, await response.text());
        return null;
      }

      const data = await response.json();
      return data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        color: product.color,
        size: product.size,
        image: product.image,
        images: this.parseProductImages(product),
        available: product.available,
        stock: product.stock || 0,
        description: product.description,
        createdAt: new Date(product.created_at).getTime(),
        fromSupabase: true
      }));
    } catch (error) {
      console.error('Error REST conectando a Supabase para productos:', error);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  withTimeout(promise, timeoutMs, message) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  parseProductImages(product) {
    const images = [];
    
    if (product.image) {
      try {
        const imageData = JSON.parse(product.image);
        
        if (imageData && typeof imageData === 'object' && imageData.main) {
          images.push({
            url: imageData.main,
            alt: `${product.name} - Imagen principal`,
            primary: true
          });
          
          if (imageData.additional && Array.isArray(imageData.additional)) {
            imageData.additional.forEach((imgUrl, index) => {
              images.push({
                url: imgUrl,
                alt: `${product.name} - Imagen ${index + 2}`,
                primary: false
              });
            });
          }
        } else {
          images.push({
            url: product.image,
            alt: `${product.name} - Imagen principal`,
            primary: true
          });
        }
      } catch (error) {
        images.push({
          url: product.image,
          alt: `${product.name} - Imagen principal`,
          primary: true
        });
      }
    }
    
    // Manejo legacy para el campo images (si existe)
    if (product.images) {
      let additionalImages = [];
      
      // Si es un string JSON, parsearlo
      if (typeof product.images === 'string') {
        try {
          additionalImages = JSON.parse(product.images);
        } catch (error) {
          // console.warn('⚠️ Error parsing images JSON:', error);
        }
      }
      // Si ya es array, usarlo directamente
      else if (Array.isArray(product.images)) {
        additionalImages = product.images;
      }
      
      // Agregar imágenes adicionales (solo si no hay imagen principal ya)
      if (images.length === 0) {
        additionalImages.forEach((img, index) => {
          if (typeof img === 'string') {
            images.push({
              url: img,
              alt: `${product.name} - Imagen ${index + 1}`,
              primary: index === 0
            });
          } else if (img && img.url) {
            images.push({
              url: img.url,
              alt: img.alt || `${product.name} - Imagen ${index + 1}`,
              primary: index === 0
            });
          }
        });
      }
    }
    
    // console.log('📷 Imágenes parseadas:', images);
    return images;
  }

  // Función mergeProducts eliminada - ya no se necesita

  // Productos hardcodeados eliminados - solo se usan productos de Supabase

  saveProducts() {
    // Ya no guardamos productos locales - todo viene de Supabase
    // console.log('ℹ️ saveProducts() - Los productos ahora se gestionan solo en Supabase');
  }

  async addProduct(product) {
    // console.log('➕ Agregando producto con datos:', product);
    // console.log('📷 Imágenes recibidas:', product.images);
    // console.log('🖼️ Imagen principal:', product.image);
    
    try {
      // Preparar datos para Supabase
      const productData = {
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        color: product.color,
        size: product.size,
        available: product.available !== false,
        stock: parseInt(product.stock) || 0,
        description: product.description || ''
      };
      
      // Manejar imagen principal e imágenes adicionales
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // Si las imágenes vienen como array de objetos con {url, primary}
        if (typeof product.images[0] === 'object') {
          const primaryImage = product.images.find(img => img.primary);
          
          // Para compatibilidad con el esquema actual, guardamos la imagen principal
          // y todas las imágenes (incluyendo adicionales) en el campo 'image' como JSON
          productData.image = primaryImage ? primaryImage.url : product.images[0].url;
          
          // Si hay más de una imagen, guardar todas en el mismo campo como JSON
          if (product.images.length > 1) {
            // Crear un objeto con imagen principal y adicionales
            const imageData = {
              main: productData.image,
              additional: product.images
                .filter(img => !img.primary)
                .map(img => img.url)
            };
            
            // Solo usar JSON si hay imágenes adicionales
            if (imageData.additional.length > 0) {
              productData.image = JSON.stringify(imageData);
            }
          }
        }
        // Si las imágenes vienen como array de URLs simples
        else {
          productData.image = product.images[0];
          if (product.images.length > 1) {
            const imageData = {
              main: product.images[0],
              additional: product.images.slice(1)
            };
            productData.image = JSON.stringify(imageData);
          }
        }
      }
      // Si viene imagen principal por separado
      else if (product.image) {
        productData.image = product.image;
        
        // Si vienen imágenes adicionales por separado (desde modal de edición)
        if (product.additional_images) {
          const additionalImages = typeof product.additional_images === 'string' 
            ? JSON.parse(product.additional_images) 
            : product.additional_images;
          
          if (additionalImages && additionalImages.length > 0) {
            const imageData = {
              main: product.image,
              additional: additionalImages
            };
            productData.image = JSON.stringify(imageData);
          }
        }
      }
      // Fallback por si no hay imagen
      else {
        productData.image = 'recursos/lunilogo.png';
      }
      
      // console.log('📦 Datos finales para Supabase:', productData);
      
      // Agregar a Supabase
      const { data, error } = await supabaseClient
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        // console.error('❌ Error agregando producto a Supabase:', error);
        // console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
        // console.error('📦 Datos enviados que causaron error:', JSON.stringify(productData, null, 2));
        
        // Mostrar error específico si está disponible
        if (error.message) {
          // console.error('💬 Mensaje de error:', error.message);
        }
        if (error.details) {
          // console.error('📋 Detalles técnicos:', error.details);
        }
        if (error.hint) {
          // console.error('💡 Sugerencia:', error.hint);
        }
        
        return false;
      }

      // console.log('✅ Producto agregado a Supabase:', data);
      
      // Recargar productos para mantener sincronización
      this.initialized = false; // Forzar reinicialización
      this.invalidateCatalogCache();
      if (data) {
        this.mergeLoadedProducts(this.mapSupabaseProducts([data]));
      }
      return true;
      
    } catch (error) {
      // console.error('❌ Error en addProduct:', error);
      return false;
    }
  }

  async updateProduct(id, updates) {
    const product = this.getProduct(id);
    if (!product) return false;

    try {
      // Si el producto es de Supabase, actualizar en Supabase
      if (product.fromSupabase) {
        const updateData = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.color !== undefined) updateData.color = updates.color;
        if (updates.size !== undefined) updateData.size = updates.size;
        if (updates.stock !== undefined) updateData.stock = updates.stock;
        if (updates.available !== undefined) updateData.available = updates.available;
        if (updates.description !== undefined) updateData.description = updates.description;
        
        // Manejar imágenes con el mismo formato que addProduct
        if (updates.image !== undefined || updates.images !== undefined || updates.additional_images !== undefined) {
          // Usar la misma lógica que en addProduct
          if (updates.images && Array.isArray(updates.images) && updates.images.length > 0) {
            // Array de objetos con {url, primary}
            if (typeof updates.images[0] === 'object') {
              const primaryImage = updates.images.find(img => img.primary);
              updateData.image = primaryImage ? primaryImage.url : updates.images[0].url;
              
              if (updates.images.length > 1) {
                const imageData = {
                  main: updateData.image,
                  additional: updates.images
                    .filter(img => !img.primary)
                    .map(img => img.url)
                };
                if (imageData.additional.length > 0) {
                  updateData.image = JSON.stringify(imageData);
                }
              }
            }
            // Array de URLs simples
            else {
              updateData.image = updates.images[0];
              if (updates.images.length > 1) {
                const imageData = {
                  main: updates.images[0],
                  additional: updates.images.slice(1)
                };
                updateData.image = JSON.stringify(imageData);
              }
            }
          }
          // Imagen principal separada
          else if (updates.image !== undefined) {
            updateData.image = updates.image;
            
            // Si hay imágenes adicionales
            if (updates.additional_images) {
              const additionalImages = typeof updates.additional_images === 'string' 
                ? JSON.parse(updates.additional_images) 
                : updates.additional_images;
              
              if (additionalImages && additionalImages.length > 0) {
                const imageData = {
                  main: updates.image,
                  additional: additionalImages
                };
                updateData.image = JSON.stringify(imageData);
              }
            }
          }
        }

        const { data, error } = await supabaseClient
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          // console.error('❌ Error actualizando producto en Supabase:', error);
          return false;
        }

        // console.log('✅ Producto actualizado en Supabase:', data);
        
        // Recargar productos para mantener sincronización
        this.initialized = false; // Forzar reinicialización
        this.invalidateCatalogCache();
        if (data) {
          this.mergeLoadedProducts(this.mapSupabaseProducts([data]));
        }
        return true;
      } else {
        // Todos los productos son de Supabase ahora
        // console.warn('⚠️ Producto no encontrado en Supabase:', id);
        return false;
      }
    } catch (error) {
      // console.error('❌ Error actualizando producto:', error);
      return false;
    }
  }

  async deleteProduct(id) {
    const product = this.getProduct(id);
    if (!product) return false;

    try {
      // Si el producto es de Supabase, eliminar de Supabase
      if (product.fromSupabase) {
        const { error } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          // console.error('❌ Error eliminando producto de Supabase:', error);
          return false;
        }
      } else {
        // Todos los productos son de Supabase ahora
        // console.warn('⚠️ Producto no encontrado en Supabase:', id);
        return false;
      }

      // Eliminar de lista local en memoria
      this.products = this.products.filter(p => p.id !== id);
      this.invalidateCatalogCache();
      // console.log('✅ Producto eliminado de la lista local');
      return true;

    } catch (error) {
      // console.error('❌ Error eliminando producto:', error);
      return false;
    }
  }

  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  getProductsByCategory(category) {
    if (category === 'all') return this.products.filter(p => p.available);
    return this.products.filter(p => p.category === category && p.available);
  }

  getAllProducts() {
    return this.products;
  }

  getAvailableProducts() {
    return this.products.filter(p => p.available);
  }

  searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return this.products.filter(p => 
      p.available && (
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.color.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      )
    );
  }

  checkAvailability(id, quantity = 1) {
    const product = this.getProduct(id);
    if (!product) return false;
    if (!product.available) return false;
    if (product.stock !== undefined && product.stock < quantity) return false;
    return true;
  }

  async decreaseStock(id, quantity = 1) {
    const product = this.getProduct(id);
    if (product && product.stock !== undefined) {
      const newStock = Math.max(0, product.stock - quantity);
      const updates = { 
        stock: newStock,
        available: newStock > 0 
      };
      
      await this.updateProduct(id, updates);
    }
  }

  async increaseStock(id, quantity = 1) {
    const product = this.getProduct(id);
    if (product) {
      const newStock = (product.stock || 0) + quantity;
      const updates = { 
        stock: newStock,
        available: true 
      };
      
      await this.updateProduct(id, updates);
    }
  }
}

// Instancia global del ProductManager
const productManager = new ProductManager();

// Inicializar productos cuando se cargue la página
// Función auxiliar para esperar a que ProductManager esté listo
async function waitForProducts() {
  if (!productManager.initialized) {
    await productManager.initialize();
  }
  return productManager;
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProductManager, productManager };
}

// ===== FUNCIONES DE UTILIDAD PARA DEBUG =====

// Función para verificar conexión con Supabase
window.testProductConnection = async function() {
  try {
    // console.log('🧪 Probando conexión de productos...');
    await productManager.initialize();
    const products = productManager.getAllProducts();
    // console.log(`✅ Conexión exitosa: ${products.length} productos cargados`);
    return { success: true, count: products.length };
  } catch (error) {
    // console.error('❌ Error en conexión de productos:', error);
    return { success: false, error };
  }
};

// Función para mostrar estadísticas de productos
window.showProductStats = function() {
  const products = productManager.getAllProducts();
  const available = products.filter(p => p.available);
  const categories = [...new Set(products.map(p => p.category))];
  
  // console.log('📊 ESTADÍSTICAS DE PRODUCTOS:');
  // console.log(`   Total: ${products.length}`);
  // console.log(`   Disponibles: ${available.length}`);
  // console.log(`   Categorías: ${categories.length} (${categories.join(', ')})`);
  // console.log(`   Stock total: ${products.reduce((sum, p) => sum + (p.stock || 0), 0)}`);
  
  return {
    total: products.length,
    available: available.length,
    categories: categories.length,
    totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0)
  };
};

