// ====== PRELOADER ======
function markAppVisualReady() {
  document.body.classList.add('loaded');
  const loadingElement = document.getElementById('loading-status');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', markAppVisualReady, { once: true });
} else {
  markAppVisualReady();
}

window.addEventListener('load', markAppVisualReady);

// ====== Inicializar AOS ======
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 800, once: true });
}

const catalogState = {
  page: 1,
  pageSize: 12,
  category: 'all'
};

// ====== Renderizar catálogo de productos ======
window.renderProductCatalog = async function(options = {}) {
  //console.log('🔄 Iniciando renderizado del catálogo...');
  
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) {
    //console.error('❌ No se encontró el contenedor .product-grid');
    return;
  }

  // Mostrar indicador de carga
  productGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 2rem; text-align: center;">⏳ Cargando productos...</p>';

  try {
    const catalogPage = await productManager.loadCatalogPage({
      page: catalogState.page,
      pageSize: catalogState.pageSize,
      category: catalogState.category
    });
    const products = catalogPage.products;
    const totalProducts = catalogPage.total;
    const visibleProducts = products;
    
    //console.log(`📦 ${products.length} productos disponibles para renderizar`);
    
    // Limpiar contenedor
    productGrid.innerHTML = '';

    if (totalProducts === 0) {
      productGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 4rem; text-align: center; color: #666;">
          <i class="fas fa-box-open" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem; display: block;"></i>
          <h3 style="margin-bottom: 1rem; color: #333;">¡Próximamente productos disponibles!</h3>
          <p style="margin: 0; font-size: 1rem;">Estamos preparando nuestro catálogo de hermosos accesorios para el cabello.</p>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #999;">Vuelve pronto para ver todas nuestras creaciones.</p>
        </div>
      `;
      return;
    }

    // Renderizar cada producto
    const fragment = document.createDocumentFragment();

    visibleProducts.forEach((product) => {
      {
        //console.log(`🏷️ Renderizando producto: ${product.name} (${product.id})`);
        
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.category = product.category;
        card.dataset.productId = product.id;
        card.setAttribute('data-aos', 'zoom-in');

        //console.log(`🏷️ Asignando categoría "${product.category}" al producto "${product.name}"`);

        const stockBadge = product.stock > 0 
          ? `<span class="stock-badge ${product.stock <= 5 ? 'low-stock' : ''}">Stock: ${product.stock}</span>` 
          : '<span class="stock-badge out-of-stock">Agotado</span>';

        card.innerHTML = `
          <div class="card-image" onclick="openProductModal('${product.id}')">
            ${generateProductGalleryHTML(product)}
            ${stockBadge}
          </div>
          <div class="card-content" onclick="openProductModal('${product.id}')">
            <h3>${product.name}</h3>
            ${product.color ? `<p>Color: ${product.color}</p>` : ''}
            ${product.size ? `<p>Tamaño: ${product.size}</p>` : ''}
            <p class="price">$${product.price.toLocaleString('es-CO')}</p>
          </div>
          <div class="card-actions">
            <button class="btn add-to-cart-btn" onclick="addToCart('${product.id}')" 
              ${product.stock === 0 ? 'disabled' : ''}>
              <i class="fas fa-shopping-cart"></i> Agregar al Carrito
            </button>
            <button class="btn btn-secondary view-details-btn" onclick="openProductModal('${product.id}')">
              <i class="fas fa-eye"></i> Ver Detalles
            </button>
          </div>
        `;

        //console.log(`✅ Producto ${product.name} agregado al DOM`);
        fragment.appendChild(card);
        
        // Re-inicializar AOS para las nuevas cards
      }
    });

    //console.log('✅ Catálogo renderizado exitosamente');
    
    productGrid.appendChild(fragment);

    renderCatalogPagination(productGrid, totalProducts);

    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }

    // Re-inicializar filtros después de que se rendericen los productos
    initFilters();
    
  } catch (error) {
    //console.error('❌ Error renderizando catálogo:', error);
    productGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 2rem; text-align: center; color: red;">❌ Error cargando productos. Reintentando...</p>';
    
    // Reintentar después de 2 segundos
    setTimeout(() => {
      renderProductCatalog();
    }, 5000);
  }
};

// ====== MODAL DE DETALLES DEL PRODUCTO ======
let currentModalProduct = null;

window.openProductModal = async function(productId) {
  //console.log('🔍 Abriendo modal para producto:', productId);
  
  try {
    // Verificar que productManager esté disponible y si no, esperar a que se inicialice
    let product = productManager.getProduct(productId);
    if (!product && !productManager.fullyInitialized) {
      //console.log('⏳ Esperando a que ProductManager se inicialice...');
      await productManager.initialize();
      product = productManager.getProduct(productId);
    }
    
    
    if (!product) {
      //console.error('❌ Producto no encontrado:', productId);
      showNotification('Producto no encontrado', 'error');
      return;
    }
    
    currentModalProduct = product;
    
    // Actualizar contenido del modal
    updateModalContent(product);
    
    // Mostrar modal
    const modal = document.getElementById('product-details-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      //console.log('✅ Modal abierto para:', product.name);
    } else {
      //console.error('❌ No se encontró el modal en el DOM');
    }
    
  } catch (error) {
    //console.error('❌ Error abriendo modal:', error);
    showNotification('Error al abrir detalles del producto', 'error');
  }
};

window.closeProductModal = function() {
  const modal = document.getElementById('product-details-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  currentModalProduct = null;
  
  // Reset cantidad
  const quantityInput = document.getElementById('modal-quantity');
  if (quantityInput) quantityInput.value = 1;
  
  //console.log('✅ Modal cerrado');
};

function updateModalContent(product) {
  //console.log('🔄 Actualizando contenido del modal profesional para:', product.name);
  
  try {
    // Galería de imágenes del modal (ahora con soporte completo para múltiples imágenes)
    const modalImageContainer = document.getElementById('modal-image-container');
    if (modalImageContainer) {
      // Si tiene múltiples imágenes, crear galería completa profesional
      if (product.images && product.images.length > 1) {
        const modalGalleryId = `modal-gallery-${product.id}`;
        const mainImage = product.images.find(img => img.primary) || product.images[0];
        
        modalImageContainer.innerHTML = `
          <div class="professional-gallery" id="${modalGalleryId}" data-current-index="0" data-images='${JSON.stringify(product.images.map(img => ({url: img.url, alt: img.alt})))}'>
            <div class="main-image-display">
              <img id="${modalGalleryId}-main" src="${mainImage.url}" alt="${mainImage.alt}">
              
              <!-- Contador de imágenes -->
              <div class="image-counter-new">
                <span id="${modalGalleryId}-counter">1 / ${product.images.length}</span>
              </div>
              
              <!-- Flechas de navegación -->
              <div class="navigation-arrows">
                <button class="nav-arrow prev-arrow" onclick="navigateGallery('${modalGalleryId}', -1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button class="nav-arrow next-arrow" onclick="navigateGallery('${modalGalleryId}', 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            
            <div class="thumbnails-gallery">
              ${product.images.map((image, index) => {
                const isActive = image.primary || index === 0;
                return `
                  <div class="gallery-thumbnail-new ${isActive ? 'active' : ''}" 
                       onclick="selectGalleryImage('${modalGalleryId}', ${index})">
                    <img src="${image.url}" alt="${image.alt}" onerror="this.src='recursos/lunilogo.png'">
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else {
        // Solo una imagen - mostrar imagen simple pero con diseño profesional
        const imageUrl = getProductMainImageUrl(product);
        modalImageContainer.innerHTML = `
          <div class="single-image-display">
            <img src="${imageUrl}" alt="${product.name}" 
                 onerror="this.src='recursos/lunilogo.png'">
          </div>
        `;
      }
      
      //console.log('📷 Galería del modal profesional actualizada');
    }
    
    // Información básica
    const nameElement = document.getElementById('modal-product-name');
    if (nameElement) nameElement.textContent = product.name;
    
    const categoryElement = document.getElementById('modal-product-category');
    if (categoryElement) categoryElement.textContent = formatCategoryName(product.category);
    
    const priceElement = document.getElementById('modal-product-price');
    if (priceElement) priceElement.textContent = product.price.toLocaleString('es-CO');
    
    // Badge de stock nuevo
    const stockBadgeNew = document.querySelector('.stock-badge-new');
    if (stockBadgeNew) {
      if (product.stock > 5) {
        stockBadgeNew.innerHTML = `<i class="fas fa-check-circle"></i> ${product.stock} disponibles`;
        stockBadgeNew.className = 'stock-badge-new in-stock-new';
      } else if (product.stock > 0) {
        stockBadgeNew.innerHTML = `<i class="fas fa-exclamation-circle"></i> ¡Solo ${product.stock} disponibles!`;
        stockBadgeNew.className = 'stock-badge-new low-stock-new';
      } else {
        stockBadgeNew.innerHTML = `<i class="fas fa-times-circle"></i> Agotado`;
        stockBadgeNew.className = 'stock-badge-new out-of-stock-new';
      }
    }
    
    // Especificaciones
    const colorElement = document.getElementById('modal-product-color');
    if (colorElement) colorElement.textContent = product.color || 'No especificado';
    
    const sizeElement = document.getElementById('modal-product-size');
    if (sizeElement) sizeElement.textContent = product.size || 'No especificado';
    
    const stockElement = document.getElementById('modal-product-stock');
    if (stockElement) stockElement.textContent = product.stock || 0;
    
    const descriptionElement = document.getElementById('modal-product-description');
    if (descriptionElement) {
      const description = product.description || 'Producto de alta calidad diseñado para brindar comodidad y estilo. Perfecto para cualquier ambiente.';
      // Render as bullet list with emoji, split by line breaks
      const descItems = description.split(/\r?\n|<br\s*\/?>/).filter(line => line.trim());
      if (descItems.length > 1) {
        descriptionElement.innerHTML = `<ul class="product-description-list">` +
          descItems.map(item => `<li>${item.trim()}</li>`).join('') +
          `</ul>`;
      } else {
        descriptionElement.innerHTML = `<p>${description}</p>`;
      }
    }
    
    // Botón de agregar al carrito y selector de cantidad
    const addButton = document.getElementById('modal-add-to-cart');
    const quantityInput = document.getElementById('modal-quantity');
    
    if (addButton && quantityInput) {
      if (product.stock > 0) {
        addButton.disabled = false;
        quantityInput.max = Math.min(product.stock, 10);
        quantityInput.value = 1;
      } else {
        addButton.disabled = true;
        quantityInput.max = 0;
        quantityInput.value = 0;
      }
    }
    
    //console.log('✅ Contenido del modal actualizado');
  } catch (error) {
    //console.error('❌ Error actualizando contenido del modal:', error);
  }
}

window.changeModalQuantity = function(change) {
  const quantityInput = document.getElementById('modal-quantity');
  const currentValue = parseInt(quantityInput.value) || 1;
  const newValue = currentValue + change;
  const maxStock = parseInt(quantityInput.max) || 1;
  
  if (newValue >= 1 && newValue <= maxStock) {
    quantityInput.value = newValue;
  }
};

window.addToCartFromModal = function() {
  if (!currentModalProduct) {
    //console.error('❌ No hay producto seleccionado');
    return;
  }
  
  const quantity = parseInt(document.getElementById('modal-quantity').value) || 1;
  
  // Agregar al carrito con la cantidad especificada
  for (let i = 0; i < quantity; i++) {
    addToCart(currentModalProduct.id);
  }
  
  // Cerrar modal
  closeProductModal();
  
  // Mostrar notificación
  showNotification(`✅ ${quantity}x ${currentModalProduct.name} agregado${quantity > 1 ? 's' : ''} al carrito`, 'success');
};

function formatCategoryName(category) {
  const categoryNames = {
    'ganchitos': 'Ganchitos',
    'fruticas': 'Fruticas', 
    'animalitos': 'Animalitos',
    'naturales': 'Naturales',
    'pinzasclasicas': 'Pinzas Clásicas',
    'floresmedianas': 'Flores Medianas',
    'floresmini': 'Flores Mini',
    'sets': 'Sets'
  };
  
  return categoryNames[category] || category;
}

// Cerrar modal con ESC o clic fuera
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.getElementById('product-details-modal');
    if (modal && modal.style.display === 'flex') {
      closeProductModal();
    }
  }
});

document.addEventListener('click', function(event) {
  const modal = document.getElementById('product-details-modal');
  if (event.target === modal && modal.style.display === 'flex') {
    closeProductModal();
  }
});

// ====== GENERAR FILTROS DINÁMICOS ======
async function generateCategoryFilters() {
  try {
    //console.log('🔄 Generando filtros de categoría...');
    
    const filtersContainer = document.getElementById('category-filters');
    if (!filtersContainer) {
      //console.error('❌ Contenedor de filtros no encontrado');
      return;
    }
    
    // Obtener categorías activas de la base de datos
    await categoryManager.initialize();
    const categories = categoryManager.getActiveCategories();
    
    //console.log(`📁 Categorías activas encontradas: ${categories.length}`);
    
    // Crear HTML para filtros
    let filtersHTML = `<button class="filter-btn ${catalogState.category === 'all' ? 'active' : ''}" data-category="all">Todos</button>`;
    
    categories.forEach(category => {
      const categoryName = category.name || formatCategoryName(category.slug);
      const icon = category.icon ? `${category.icon} ` : '';
      filtersHTML += `<button class="filter-btn ${catalogState.category === category.slug ? 'active' : ''}" data-category="${category.slug}">${icon}${categoryName}</button>`;
    });
    
    // Insertar en el DOM
    filtersContainer.innerHTML = filtersHTML;
    
    //console.log('✅ Filtros de categoría generados dinámicamente');
    
    // Inicializar eventos después de generar botones
    setTimeout(() => {
      initFilters();
    }, 100);
    
  } catch (error) {
    //console.error('❌ Error generando filtros:', error);
    
    // Fallback: mostrar filtros básicos
    const filtersContainer = document.getElementById('category-filters');
    if (filtersContainer) {
      filtersContainer.innerHTML = '<button class="filter-btn active" data-category="all">Todos</button>';
    }
  }
}

// ====== FUNCIONES HELPER PARA IMÁGENES ======

/**
 * Extrae la URL de la imagen principal de un producto
 * Maneja tanto el formato simple (URL string) como el formato JSON con múltiples imágenes
 */
function getProductMainImageUrl(product, width = 700) {
  if (!product.image) {
    return 'recursos/lunilogo.png';
  }
  
  // Si product.images ya está parseado, usar la imagen principal
  if (product.images && product.images.length > 0) {
    const mainImage = product.images.find(img => img.primary) || product.images[0];
      return optimizeImageUrl(mainImage.url || mainImage, width);
  }
  
  try {
    // Intentar parsear como JSON
    const imageData = JSON.parse(product.image);
    
    // Si es un objeto con main y additional
    if (imageData && typeof imageData === 'object' && imageData.main) {
      return optimizeImageUrl(imageData.main, width);
    } else {
      // Si el JSON no tiene la estructura esperada, usar como imagen simple
      return optimizeImageUrl(product.image, width);
    }
  } catch (error) {
    // No es JSON, es una URL simple
    return optimizeImageUrl(product.image, width);
  }
}

function optimizeImageUrl(url, width = 700) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || url.includes('/f_auto,')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}

// ====== FUNCIONES PARA MÚLTIPLES IMÁGENES ======
function generateProductGalleryHTML(product) {
  // En el catálogo, siempre mostrar solo la imagen principal para un look más limpio
  const mainImageUrl = getProductMainImageUrl(product, 480);
  return `<img src="${mainImageUrl}" alt="${product.name}" onerror="this.src='recursos/lunilogo.png'" loading="lazy">`;
}

function switchGalleryImage(galleryId, imageUrl, imageAlt, thumbnail) {
  // Cambiar imagen principal
  const mainImage = document.getElementById(`${galleryId}-main`);
  if (mainImage) {
    mainImage.src = imageUrl;
    mainImage.alt = imageAlt;
  }
  
  // Actualizar thumbnails activos
  const thumbnails = document.querySelectorAll(`#${galleryId}-thumbnails .gallery-thumbnail`);
  thumbnails.forEach(thumb => thumb.classList.remove('active'));
  
  if (thumbnail) {
    thumbnail.classList.add('active');
  }
}

/**
 * Navegar por la galería con flechas (Amazon style)
 */
function navigateGallery(galleryId, direction) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;
  
  const currentIndex = parseInt(gallery.dataset.currentIndex || '0');
  const images = JSON.parse(gallery.dataset.images || '[]');
  
  if (images.length <= 1) return;
  
  const newIndex = (currentIndex + direction + images.length) % images.length;
  selectGalleryImage(galleryId, newIndex);
}

/**
 * Seleccionar imagen específica por índice
 */
function selectGalleryImage(galleryId, index) {
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;
  
  const images = JSON.parse(gallery.dataset.images || '[]');
  if (index < 0 || index >= images.length) return;
  
  // Actualizar imagen principal
  const mainImage = document.getElementById(`${galleryId}-main`);
  if (mainImage) {
    mainImage.src = images[index].url;
    mainImage.alt = images[index].alt;
  }
  
  // Actualizar contador
  const counter = document.getElementById(`${galleryId}-counter`);
  if (counter) {
    counter.textContent = `${index + 1} / ${images.length}`;
  }
  
  // Actualizar thumbnails activos
  const thumbnails = document.querySelectorAll(`#${galleryId}-thumbnails .gallery-thumbnail`);
  thumbnails.forEach((thumb, thumbIndex) => {
    thumb.classList.toggle('active', thumbIndex === index);
  });
  
  // Guardar índice actual
  gallery.dataset.currentIndex = index.toString();
}

// Hacer funciones disponibles globalmente
window.generateProductGalleryHTML = generateProductGalleryHTML;
window.switchGalleryImage = switchGalleryImage;
window.navigateGallery = navigateGallery;
window.selectGalleryImage = selectGalleryImage;
window.getProductMainImageUrl = getProductMainImageUrl;

window.goToCatalogPage = function(page) {
  catalogState.page = Math.max(1, page);
  renderProductCatalog({ skipInitialize: true });
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function renderCatalogPagination(container, totalProducts) {
  const totalPages = Math.ceil(totalProducts / catalogState.pageSize);
  if (totalPages <= 1) return;

  catalogState.page = Math.min(catalogState.page, totalPages);

  const pagination = document.createElement('nav');
  pagination.className = 'catalog-pagination';
  pagination.setAttribute('aria-label', 'Paginacion del catalogo');

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  pagination.innerHTML = `
    <button class="catalog-page-btn" ${catalogState.page === 1 ? 'disabled' : ''} onclick="goToCatalogPage(${catalogState.page - 1})">
      Anterior
    </button>
    ${pages.map(page => `
      <button class="catalog-page-btn ${page === catalogState.page ? 'active' : ''}" onclick="goToCatalogPage(${page})">
        ${page}
      </button>
    `).join('')}
    <button class="catalog-page-btn" ${catalogState.page === totalPages ? 'disabled' : ''} onclick="goToCatalogPage(${catalogState.page + 1})">
      Siguiente
    </button>
  `;

  container.appendChild(pagination);
}

// ====== FILTROS DE PRODUCTOS ======
function initFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".card");

  //console.log(`🔍 Inicializando filtros: ${filterBtns.length} botones, ${cards.length} productos`);

  // Debug: Mostrar categorías disponibles
  debugCategories();

  filterBtns.forEach(btn => {
    // Remover listeners existentes para evitar duplicados
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  // Reinicializar con los nuevos botones
  const newFilterBtns = document.querySelectorAll(".filter-btn");
  
  newFilterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const category = btn.dataset.category;
      catalogState.category = category;
      catalogState.page = 1;
      newFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProductCatalog({ skipInitialize: true });
      return;
      //console.log(`📂 Filtro seleccionado: "${category}"`);

      const allCards = document.querySelectorAll(".card");
      let visibleCount = 0;

      allCards.forEach(card => {
        const cardCategory = card.dataset.category;
        //console.log(`🏷️ Producto: categoria="${cardCategory}", filtro="${category}"`);
        
        if(category === "all" || cardCategory === category){
          card.classList.remove("hidden");
          card.style.display = "block";
          visibleCount++;
        } else {
          card.classList.add("hidden");
          card.style.display = "none";
        }
      });

      //console.log(`👀 ${visibleCount} productos visibles después del filtro`);

      // Activar visualmente el botón seleccionado
      newFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Re-inicializar AOS para elementos visibles
      if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
      }
    });
  });

  // Activar el filtro "Todos" por defecto
  const allBtn = document.querySelector('.filter-btn[data-category="all"]');
  if (allBtn && !document.querySelector('.filter-btn.active')) {
    allBtn.classList.add('active');
  }
}

