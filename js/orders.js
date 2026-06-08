// Sistema de gestión de pedidos/ventas con Supabase
class OrderManager {
  constructor() {
    this.orders = [];
    this.isLoading = false;
    this.initialized = false;
  }

  async init() {
    // console.log('🔧 Inicializando OrderManager con Supabase...');
    return this.initialize();
  }

  async initialize() {
    if (this.initialized) {
      return this.orders;
    }

    await this.loadOrders();
    this.initialized = true;
    return this.orders;
  }

  async loadOrders() {
    try {
      this.isLoading = true;
        // console.log('📥 Cargando órdenes desde Supabase...');
      
      // Verificar si supabaseClient está disponible
      if (typeof supabaseClient === 'undefined') {
          // console.warn('⚠️ SupabaseClient no disponible, usando localStorage');
        return this.loadOrdersFromLocalStorage();
      }

      
      // Hacer la consulta con debug detallado
        // console.log('📊 Ejecutando consulta a tabla "orders"...');
      const { data, error, count } = await supabaseClient
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

        // console.log('📋 Resultado de consulta:');
        // console.log('  - Data:', data);
        // console.log('  - Error:', error);
        // console.log('  - Count:', count);
        // console.log('  - Data length:', data?.length);

      if (error) {
          // console.error('❌ Error cargando órdenes desde Supabase:', error);
          // console.error('   - Error code:', error.code);
          // console.error('   - Error message:', error.message);
          // console.error('   - Error details:', error.details);
          // console.log('🔄 Usando fallback a localStorage...');
        return this.loadOrdersFromLocalStorage();
      }

      this.orders = data || [];
        // console.log('✅ Órdenes cargadas desde Supabase:', this.orders.length);
      
      // Debug de cada orden
      if (this.orders.length > 0) {
          // console.log('🔍 Muestra de primera orden:', this.orders[0]);
          // console.log('📝 Estructura de la orden:');
          // console.log('   - ID:', this.orders[0].id);
          // console.log('   - Order Number:', this.orders[0].order_number);
          // console.log('   - Customer Info:', this.orders[0].customer_info);
          // console.log('   - Status:', this.orders[0].status);
          // console.log('   - Created At:', this.orders[0].created_at);
      }
      
      // También guardar en localStorage como backup
      if (this.orders.length > 0) {
        localStorage.setItem('luni_orders_backup', JSON.stringify(this.orders));
          // console.log('💾 Backup guardado en localStorage');
      }
      
      return this.orders;
    } catch (error) {
        // console.error('❌ Error conectando con Supabase:', error);
        // console.error('   - Error name:', error.name);
        // console.error('   - Error message:', error.message);
        // console.error('   - Error stack:', error.stack);
        // console.log('🔄 Usando fallback a localStorage...');
      return this.loadOrdersFromLocalStorage();
    } finally {
      this.isLoading = false;
    }
  }

  loadOrdersFromLocalStorage() {
      // console.log('📦 Cargando órdenes desde localStorage (fallback)...');
    
    // Intentar cargar desde localStorage principal
    let stored = localStorage.getItem('luni_orders');
    if (stored) {
      try {
        this.orders = JSON.parse(stored);
          // console.log('✅ Órdenes cargadas desde localStorage principal:', this.orders.length);
        return this.orders;
      } catch (error) {
          // console.error('❌ Error parseando localStorage principal:', error);
      }
    }

    // Intentar cargar desde backup
    stored = localStorage.getItem('luni_orders_backup');
    if (stored) {
      try {
        this.orders = JSON.parse(stored);
          // console.log('✅ Órdenes cargadas desde backup:', this.orders.length);
        return this.orders;
      } catch (error) {
          // console.error('❌ Error parseando backup:', error);
      }
    }

    // Si no hay nada, inicializar vacío
      // console.log('📭 No se encontraron órdenes en localStorage');
    this.orders = [];
    return this.orders;
  }

