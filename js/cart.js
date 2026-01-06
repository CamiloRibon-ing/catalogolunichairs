// Sistema de carrito de compras
class Cart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  loadCart() {
    const stored = localStorage.getItem('luni_cart');
    return stored ? JSON.parse(stored) : [];
  }

  saveCart() {
    localStorage.setItem('luni_cart', JSON.stringify(this.items));
    this.updateCartUI();
  }

  addItem(productId, quantity = 1, color = '', size = '') {
    // Verificar disponibilidad
    if (!productManager.checkAvailability(productId, quantity)) {
      return { success: false, message: 'Producto no disponible o sin stock suficiente' };
    }

    const product = productManager.getProduct(productId);
    if (!product) {
      return { success: false, message: 'Producto no encontrado' };
    }

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
      // Agregar nuevo item
      this.items.push({
        productId,
        quantity,
        color,
        size,
        addedAt: Date.now()
      });
    }

    this.saveCart();
    return { success: true, message: 'Producto agregado al carrito' };
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
    if (!productManager.checkAvailability(item.productId, quantity)) {
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
      const product = productManager.getProduct(item.productId);
      if (product) {
        return total + (product.price * item.quantity);
      }
      return total;
    }, 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  getItems() {
    return this.items.map(item => {
      const product = productManager.getProduct(item.productId);
      return {
        ...item,
        product: product || null
      };
    }).filter(item => item.product !== null);
  }

  updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const count = this.getItemCount();
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'block' : 'none';
    }

    // Actualizar total si el carrito está visible
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
      cartTotal.textContent = `$${this.getTotal().toLocaleString('es-CO')}`;
    }
  }
}

// Instancia global
const cart = new Cart();

