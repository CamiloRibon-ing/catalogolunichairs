// Sistema de gestión de pedidos/ventas
class OrderManager {
  constructor() {
    this.orders = this.loadOrders();
  }

  loadOrders() {
    const stored = localStorage.getItem('luni_orders');
    return stored ? JSON.parse(stored) : [];
  }

  saveOrders() {
    localStorage.setItem('luni_orders', JSON.stringify(this.orders));
  }

  createOrder(customerInfo, items, total) {
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6);
    const order = {
      id: 'order-' + Date.now(),
      orderNumber,
      customerInfo,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        color: item.color || '',
        size: item.size || '',
        subtotal: item.product.price * item.quantity
      })),
      subtotal: total,
      discount: 0,
      shipping: 0,
      total,
      status: 'pendiente',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sentToWhatsApp: false,
      invoiceSent: false,
      invoiceSentAt: null
    };

    this.orders.unshift(order); // Agregar al inicio
    this.saveOrders();
    return order;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = Date.now();
      this.saveOrders();
      return order;
    }
    return null;
  }

  markInvoiceSent(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.invoiceSent = true;
      order.invoiceSentAt = Date.now();
      this.saveOrders();
      return order;
    }
    return null;
  }

  getOrder(orderId) {
    return this.orders.find(o => o.id === orderId);
  }

  getOrdersByStatus(status) {
    if (status === 'all') return this.orders;
    return this.orders.filter(o => o.status === status);
  }

  getAllOrders() {
    return this.orders;
  }

  getOrdersStats() {
    const total = this.orders.length;
    const byStatus = {
      pendiente: this.orders.filter(o => o.status === 'pendiente').length,
      confirmado: this.orders.filter(o => o.status === 'confirmado').length,
      en_preparacion: this.orders.filter(o => o.status === 'en_preparacion').length,
      enviado: this.orders.filter(o => o.status === 'enviado').length,
      entregado: this.orders.filter(o => o.status === 'entregado').length,
      cancelado: this.orders.filter(o => o.status === 'cancelado').length
    };
    // Solo contar ingresos de pedidos confirmados o entregados
    const totalRevenue = this.orders
      .filter(o => o.status === 'confirmado' || o.status === 'en_preparacion' || 
                   o.status === 'enviado' || o.status === 'entregado')
      .reduce((sum, o) => sum + o.total, 0);

    return { total, byStatus, totalRevenue };
  }
}

// Instancia global
const orderManager = new OrderManager();

