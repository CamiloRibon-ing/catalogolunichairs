// Script principal que integra todo el sistema
// ====== PRELOADER ======
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// ====== Inicializar AOS ======
AOS.init({ duration: 800, once: true });

// ====== Renderizar catálogo de productos ======
window.renderProductCatalog = async function() {
  console.log('🔄 Iniciando renderizado del catálogo...');
  
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) {
    console.error('❌ No se encontró el contenedor .product-grid');
    return;
  }

  // Mostrar indicador de carga
  productGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 2rem; text-align: center;">⏳ Cargando productos...</p>';

  try {
    await productManager.initialize();
    const products = productManager.getAvailableProducts();
    
    console.log(`📦 ${products.length} productos disponibles para renderizar`);
    
    // Limpiar contenedor
    productGrid.innerHTML = '';

    if (products.length === 0) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 2rem; text-align: center;">📋 No hay productos disponibles</p>';
      return;
    }

    // Renderizar cada producto
    products.forEach((product, index) => {
      setTimeout(() => {
        console.log(`🏷️ Renderizando producto: ${product.name} (${product.id})`);
        
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.category = product.category;
        card.dataset.productId = product.id;
        card.setAttribute('data-aos', 'zoom-in');

        console.log(`🏷️ Asignando categoría "${product.category}" al producto "${product.name}"`);

        const stockBadge = product.stock > 0 
          ? `<span class="stock-badge ${product.stock <= 5 ? 'low-stock' : ''}">Stock: ${product.stock}</span>` 
          : '<span class="stock-badge out-of-stock">Agotado</span>';

        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" onerror="this.src='recursos/lunilogo.png'" loading="lazy">
          <h3>${product.name}</h3>
          ${product.color ? `<p>Color: ${product.color}</p>` : ''}
          ${product.size ? `<p>Tamaño: ${product.size}</p>` : ''}
          <p class="price">$${product.price.toLocaleString('es-CO')}</p>
          ${stockBadge}
          <button class="btn add-to-cart-btn" onclick="addToCart('${product.id}')" 
            ${product.stock === 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
          </button>
        `;

        console.log(`✅ Producto ${product.name} agregado al DOM`);
        productGrid.appendChild(card);
        
        // Re-inicializar AOS para las nuevas cards
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }, index * 50); // Stagger la animación
    });

    console.log('✅ Catálogo renderizado exitosamente');
    
    // Re-inicializar filtros después de que se rendericen los productos
    setTimeout(() => {
      initFilters();
    }, products.length * 50 + 100);
    
  } catch (error) {
    console.error('❌ Error renderizando catálogo:', error);
    productGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 2rem; text-align: center; color: red;">❌ Error cargando productos. Reintentando...</p>';
    
    // Reintentar después de 2 segundos
    setTimeout(() => {
      renderProductCatalog();
    }, 2000);
  }
};

// ====== FILTROS DE PRODUCTOS ======
function initFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".card");

  console.log(`🔍 Inicializando filtros: ${filterBtns.length} botones, ${cards.length} productos`);

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
      console.log(`📂 Filtro seleccionado: "${category}"`);

      const allCards = document.querySelectorAll(".card");
      let visibleCount = 0;

      allCards.forEach(card => {
        const cardCategory = card.dataset.category;
        console.log(`🏷️ Producto: categoria="${cardCategory}", filtro="${category}"`);
        
        if(category === "all" || cardCategory === category){
          card.classList.remove("hidden");
          card.style.display = "block";
          visibleCount++;
        } else {
          card.classList.add("hidden");
          card.style.display = "none";
        }
      });

      console.log(`👀 ${visibleCount} productos visibles después del filtro`);

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

  console.log("🔍 DEBUG CATEGORÍAS:");
  
  // Mostrar categorías de botones
  const buttonCategories = Array.from(filterBtns).map(btn => btn.dataset.category);
  console.log("📱 Categorías en botones:", buttonCategories);
  
  // Mostrar categorías de productos
  const productCategories = Array.from(cards).map(card => card.dataset.category);
  const uniqueProductCategories = [...new Set(productCategories)];
  console.log("🏷️ Categorías en productos:", uniqueProductCategories);
  
  // Identificar categorías faltantes
  const missingInProducts = buttonCategories.filter(cat => cat !== 'all' && !uniqueProductCategories.includes(cat));
  const missingInButtons = uniqueProductCategories.filter(cat => !buttonCategories.includes(cat));
  
  if (missingInProducts.length > 0) {
    console.warn("⚠️ Categorías en botones sin productos:", missingInProducts);
  }
  
  if (missingInButtons.length > 0) {
    console.warn("⚠️ Categorías en productos sin botones:", missingInButtons);
  }
}

// ====== Agregar al carrito ======
window.addToCart = async function(productId) {
  console.log('🛒 Intentando agregar al carrito:', productId);
  
  // Esperar a que el carrito esté inicializado
  let attempts = 0;
  while (typeof cart === 'undefined' && attempts < 50) {
    console.log('⏳ Esperando que el carrito se inicialice...');
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  if (typeof cart === 'undefined') {
    console.error('❌ Cart no pudo inicializarse');
    showNotification('Sistema de carrito no disponible', 'error');
    return;
  }

  try {
    await productManager.initialize();
    const product = productManager.getProduct(productId);
    if (!product) {
      console.error('❌ Producto no encontrado:', productId);
      showNotification('Producto no encontrado', 'error');
      return;
    }

    console.log('📦 Producto encontrado:', product.name);

    // Agregar directamente al carrito (sin modal de opciones por ahora)
    const result = cart.addItem(productId, 1);
    console.log('🛒 Resultado de agregar al carrito:', result);
    
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
    console.error('❌ Error en addToCart:', error);
    showNotification('Error al agregar el producto', 'error');
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
      <img src="${product.image}" alt="${product.name}" onerror="this.src='recursos/lunilogo.png'">
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
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM cargado, iniciando aplicación...');
  
  // Actualizar UI de autenticación
  if (typeof adminPanel !== 'undefined' && adminPanel) {
    adminPanel.updateAuthUI();
    adminPanel.setupHeaderListeners(); // Función que sí existe
  } else {
    console.warn('⚠️ adminPanel no está disponible aún');
    // Reintentar después de un pequeño delay
    setTimeout(() => {
      if (typeof adminPanel !== 'undefined' && adminPanel) {
        adminPanel.updateAuthUI();
        adminPanel.setupHeaderListeners();
        console.log('✅ adminPanel inicializado con delay');
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

// ====== Inicialización de la aplicación ======
async function initializeApp() {
  try {
    console.log('🔄 Inicializando sistemas...');
    
    // Verificar que existe la grilla de productos
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) {
      console.error('❌ No se encontró .product-grid en el DOM');
      return;
    }
    
    console.log('✅ Grilla de productos encontrada');
    
    // Inicializar managers
    await categoryManager.initialize();
    console.log('✅ CategoryManager inicializado');
    
    await productManager.initialize();
    console.log('✅ ProductManager inicializado');
    
    // Renderizar catálogo
    await renderProductCatalog();
    console.log('✅ Catálogo renderizado');
    
    // Configurar filtros después de cargar productos
    setTimeout(() => {
      initFilters();
      console.log('✅ Filtros inicializados');
    }, 200);
    
    console.log('✅ Aplicación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error);
    
    // Reintento después de 1 segundo
    setTimeout(() => {
      console.log('🔄 Reintentando inicialización...');
      initializeApp();
    }, 1000);
  }
}