  async saveOrder(order) {
    try {
        // console.log('💾 Guardando orden en Supabase:', order.order_number);
      
      const { data, error } = await supabaseClient
        .from('orders')
        .insert([order])
        .select()
        .single();

      if (error) {
          // console.error('❌ Error guardando en Supabase:', error);
        // Fallback a localStorage
        this.saveOrderToLocalStorage(order);
        return order;
      }

        // console.log('✅ Orden guardada en Supabase:', data.id);
      return data;
    } catch (error) {
        // console.error('❌ Error conectando con Supabase:', error);
      // Fallback a localStorage
      this.saveOrderToLocalStorage(order);
      return order;
    }
  }

  saveOrderToLocalStorage(order) {
      // console.log('📦 Guardando en localStorage (fallback)');
    const stored = localStorage.getItem('luni_orders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(order);
    localStorage.setItem('luni_orders', JSON.stringify(orders));
  }

  async createOrder(customerInfo, items, total) {
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6);
    const now = new Date().toISOString();
    
    const order = {
      order_number: orderNumber,
      customer_info: customerInfo,
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
      invoice_sent: false,
      invoice_sent_at: null,
      created_at: now,
      updated_at: now
    };

    const savedOrder = await this.saveOrder(order);
    
    // Agregar al cache local
    this.orders.unshift(savedOrder);
    
      // console.log('✅ Orden creada:', savedOrder.order_number);
    return savedOrder;
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
        // console.log('🔄 Actualizando estado de orden:', orderId, 'a', newStatus);
      
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
          // console.error('❌ Error actualizando estado:', error);
        // Fallback a cache local
        return this.updateOrderStatusLocal(orderId, newStatus);
      }

      // Actualizar cache local
      const orderIndex = this.orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        this.orders[orderIndex] = data;
      }

        // console.log('✅ Estado actualizado en Supabase');
      return data;
    } catch (error) {
        // console.error('❌ Error conectando con Supabase:', error);
      return this.updateOrderStatusLocal(orderId, newStatus);
    }
  }

  updateOrderStatusLocal(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.updated_at = new Date().toISOString();
      this.saveOrdersToLocalStorage();
      return order;
    }
    return null;
  }

  async markInvoiceSent(orderId) {
    try {
        // console.log('📧 Marcando factura como enviada:', orderId);
      
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ 
          invoice_sent: true, 
          invoice_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
          // console.error('❌ Error marcando factura:', error);
        return this.markInvoiceSentLocal(orderId);
      }

      // Actualizar cache local
      const orderIndex = this.orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        this.orders[orderIndex] = data;
      }

      return data;
    } catch (error) {
        // console.error('❌ Error conectando con Supabase:', error);
      return this.markInvoiceSentLocal(orderId);
    }
  }

  markInvoiceSentLocal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.invoice_sent = true;
      order.invoice_sent_at = new Date().toISOString();
      order.updated_at = new Date().toISOString();
      this.saveOrdersToLocalStorage();
      return order;
    }
    return null;
  }

  saveOrdersToLocalStorage() {
    localStorage.setItem('luni_orders', JSON.stringify(this.orders));
  }

  // Método público para guardar órdenes
  saveOrders() {
    this.saveOrdersToLocalStorage();
      // console.log('💾 Órdenes guardadas en localStorage');
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
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    return { total, byStatus, totalRevenue };
  }

  // Método para refrescar datos desde Supabase
  async refresh() {
    this.initialized = false;
    return await this.initialize();
  }

  // Método para obtener órdenes de un período específico
  getOrdersByPeriod(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= cutoffDate;
    });
  }
}

// Instancia global con inicialización inmediata
  // console.log('🚀 Creando OrderManager...');
const orderManager = new OrderManager();

// Asegurar inicialización
if (typeof window !== 'undefined') {
  window.orderManager = orderManager;
  
  // Forzar inicialización después de que todo esté cargado
  if (false && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        // console.log('📋 Re-inicializando OrderManager después de DOM ready...');
      await orderManager.init();
    });
  }
}