// Función auxiliar para debug de categorías
function debugCategories() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".card");

  //console.log("🔍 DEBUG CATEGORÍAS:");
  
  // Mostrar categorías de botones
  const buttonCategories = Array.from(filterBtns).map(btn => btn.dataset.category);
  //console.log("📱 Categorías en botones:", buttonCategories);
  
  // Mostrar categorías de productos
  const productCategories = Array.from(cards).map(card => card.dataset.category);
  const uniqueProductCategories = [...new Set(productCategories)];
  //console.log("🏷️ Categorías en productos:", uniqueProductCategories);
  
  // Identificar categorías faltantes
  const missingInProducts = buttonCategories.filter(cat => cat !== 'all' && !uniqueProductCategories.includes(cat));
  const missingInButtons = uniqueProductCategories.filter(cat => !buttonCategories.includes(cat));
  
  if (missingInProducts.length > 0) {
    //console.warn("⚠️ Categorías en botones sin productos:", missingInProducts);
  }
  
  if (missingInButtons.length > 0) {
    //console.warn("⚠️ Categorías en productos sin botones:", missingInButtons);
  }
}

// ====== Agregar al carrito ======
window.addToCart = async function(productId) {
  //console.log('🛒 Intentando agregar al carrito:', productId);
  
  // Esperar a que el carrito esté inicializado
  let attempts = 0;
  while (typeof cart === 'undefined' && attempts < 50) {
    //console.log('⏳ Esperando que el carrito se inicialice...');
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  if (typeof cart === 'undefined') {
    //console.error('❌ Cart no pudo inicializarse');
    showNotification('Sistema de carrito no disponible', 'error');
    return;
  }

  try {
    let product = productManager.getProduct(productId);
    if (!product && !productManager.fullyInitialized) {
      await productManager.initialize();
      product = productManager.getProduct(productId);
    }

    if (!productManager.initialized) {
      showNotification('Los productos aun se estan cargando. Intenta de nuevo.', 'error');
      return;
    }

    if (!product) {
      //console.error('❌ Producto no encontrado:', productId);
      showNotification('Producto no encontrado', 'error');
      return;
    }

    //console.log('📦 Producto encontrado:', product.name);

    // Agregar directamente al carrito (sin modal de opciones por ahora)
    const result = cart.addItem(productId, 1);
    //console.log('🛒 Resultado de agregar al carrito:', result);
    
    if (result.success) {
      showNotification(result.message, 'success');
      // Forzar actualización de la UI
      setTimeout(() => {
        cart.updateCartUI();
      }, 100);
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    //console.error('❌ Error en addToCart:', error);
    console.error('Error en addToCart:', error);
    showNotification(error.message || 'Error al agregar el producto', 'error');
  }
}

// ====== Mostrar opciones de producto ======
async function showProductOptions(productId) {
  await productManager.initialize();
  const product = productManager.getProduct(productId);
  if (!product) return;

  let optionsHTML = '<div class="product-options-modal">';
  optionsHTML += `<h3>${product.name}</h3>`;
  
  // Agregar información de stock
  const stockInfo = product.stock > 0 
    ? `<div class="modal-stock-info">
         <span class="stock-badge ${product.stock <= 5 ? 'low-stock' : ''}">
           Stock disponible: ${product.stock} unidades
         </span>
       </div>` 
    : '<div class="modal-stock-info"><span class="stock-badge out-of-stock">Producto agotado</span></div>';
  
  optionsHTML += stockInfo;
  
  if (product.color) {
    optionsHTML += `<label>Color: <input type="text" id="option-color" placeholder="${product.color}"></label>`;
  }
  
  if (product.size) {
    optionsHTML += `<label>Tamaño: <select id="option-size">`;
    const sizes = product.size.split(',').map(s => s.trim());
    sizes.forEach(size => {
      optionsHTML += `<option value="${size}">${size}</option>`;
    });
    optionsHTML += `</select></label>`;
  }
  
  optionsHTML += `<label>Cantidad: <input type="number" id="option-quantity" value="1" min="1" max="${product.stock || 10}"></label>`;
  optionsHTML += `<div class="options-actions">`;
  optionsHTML += `<button onclick="addToCartWithOptions('${productId}')" class="btn">Agregar al Carrito</button>`;
  optionsHTML += `<button onclick="closeProductOptions()" class="btn btn-secondary">Cancelar</button>`;
  optionsHTML += `</div></div>`;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'product-options-modal';
  modal.innerHTML = optionsHTML;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

window.addToCartWithOptions = function(productId) {
  const color = document.getElementById('option-color')?.value || '';
  const size = document.getElementById('option-size')?.value || '';
  const quantity = parseInt(document.getElementById('option-quantity')?.value || 1);

  const result = cart.addItem(productId, quantity, color, size);
  closeProductOptions();
  
  if (result.success) {
    showNotification(result.message, 'success');
    // Forzar actualización de la UI
    setTimeout(() => {
      cart.updateCartUI();
    }, 100);
  } else {
    showNotification(result.message, 'error');
  }
}

function closeProductOptions() {
  const modal = document.getElementById('product-options-modal');
  if (modal) {
    modal.remove();
  }
}

// ====== Abrir carrito ======
window.openCart = function() {
  const cartModal = document.getElementById('cart-modal');
  if (cartModal) {
    renderCart();
    cartModal.style.display = 'flex';
  }
}

window.closeCart = function() {
  const cartModal = document.getElementById('cart-modal');
  if (cartModal) {
    cartModal.style.display = 'none';
  }
}

// ====== Renderizar carrito ======
function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  if (!cartItems) return;

  const items = cart.getItems();
  cartItems.innerHTML = '';

  if (items.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; padding: 2rem;">Tu carrito está vacío</p>';
    if (cartTotal) cartTotal.textContent = '$0';
    return;
  }

  items.forEach((item, index) => {
    const product = item.product;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${getProductMainImageUrl(product)}" alt="${product.name}" onerror="this.src='recursos/lunilogo.png'">
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        ${item.color ? `<p>Color: ${item.color}</p>` : ''}
        ${item.size ? `<p>Tamaño: ${item.size}</p>` : ''}
        <p>$${product.price.toLocaleString('es-CO')} c/u</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateCartQuantity(${index}, ${item.quantity - 1})" class="qty-btn">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateCartQuantity(${index}, ${item.quantity + 1})" class="qty-btn">+</button>
        <button onclick="removeFromCart(${index})" class="remove-btn"><i class="fas fa-trash"></i></button>
      </div>
      <div class="cart-item-total">
        $${(product.price * item.quantity).toLocaleString('es-CO')}
      </div>
    `;
    cartItems.appendChild(itemDiv);
  });

  if (cartTotal) {
    cartTotal.textContent = `$${cart.getTotal().toLocaleString('es-CO')}`;
  }
}

window.updateCartQuantity = function(index, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(index);
    return;
  }
  const result = cart.updateQuantity(index, newQuantity);
  if (result && !result.success) {
    showNotification(result.message, 'error');
  }
  renderCart();
}

window.removeFromCart = function(index) {
  cart.removeItem(index);
  renderCart();
}

// ====== Notificaciones ======
window.showNotification = function(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// ====== MODALES EXISTENTES ======
const nequiModal = document.getElementById('nequiModal');
const nequiBtn = document.getElementById('btn-nequi');
const closeModal = document.getElementById('closeModal');

if(nequiBtn && nequiModal && closeModal){
  nequiBtn.addEventListener('click', () => {
    nequiModal.style.display = 'flex';
  });
  closeModal.addEventListener('click', () => {
    nequiModal.style.display = 'none';
  });
}

window.addEventListener('click', (e) => {
  if(e.target === nequiModal) nequiModal.style.display = 'none';
});

// ====== Inicializar cuando el DOM esté listo ======
// ====== Carga bajo demanda del panel admin ======
const adminScriptSources = [
  'js/cloudinary.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'js/invoice.js',
  'js/statistics.js',
  'js/admin.js'
];

const loadedScriptPromises = {};
let adminPanelPromise = null;
let adminSessionRestoreStarted = false;

function getStoredAdminUser() {
  try {
    const storedUser = localStorage.getItem('luni_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    return null;
  }
}

function createHeaderAdminButton() {
  if (document.getElementById('admin-btn')) {
    return;
  }

  const userActions = document.querySelector('.user-actions');
  const logoutBtn = document.getElementById('header-logout-btn');
  if (!userActions || !logoutBtn) {
    return;
  }

  const adminBtn = document.createElement('button');
  adminBtn.id = 'admin-btn';
  adminBtn.className = 'btn-admin-header';
  adminBtn.innerHTML = '<i class="fas fa-cogs"></i><span class="btn-text">Panel Admin</span>';
  adminBtn.addEventListener('click', async () => {
    try {
      adminBtn.disabled = true;
      const panel = await ensureAdminPanel();
      panel.showAdminPanel();
    } catch (error) {
      showNotification('No se pudo cargar el panel de administracion', 'error');
    } finally {
      adminBtn.disabled = false;
    }
  });

  userActions.insertBefore(adminBtn, logoutBtn);
}

function syncHeaderAuthUI() {
  const loginBtn = document.getElementById('header-login-btn');
  const userMenu = document.getElementById('user-menu');
  const usernameSpan = document.getElementById('current-username');
  const storedAuth = localStorage.getItem('luni_admin_auth') === 'true';
  const currentUser = window.authSystem?.getCurrentUser?.() || getStoredAdminUser();
  const isLoggedIn = storedAuth || Boolean(currentUser);
  const displayUser = currentUser || { name: 'Administrador', username: 'Admin' };

  if (isLoggedIn) {
    if (currentUser && localStorage.getItem('luni_admin_auth') !== 'true') {
      localStorage.setItem('luni_admin_auth', 'true');
    }
    if (loginBtn) loginBtn.style.setProperty('display', 'none', 'important');
    if (userMenu) userMenu.style.setProperty('display', 'flex', 'important');
    if (usernameSpan) usernameSpan.textContent = displayUser.name || displayUser.username || 'Admin';
    createHeaderAdminButton();
    return;
  }

  if (loginBtn) loginBtn.style.setProperty('display', 'flex', 'important');
  if (userMenu) userMenu.style.setProperty('display', 'none', 'important');

  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) adminBtn.remove();
}

window.syncHeaderAuthUI = syncHeaderAuthUI;
window.addEventListener('luni-auth-changed', syncHeaderAuthUI);

function setupHeaderLogoutFallback() {
  const logoutBtn = document.getElementById('header-logout-btn');
  if (!logoutBtn || logoutBtn.hasAttribute('data-main-logout-listener')) {
    return;
  }

  logoutBtn.setAttribute('data-main-logout-listener', 'true');
  logoutBtn.addEventListener('click', () => {
    if (window.authSystem?.logout) {
      window.authSystem.logout();
      return;
    }

    localStorage.removeItem('luni_current_user');
    localStorage.removeItem('luni_admin_auth');
    localStorage.removeItem('luni_auth_provider');
    window.location.reload();
  });
}

function loadScriptOnce(src) {
  if (loadedScriptPromises[src]) {
    return loadedScriptPromises[src];
  }

  loadedScriptPromises[src] = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(script);
  });

  return loadedScriptPromises[src];
}

async function ensureAdminPanel() {
  if (window.adminPanel) {
    return window.adminPanel;
  }

  if (adminPanelPromise) {
    return adminPanelPromise;
  }

  adminPanelPromise = (async () => {
    for (const src of adminScriptSources) {
      await loadScriptOnce(src);
    }

    if (!window.adminPanel) {
      throw new Error('El panel admin no se inicializo correctamente');
    }

    window.adminPanel.updateAuthUI();
    window.adminPanel.setupHeaderListeners();
    return window.adminPanel;
  })().finally(() => {
    adminPanelPromise = null;
  });

  return adminPanelPromise;
}

function setupLazyAdminAccess() {
  syncHeaderAuthUI();
  setupHeaderLogoutFallback();

  const loginBtn = document.getElementById('header-login-btn');
  if (loginBtn && !loginBtn.hasAttribute('data-lazy-admin-listener')) {
    loginBtn.setAttribute('data-lazy-admin-listener', 'true');
    loginBtn.setAttribute('data-listener', 'true');
    loginBtn.addEventListener('click', async () => {
      try {
        loginBtn.disabled = true;
        const panel = await ensureAdminPanel();
        panel.showLoginModal();
      } catch (error) {
        showNotification('No se pudo cargar el panel de administracion', 'error');
      } finally {
        loginBtn.disabled = false;
      }
    });
  }

  const hasStoredAdminSession = localStorage.getItem('luni_admin_auth') === 'true' || Boolean(getStoredAdminUser());
  if (hasStoredAdminSession && !adminSessionRestoreStarted) {
    adminSessionRestoreStarted = true;
    setTimeout(async () => {
      try {
        const panel = await ensureAdminPanel();
        panel.updateAuthUI();
        syncHeaderAuthUI();
      } catch (error) {
        syncHeaderAuthUI();
      }
    }, 0);
  }
}

window.ensureAdminPanel = ensureAdminPanel;

document.addEventListener('DOMContentLoaded', () => {
  setupLazyAdminAccess();
  //console.log('🚀 DOM cargado, iniciando aplicación...');
  
  // Actualizar UI de autenticación
  if (typeof adminPanel !== 'undefined' && adminPanel) {
    adminPanel.updateAuthUI();
    adminPanel.setupHeaderListeners(); // Función que sí existe
  } else {
    //console.warn('⚠️ adminPanel no está disponible aún');
    // Reintentar después de un pequeño delay
    setTimeout(() => {
      if (typeof adminPanel !== 'undefined' && adminPanel) {
        adminPanel.updateAuthUI();
        adminPanel.setupHeaderListeners();
        //console.log('✅ adminPanel inicializado con delay');
      }
    }, 100);
  }
  
  // Configurar event listeners básicos
  setupEventListeners();
  
  // Inicializar aplicación después de un pequeño delay para móvil
  setTimeout(() => {
    initializeApp();
  }, 100);
});
// ====== Configurar Event Listeners ======
function setupEventListeners() {
  // Configurar botón de carrito
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }

  // Configurar botón de checkout
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => checkout.openCheckout());
  }

  // Configurar cierre de modales
  const closeCartBtn = document.getElementById('close-cart');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCart);
  }

  const closeCheckoutBtn = document.getElementById('close-checkout');
  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => checkout.closeCheckout());
  }

  // Configurar envío por WhatsApp
  const sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => checkout.sendToWhatsApp());
  }
}

// Hacer función disponible globalmente
window.generateCategoryFilters = generateCategoryFilters;

// ====== Inicialización de la aplicación ======
async function initializeApp() {
  try {
    //console.log('🔄 Inicializando sistemas...');
    
    // Verificar que existe la grilla de productos
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) {
      //console.error('❌ No se encontró .product-grid en el DOM');
      return;
    }
    
    //console.log('✅ Grilla de productos encontrada');
    
    // El catalogo publico carga productos por paginas para evitar traer todo al inicio.
    if (typeof cart !== 'undefined' && cart?.updateCartUI) {
      cart.updateCartUI();
    }
    //console.log('✅ CategoryManager inicializado');
    
    //console.log('✅ ProductManager inicializado');
    
    // Renderizar catálogo
    await renderProductCatalog();
    //console.log('✅ Catálogo renderizado');
    
    // Generar filtros dinámicos y configurar eventos
    {
      await generateCategoryFilters();
      //console.log('✅ Filtros dinámicos generados');
    }
    
    //console.log('✅ Aplicación inicializada correctamente');
  } catch (error) {
    //console.error('❌ Error inicializando la aplicación:', error);
    
    // Reintento después de 1 segundo
    setTimeout(() => {
      //console.log('🔄 Reintentando inicialización...');
      initializeApp();
    }, 1000);
  }
}


