// Sistema de carrito de compras
class Cart {
  constructor() {
    this.items = this.loadCart();
    this.initialized = false;
    this.initializeWhenReady();
  }

  // Inicializar cuando ProductManager esté listo
  async initializeWhenReady() {
    // Esperar hasta que ProductManager esté disponible
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    while (typeof productManager === 'undefined' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (typeof productManager !== 'undefined') {
      // console.log('✅ Cart inicializado con ProductManager');
    } else {
      // console.warn('⚠️ Cart inicializado sin ProductManager (modo offline)');
    }
    
    this.initialized = true;
    this.updateCartUI();
  }

  loadCart() {
    const stored = localStorage.getItem('luni_cart');
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(item =>
        item &&
        item.productId &&
        Number.isFinite(Number(item.quantity)) &&
        Number(item.quantity) > 0
      ).map(item => ({
        ...item,
        quantity: Number(item.quantity)
      }));
    } catch (error) {
      localStorage.removeItem('luni_cart');
      return [];
    }
  }

  saveCart() {
    localStorage.setItem('luni_cart', JSON.stringify(this.items));
    this.updateCartUI();
  }

  addItem(productId, quantity = 1, color = '', size = '') {
    try {
    quantity = Math.max(1, Number(quantity) || 1);
    // console.log('🛒 cart.addItem llamado con:', { productId, quantity, color, size });
    
    // Verificar que productManager esté disponible
    if (typeof productManager === 'undefined') {
      // console.error('❌ ProductManager no está disponible');
      return { success: false, message: 'Sistema no inicializado correctamente' };
    }

    if (!productManager.initialized) {
      return { success: false, message: 'Los productos aun se estan cargando. Intenta nuevamente en unos segundos.' };
    }

    // Verificar disponibilidad
    if (!productManager.checkAvailability(productId, quantity)) {
      // console.error('❌ Producto no disponible o sin stock');
      return { success: false, message: 'Producto no disponible o sin stock suficiente' };
    }

    const product = productManager.getProduct(productId);
    if (!product) {
      // console.error('❌ Producto no encontrado en ProductManager');
      return { success: false, message: 'Producto no encontrado' };
    }

    // console.log('✅ Producto validado:', product.name);

    // Buscar si ya existe en el carrito
    const existingIndex = this.items.findIndex(
      item => item.productId === productId && item.color === color && item.size === size
    );

    if (existingIndex !== -1) {
      // Actualizar cantidad
      const newQuantity = this.items[existingIndex].quantity + quantity;
      if (!productManager.checkAvailability(productId, newQuantity)) {
        return { success: false, message: 'Stock insuficiente' };
      }
      this.items[existingIndex].quantity = newQuantity;
    } else {
      // Agregar nuevo item con información del producto
      this.items.push({
        productId,
        quantity,
        color,
        size,
        addedAt: Date.now(),
        // Guardar información básica del producto para casos offline
        name: product.name,
        price: product.price,
        image: product.image
      });
    }

    // console.log('💾 Guardando carrito...');
    this.saveCart();
    
    // Efecto visual cuando se añade un producto
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.classList.add('item-added');
      setTimeout(() => {
        cartBtn.classList.remove('item-added');
      }, 800);
    }
    
    // console.log('✅ Producto agregado exitosamente al carrito');
    return { success: true, message: 'Producto agregado al carrito' };
    } catch (error) {
      console.error('Error en cart.addItem:', error);
      return { success: false, message: error.message || 'Error al agregar el producto' };
    }
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
  }

  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeItem(index);
      return;
    }

    const item = this.items[index];
    if (!item) {
      return { success: false, message: 'Producto no encontrado en el carrito' };
    }

    // Verificar que productManager esté disponible
    if (typeof productManager !== 'undefined' && !productManager.checkAvailability(item.productId, quantity)) {
      return { success: false, message: 'Stock insuficiente' };
    }

    this.items[index].quantity = quantity;
    this.saveCart();
    return { success: true };
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  getTotal() {
    return this.items.reduce((total, item) => {
      // Si productManager no está disponible, usar precio guardado o 0
      if (typeof productManager === 'undefined') {
        // console.warn('⚠️ ProductManager no disponible para calcular total');
        return total + (item.price || 0) * item.quantity;
      }
      
      const product = productManager.getProduct(item.productId);
      if (product) {
        return total + (product.price * item.quantity);
      }
      return total;
    }, 0);
  }

  getItemCount() {
    if (typeof productManager !== 'undefined' && !productManager.initialized) {
      return 0;
    }

    return this.getItems().reduce((count, item) => count + item.quantity, 0);
  }

  getItems() {
    return this.items.filter(item => item && item.productId).map(item => {
      // Si productManager no está disponible, usar datos básicos
      if (typeof productManager === 'undefined') {
        // console.warn('⚠️ ProductManager no disponible para obtener detalles del producto');
        return {
          ...item,
          product: {
            id: item.productId,
            name: item.name || `Producto ${item.productId}`,
            price: item.price || 0,
            image: item.image || 'recursos/lunilogo.png'
          }
        };
      }
      
      const product = productManager.getProduct(item.productId);
      return {
        ...item,
        product: product || null
      };
    }).filter(item => item.product !== null);
  }

  removeInvalidItems() {
    if (typeof productManager === 'undefined' || !productManager.initialized) {
      return;
    }

    const validItems = this.items.filter(item => productManager.getProduct(item.productId));
    if (validItems.length !== this.items.length) {
      this.items = validItems;
      this.saveCart();
    }
  }

  updateCartUI() {
    // console.log('🔄 Actualizando interfaz del carrito...');
    const cartCount = document.getElementById('cart-count');
    const cartBtn = document.getElementById('cart-btn');
    const cartTotal = document.getElementById('cart-total');
    // console.log('🔍 Elementos encontrados:', { cartCount: !!cartCount, cartBtn: !!cartBtn, cartTotal: !!cartTotal });
    
    if (cartCount) {
      const count = this.getItemCount();
      // console.log('📊 Actualizando contador a:', count);
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'flex' : 'none';
      
      // Añadir clase para animación más intensa cuando hay productos
      if (cartBtn) {
        if (count > 0) {
          cartBtn.classList.add('has-items');
        } else {
          cartBtn.classList.remove('has-items');
        }
      }
    } else {
      // console.error('❌ Elemento cart-count no encontrado');
    }

    // Actualizar total si el carrito está visible
    if (cartTotal) {
      const total = this.getTotal();
      // console.log('💰 Actualizando total a:', total);
      cartTotal.textContent = `$${total.toLocaleString('es-CO')}`;
    } else {
      // console.warn('⚠️ Elemento cart-total no encontrado (puede ser normal si el modal está cerrado)');
    }
    
    // console.log('✅ Interfaz del carrito actualizada');
  }
}

// Instancia global
let cart;

// Función para inicializar el carrito de manera segura
function initializeCart() {
  if (!cart && document.readyState !== 'loading') {
    cart = new Cart();
    // console.log('🛒 Carrito inicializado');
  }
}

// Inicializar el carrito cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCart);
} else {
  initializeCart();
}

// También crear la instancia inmediatamente por compatibilidad
if (!cart && document.readyState === 'complete') {
  cart = new Cart();
}

