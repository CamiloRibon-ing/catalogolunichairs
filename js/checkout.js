// Sistema de checkout y envío por WhatsApp
class Checkout {
  constructor() {
    this.customerInfo = null;
  }

  openCheckout() {
    if (cart.getItemCount() === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Verificar disponibilidad de todos los productos
    const items = cart.getItems();
    const unavailableItems = items.filter(item => 
      !productManager.checkAvailability(item.productId, item.quantity)
    );

    if (unavailableItems.length > 0) {
      alert('Algunos productos en tu carrito ya no están disponibles. Por favor, actualiza tu carrito.');
      cart.updateCartUI();
      return;
    }

    this.showCustomerForm();
  }

  showCustomerForm() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Limpiar formulario
      document.getElementById('customer-form').reset();
    }
  }

  closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  validateCustomerForm() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const city = document.getElementById('customer-city').value.trim();

    if (!name || !phone || !address || !city) {
      alert('Por favor complete todos los campos requeridos');
      return false;
    }

    // Validar teléfono (debe tener al menos 10 dígitos)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Por favor ingrese un número de teléfono válido');
      return false;
    }

    // Validar email si se proporciona
    if (email && !this.validateEmail(email)) {
      alert('Por favor ingrese un email válido');
      return false;
    }

    this.customerInfo = {
      name,
      phone: phoneDigits,
      email: email || '',
      address,
      city
    };

    return true;
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  generateOrderMessage() {
    const items = cart.getItems();
    const total = cart.getTotal();
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6);

    let message = `🌸💝 *NUEVO PEDIDO - LUNI HAIR CLIPS* 💝🌸\n\n`;
    message += `📋 *Número de Pedido:* ${orderNumber}\n`;
    message += `📅 *Fecha:* ${new Date().toLocaleString('es-CO')}\n\n`;
    
    message += `💗 *INFORMACIÓN DEL CLIENTE* 💗\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🌺 Nombre: ${this.customerInfo.name}\n`;
    message += `📱 Teléfono: ${this.customerInfo.phone}\n`;
    if (this.customerInfo.email) {
      message += `✉️ Email: ${this.customerInfo.email}\n`;
    }
    message += `📍 Dirección: ${this.customerInfo.address}\n`;
    message += `🏙️ Ciudad: ${this.customerInfo.city}\n\n`;

    message += `🛍️ *PRODUCTOS* 🛍️\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    items.forEach((item, index) => {
      const product = item.product;
      message += `${index + 1}. 🌸 *${product.name}* 🌸\n`;
      if (item.color) message += `   💗 Color: ${item.color}\n`;
      if (item.size) message += `   📏 Tamaño: ${item.size}\n`;
      message += `   🔢 Cantidad: ${item.quantity}\n`;
      message += `   💰 Precio unitario: $${product.price.toLocaleString('es-CO')}\n`;
      message += `   💵 Subtotal: $${(product.price * item.quantity).toLocaleString('es-CO')}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💎 *TOTAL: $${total.toLocaleString('es-CO')}* 💎\n\n`;
    message += `✨💝 Gracias por tu compra 💝✨\n`;
    message += `🌙 Tu pedido será procesado pronto 🌙`;

    return { message, orderNumber };
  }

  sendToWhatsApp() {
    if (!this.validateCustomerForm()) {
      return;
    }

    const items = cart.getItems();
    const total = cart.getTotal();
    const { message, orderNumber } = this.generateOrderMessage();
    
    // Crear pedido en el sistema
    const order = orderManager.createOrder(this.customerInfo, items, total);

    const phoneNumber = '573044952240'; // Número de WhatsApp de Luni
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Actualizar stock
    cart.getItems().forEach(item => {
      productManager.decreaseStock(item.productId, item.quantity);
    });

    // Limpiar carrito
    cart.clear();

    // Cerrar modal
    this.closeCheckout();

    // Mostrar confirmación
    showNotification(`✨ Pedido #${orderNumber} creado exitosamente ✨`, 'success');

    // Actualizar catálogo
    if (window.renderProductCatalog) {
      window.renderProductCatalog();
    }
  }
}

// Instancia global
const checkout = new Checkout();

