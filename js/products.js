// Sistema de gestión de productos conectado a Supabase
class ProductManager {
  constructor() {
    this.products = [];
    this.initialized = false;
    this.sizes = ['Pequeño', 'Mediano', 'Grande'];
  }

  // Inicializar y cargar productos
  async initialize() {
    if (!this.initialized) {
      console.log('🚀 Inicializando ProductManager - solo productos de Supabase...');
      
      // Cargar productos solo desde Supabase
      this.products = await this.loadProductsFromSupabase();
      this.initialized = true;
      
      console.log(`✅ ProductManager inicializado con ${this.products.length} productos de Supabase`);
    }
  }

  // Cargar productos desde Supabase
  async loadProductsFromSupabase() {
    try {
      console.log('📡 Conectando a Supabase para cargar productos...');
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando productos de Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('📭 No hay productos en Supabase aún');
        return [];
      }

      console.log(`✅ ${data.length} productos cargados desde Supabase`);

      // Mapear productos de Supabase al formato local
      return data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        color: product.color,
        size: product.size,
        image: product.image,
        available: product.available,
        stock: product.stock || 0,
        description: product.description,
        createdAt: new Date(product.created_at).getTime(),
        fromSupabase: true // Marcador para identificar origen
      }));

    } catch (error) {
      console.error('Error conectando a Supabase para productos:', error);
      return [];
    }
  }

  // Función mergeProducts eliminada - ya no se necesita

  // Productos hardcodeados eliminados - solo se usan productos de Supabase

  saveProducts() {
    // Ya no guardamos productos locales - todo viene de Supabase
    console.log('ℹ️ saveProducts() - Los productos ahora se gestionan solo en Supabase');
  }

  async addProduct(product) {
    try {
      // Agregar a Supabase
      const { data, error } = await supabaseClient
        .from('products')
        .insert({
          name: product.name,
          category: product.category,
          price: product.price,
          color: product.color || '',
          size: product.size || '',
          stock: product.stock || 0,
          available: product.available !== undefined ? product.available : true,
          description: product.description || '',
          image: product.image || ''
        })
        .select()
        .single();

      if (error) {
        console.error('Error agregando producto a Supabase:', error);
        return null;
      }

      // Agregar a la lista local
      const newProduct = {
        id: data.id,
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        color: data.color,
        size: data.size,
        image: data.image,
        available: data.available,
        stock: data.stock,
        description: data.description,
        createdAt: new Date(data.created_at).getTime(),
        fromSupabase: true
      };

      this.products.push(newProduct);
      return newProduct;

    } catch (error) {
      console.error('❌ Error conectando a Supabase para agregar producto:', error);
      // Sin productos hardcodeados, no podemos crear fallback local
      console.warn('⚠️ Producto no pudo guardarse - se requiere conexión a Supabase');
      return null;
    }
  }

  async updateProduct(id, updates) {
    const product = this.getProduct(id);
    if (!product) return null;

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
        if (updates.image !== undefined) updateData.image = updates.image;

        const { data, error } = await supabaseClient
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error actualizando producto en Supabase:', error);
          return null;
        }

        // Actualizar en lista local
        const updatedProduct = {
          id: data.id,
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
          color: data.color,
          size: data.size,
          image: data.image,
          available: data.available,
          stock: data.stock,
          description: data.description,
          createdAt: new Date(data.created_at).getTime(),
          fromSupabase: true
        };

        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }

        return updatedProduct;
      } else {
        // Todos los productos son de Supabase ahora
        console.warn('⚠️ Producto no encontrado en Supabase:', id);
        return null;
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      return null;
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
          console.error('❌ Error eliminando producto de Supabase:', error);
          return false;
        }
      } else {
        // Todos los productos son de Supabase ahora
        console.warn('⚠️ Producto no encontrado en Supabase:', id);
        return false;
      }

      // Eliminar de lista local en memoria
      this.products = this.products.filter(p => p.id !== id);
      console.log('✅ Producto eliminado de la lista local');
      return true;

    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
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
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await productManager.initialize();
    console.log('ProductManager inicializado correctamente');
    console.log('Productos cargados:', productManager.getAllProducts().length);
  } catch (error) {
    console.error('Error inicializando ProductManager:', error);
  }
});

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
    console.log('🧪 Probando conexión de productos...');
    await productManager.initialize();
    const products = productManager.getAllProducts();
    console.log(`✅ Conexión exitosa: ${products.length} productos cargados`);
    return { success: true, count: products.length };
  } catch (error) {
    console.error('❌ Error en conexión de productos:', error);
    return { success: false, error };
  }
};

// Función para mostrar estadísticas de productos
window.showProductStats = function() {
  const products = productManager.getAllProducts();
  const available = products.filter(p => p.available);
  const categories = [...new Set(products.map(p => p.category))];
  
  console.log('📊 ESTADÍSTICAS DE PRODUCTOS:');
  console.log(`   Total: ${products.length}`);
  console.log(`   Disponibles: ${available.length}`);
  console.log(`   Categorías: ${categories.length} (${categories.join(', ')})`);
  console.log(`   Stock total: ${products.reduce((sum, p) => sum + (p.stock || 0), 0)}`);
  
  return {
    total: products.length,
    available: available.length,
    categories: categories.length,
    totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0)
  };
};

