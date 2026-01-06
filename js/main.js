// Script principal que integra todo el sistema
// ====== PRELOADER ======
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// ====== Inicializar AOS ======
AOS.init({ duration: 800, once: true });

// ====== Renderizar catálogo de productos ======
window.renderProductCatalog = function() {
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) return;

  const products = productManager.products;
  productGrid.innerHTML = '';

  if (products.length === 0) {
    productGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 2rem;">No hay productos disponibles</p>';
    return;
  }

  products.forEach(product => {
    if (!product.available) return; // No mostrar productos no disponibles

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.category = product.category;
    card.dataset.productId = product.id;
    card.setAttribute('data-aos', 'zoom-in');

    const stockBadge = product.stock > 0 
      ? `<span class="stock-badge">Stock: ${product.stock}</span>` 
      : '<span class="stock-badge out-of-stock">Agotado</span>';

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='recursos/lunilogo.png'">
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

    productGrid.appendChild(card);
  });

  // Re-inicializar filtros
  initFilters();
};

// ====== FILTROS DE PRODUCTOS ======
function initFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;

      cards.forEach(card => {
        if(category === "all" || card.dataset.category === category){
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });

      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// ====== Agregar al carrito ======
function addToCart(productId) {
  const product = productManager.getProduct(productId);
  if (!product) {
    alert('Producto no encontrado');
    return;
  }

  // Si el producto tiene variantes (color/tamaño), mostrar selector
  if (product.color || product.size) {
    showProductOptions(productId);
  } else {
    const result = cart.addItem(productId, 1);
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
  }
}

// ====== Mostrar opciones de producto ======
function showProductOptions(productId) {
  const product = productManager.getProduct(productId);
  if (!product) return;

  let optionsHTML = '<div class="product-options-modal">';
  optionsHTML += `<h3>${product.name}</h3>`;
  
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

function addToCartWithOptions(productId) {
  const color = document.getElementById('option-color')?.value || '';
  const size = document.getElementById('option-size')?.value || '';
  const quantity = parseInt(document.getElementById('option-quantity')?.value || 1);

  const result = cart.addItem(productId, quantity, color, size);
  closeProductOptions();
  
  if (result.success) {
    showNotification(result.message, 'success');
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
function openCart() {
  const cartModal = document.getElementById('cart-modal');
  if (cartModal) {
    renderCart();
    cartModal.style.display = 'flex';
  }
}

function closeCart() {
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

function updateCartQuantity(index, newQuantity) {
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

function removeFromCart(index) {
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
  // Actualizar UI de autenticación
  if (adminPanel) {
    adminPanel.updateAuthUI();
    adminPanel.setupBasicEventListeners(); // Asegurar que el botón de login funcione
  }
  
  // Renderizar catálogo inicial
  renderProductCatalog();
  
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

  // Configurar panel admin
  if (adminPanel.isAdmin) {
    adminPanel.setupEventListeners();
  }
});

