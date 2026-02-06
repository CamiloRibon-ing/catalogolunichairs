// Función para crear órdenes de prueba directamente en Supabase
async function createTestOrders() {
  console.log('🧪 Creando órdenes de prueba...');
  
  const testOrders = [
    {
      order_number: 'ORD-' + Date.now().toString().slice(-6),
      customer_info: {
        name: 'Juan Carlos Pérez',
        phone: '3001234567',
        email: 'juan@ejemplo.com',
        address: 'Calle 123 #45-67',
        city: 'Bogotá'
      },
      items: [
        {
          productId: 'prod-test-1',
          productName: 'Orquidea Rosa',
          quantity: 2,
          price: 6000,
          color: 'Rosa',
          size: 'Mediano',
          subtotal: 12000
        }
      ],
      subtotal: 12000,
      discount: 0,
      shipping: 0,
      total: 12000,
      status: 'pendiente',
      invoice_sent: false,
      invoice_sent_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      order_number: 'ORD-' + (Date.now() + 1000).toString().slice(-6),
      customer_info: {
        name: 'María González',
        phone: '3009876543',
        email: 'maria@ejemplo.com',
        address: 'Carrera 89 #12-34',
        city: 'Medellín'
      },
      items: [
        {
          productId: 'prod-test-2',
          productName: 'Set Flores Mini x3',
          quantity: 1,
          price: 8000,
          color: 'Variados',
          size: 'Mini',
          subtotal: 8000
        }
      ],
      subtotal: 8000,
      discount: 0,
      shipping: 0,
      total: 8000,
      status: 'confirmado',
      invoice_sent: false,
      invoice_sent_at: null,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      order_number: 'ORD-' + (Date.now() + 2000).toString().slice(-6),
      customer_info: {
        name: 'Carlos Rodríguez',
        phone: '3005555555',
        email: 'carlos@ejemplo.com',
        address: 'Avenida 50 #78-90',
        city: 'Cali'
      },
      items: [
        {
          productId: 'prod-test-3',
          productName: 'Pinza Frutica Piña',
          quantity: 1,
          price: 15000,
          color: 'Gris',
          size: '',
          subtotal: 320000
        }
      ],
      subtotal: 320000,
      discount: 0,
      shipping: 0,
      total: 320000,
      status: 'en_preparacion',
      invoice_sent: true,
      invoice_sent_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
      updated_at: new Date().toISOString()
    }
  ];

  try {
    if (typeof supabaseClient === 'undefined') {
      throw new Error('SupabaseClient no disponible');
    }

    console.log('💾 Insertando órdenes en Supabase...');
    const { data, error } = await supabaseClient
      .from('orders')
      .insert(testOrders)
      .select();

    if (error) {
      console.error('❌ Error insertando en Supabase:', error);
      
      // Fallback: guardar en localStorage
      console.log('🔄 Guardando en localStorage como fallback...');
      const existing = JSON.parse(localStorage.getItem('luni_orders') || '[]');
      const allOrders = [...testOrders, ...existing];
      localStorage.setItem('luni_orders', JSON.stringify(allOrders));
      
      return { success: true, count: testOrders.length, source: 'localStorage' };
    }

    console.log('✅ Órdenes creadas en Supabase:', data?.length || testOrders.length);
    return { success: true, count: data?.length || testOrders.length, source: 'Supabase' };

  } catch (error) {
    console.error('❌ Error creando órdenes:', error);
    
    // Fallback: guardar en localStorage
    console.log('🔄 Guardando en localStorage como fallback...');
    try {
      const existing = JSON.parse(localStorage.getItem('luni_orders') || '[]');
      const allOrders = [...testOrders, ...existing];
      localStorage.setItem('luni_orders', JSON.stringify(allOrders));
      
      return { success: true, count: testOrders.length, source: 'localStorage' };
    } catch (storageError) {
      console.error('❌ Error guardando en localStorage:', storageError);
      return { success: false, error: storageError.message };
    }
  }
}

// Función para el botón del admin panel
async function adminCreateTestOrders() {
  const button = event.target;
  const originalText = button.innerHTML;
  
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
  button.disabled = true;
  
  try {
    const result = await createTestOrders();
    
    if (result.success) {
      // Refrescar la lista de órdenes
      if (typeof adminPanel !== 'undefined' && adminPanel.loadOrdersList) {
        await adminPanel.loadOrdersList();
      }
      
      // Actualizar estadísticas
      if (typeof adminPanel !== 'undefined' && adminPanel.updateOrdersStats) {
        adminPanel.updateOrdersStats();
      }
      
      alert(`✅ ${result.count} órdenes creadas exitosamente en ${result.source}!`);
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Error en adminCreateTestOrders:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

// Hacer la función disponible globalmente
if (typeof window !== 'undefined') {
  window.adminCreateTestOrders = adminCreateTestOrders;
}