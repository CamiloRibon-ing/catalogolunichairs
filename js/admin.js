// Panel de administración limpio y sin duplicados
class AdminPanel {
  constructor() {
    this.currentTab = 'dashboard';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateAuthUI();
    console.log('✅ AdminPanel inicializado correctamente');
  }

  // ===== GESTIÓN DE AUTENTICACIÓN =====
  updateAuthUI() {
    const loginBtn = document.getElementById('header-login-btn');
    const userMenu = document.getElementById('user-menu');
    const currentUser = authSystem?.getCurrentUser();

    if (authSystem?.isAuthenticated() && currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) {
        userMenu.style.display = 'flex';
        const usernameSpan = document.getElementById('current-username');
        if (usernameSpan) {
          usernameSpan.textContent = currentUser.name || currentUser.username;
        }
      }
      this.showAdminButton();
    } else {
      if (loginBtn) loginBtn.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
      this.hideAdminButton();
    }
  }

  setupEventListeners() {
    // Event listeners para header
    document.addEventListener('DOMContentLoaded', () => {
      this.setupHeaderListeners();
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initAdminListeners());
    } else {
      this.initAdminListeners();
    }
  }

  setupHeaderListeners() {
    const loginBtn = document.getElementById('header-login-btn');
    if (loginBtn && !loginBtn.hasAttribute('data-listener')) {
      loginBtn.setAttribute('data-listener', 'true');
      loginBtn.addEventListener('click', () => this.showLoginModal());
    }

    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn && !logoutBtn.hasAttribute('data-listener')) {
      logoutBtn.setAttribute('data-listener', 'true');
      logoutBtn.addEventListener('click', () => this.logout());
    }
  }

  initAdminListeners() {
    const closeBtn = document.getElementById('admin-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeAdminPanel());
    }

    // Event listeners para categorías
    const addCategoryBtn = document.getElementById('admin-add-category');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.showAddCategoryForm());
    }
    
    const saveCategoryBtn = document.getElementById('save-category-btn');
    if (saveCategoryBtn) {
      saveCategoryBtn.addEventListener('click', () => this.saveCategory());
    }
    
    // Event listeners para productos
    const saveProductBtn = document.getElementById('save-product-btn');
    if (saveProductBtn) {
      saveProductBtn.addEventListener('click', () => this.saveProduct());
    }
    
    // Event listener para subida de imagen
    const imageInput = document.getElementById('product-image-input');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }
    
    // Event listener para agregar imágenes adicionales
    const addImageBtn = document.getElementById('add-additional-image');
    if (addImageBtn) {
      addImageBtn.addEventListener('click', () => this.addAdditionalImageField());
    }

    // Event listener para botón Salir
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.closeAdminPanel());
    }

    // Configurar menú hamburguesa solo para mobile
    this.setupMobileMenuIfNeeded();
  }

  // Configurar menú mobile solo si es necesario
  setupMobileMenuIfNeeded() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      this.setupMobileTabsMenu();
    } else {
      // Asegurar que el HTML esté correcto en desktop
      this.ensureDesktopTabs();
    }
    
    // Agregar listener para cambios de tamaño de pantalla
    if (!this.resizeListener) {
      this.resizeListener = () => {
        const currentIsMobile = window.innerWidth <= 768;
        if (currentIsMobile) {
          this.setupMobileTabsMenu();
        } else {
          this.ensureDesktopTabs();
        }
      };
      window.addEventListener('resize', this.resizeListener);
    }
  }

  // Asegurar que los tabs de desktop estén correctos
  ensureDesktopTabs() {
    const adminTabs = document.querySelector('.admin-tabs');
    if (!adminTabs) return;
    
    // Si existe el toggle (estructura mobile), restaurar desktop
    if (document.querySelector('.admin-tabs-toggle')) {
      adminTabs.innerHTML = `
        <button class="admin-tab active" data-tab="dashboard" onclick="showAdminTab('dashboard')">
          <i class="fas fa-chart-line"></i> Dashboard
        </button>
        <button class="admin-tab" data-tab="orders" onclick="showAdminTab('orders')">
          <i class="fas fa-shopping-bag"></i> Ventas
        </button>
        <button class="admin-tab" data-tab="categories" onclick="showAdminTab('categories')">
          <i class="fas fa-tags"></i> Categorías
        </button>
        <button class="admin-tab" data-tab="products" onclick="showAdminTab('products')">
          <i class="fas fa-box"></i> Productos
        </button>
        <button class="admin-tab" data-tab="add-product" onclick="showAdminTab('add-product')">
          <i class="fas fa-plus"></i> Agregar Producto
        </button>
      `;
    }
  }

  // Configurar menú hamburguesa para tabs en mobile
  setupMobileTabsMenu() {
    // Solo configurar menú mobile si la pantalla es pequeña
    const isMobile = window.innerWidth <= 768;
    const adminTabs = document.querySelector('.admin-tabs');
    
    if (!adminTabs) return;
    
    if (isMobile && !document.querySelector('.admin-tabs-toggle')) {
      // Guardar los tabs originales
      const originalTabs = adminTabs.querySelectorAll('.admin-tab');
      const currentActiveTab = document.querySelector('.admin-tab.active');
      const activeTabText = currentActiveTab ? currentActiveTab.textContent.trim() : 'Dashboard';
      
      // Crear estructura mobile
      adminTabs.innerHTML = `
        <div class="admin-tabs-toggle" onclick="adminPanel.toggleMobileTabsMenu()">
          <span class="current-tab-text">${activeTabText}</span>
          <div class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="admin-tabs-container">
          <button class="admin-tab active" data-tab="dashboard" onclick="showAdminTab('dashboard')">
            <i class="fas fa-chart-line"></i> Dashboard
          </button>
          <button class="admin-tab" data-tab="orders" onclick="showAdminTab('orders')">
            <i class="fas fa-shopping-bag"></i> Ventas
          </button>
          <button class="admin-tab" data-tab="categories" onclick="showAdminTab('categories')">
            <i class="fas fa-tags"></i> Categorías
          </button>
          <button class="admin-tab" data-tab="products" onclick="showAdminTab('products')">
            <i class="fas fa-box"></i> Productos
          </button>
          <button class="admin-tab" data-tab="add-product" onclick="showAdminTab('add-product')">
            <i class="fas fa-plus"></i> Agregar Producto
          </button>
        </div>
      `;
    } else if (!isMobile && document.querySelector('.admin-tabs-toggle')) {
      // Restaurar estructura desktop
      adminTabs.innerHTML = `
        <button class="admin-tab active" data-tab="dashboard" onclick="showAdminTab('dashboard')">
          <i class="fas fa-chart-line"></i> Dashboard
        </button>
        <button class="admin-tab" data-tab="orders" onclick="showAdminTab('orders')">
          <i class="fas fa-shopping-bag"></i> Ventas
        </button>
        <button class="admin-tab" data-tab="categories" onclick="showAdminTab('categories')">
          <i class="fas fa-tags"></i> Categorías
        </button>
        <button class="admin-tab" data-tab="products" onclick="showAdminTab('products')">
          <i class="fas fa-box"></i> Productos
        </button>
        <button class="admin-tab" data-tab="add-product" onclick="showAdminTab('add-product')">
          <i class="fas fa-plus"></i> Agregar Producto
        </button>
      `;
    }
  }

  // Toggle menú hamburguesa
  toggleMobileTabsMenu() {
    const toggle = document.querySelector('.admin-tabs-toggle');
    const container = document.querySelector('.admin-tabs-container');
    
    if (toggle && container) {
      const isOpen = container.classList.contains('show');
      
      if (isOpen) {
        container.classList.remove('show');
        toggle.classList.remove('active');
        this.removeMobileMenuListener();
      } else {
        container.classList.add('show');
        toggle.classList.add('active');
        this.addMobileMenuListener();
      }
    }
  }

  // Agregar listener para cerrar menú al hacer click fuera
  addMobileMenuListener() {
    if (!this.mobileMenuListener) {
      this.mobileMenuListener = (e) => {
        const container = document.querySelector('.admin-tabs-container');
        const toggle = document.querySelector('.admin-tabs-toggle');
        
        if (container && toggle && !toggle.contains(e.target) && !container.contains(e.target)) {
          container.classList.remove('show');
          toggle.classList.remove('active');
          this.removeMobileMenuListener();
        }
      };
    }
    document.addEventListener('click', this.mobileMenuListener);
  }

  // Remover listener del menú mobile
  removeMobileMenuListener() {
    if (this.mobileMenuListener) {
      document.removeEventListener('click', this.mobileMenuListener);
    }
  }

  // Actualizar texto del tab activo en mobile
  updateMobileActiveTab(tabName) {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return; // Solo funciona en mobile
    
    const currentTabText = document.querySelector('.current-tab-text');
    if (currentTabText) {
      const tabNames = {
        'dashboard': 'Dashboard',
        'orders': 'Ventas', 
        'categories': 'Categorías',
        'products': 'Productos',
        'add-product': 'Agregar Producto'
      };
      currentTabText.textContent = tabNames[tabName] || 'Dashboard';
    }
    
    // Cerrar menú después de seleccionar
    const container = document.querySelector('.admin-tabs-container');
    const toggle = document.querySelector('.admin-tabs-toggle');
    if (container && toggle) {
      container.classList.remove('show');
      toggle.classList.remove('active');
      this.removeMobileMenuListener();
    }
  }

  // ===== MODAL DE LOGIN =====
  showLoginModal() {
    const existingModal = document.getElementById('login-modal');
    if (existingModal) {
      existingModal.style.display = 'flex';
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content login-modal-content">
        <button class="modal-close-btn" onclick="adminPanel.closeLoginModal()">
          <i class="fas fa-times"></i>
        </button>
        <div class="login-header">
          <h2>🌸 Panel de Administración 🌸</h2>
          <p>Ingresa tus credenciales para acceder</p>
        </div>
        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="login-username">
              <i class="fas fa-user"></i> Usuario
            </label>
            <input type="text" id="login-username" required placeholder="Ingresa tu usuario">
          </div>
          <div class="form-group">
            <label for="login-password">
              <i class="fas fa-lock"></i> Contraseña
            </label>
            <input type="password" id="login-password" required placeholder="Ingresa tu contraseña">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Event listener para el formulario
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => this.handleLogin(e));
  }

  closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const result = authSystem?.login(username, password);
    if (result && result.success) {
      this.closeLoginModal();
      this.updateAuthUI();
      this.showNotification('🎉 ¡Bienvenido al Panel de Administración!', 'success');
      console.log('✅ Login exitoso');
    } else {
      const errorMessage = result?.message || 'Credenciales incorrectas';
      this.showNotification(`❌ Error de acceso: ${errorMessage}`, 'error');
      console.log('❌ Error de login:', errorMessage);
    }
  }

  logout() {
    if (authSystem?.logout()) {
      this.showNotification('👋 Sesión cerrada exitosamente', 'info');
      this.closeAdminPanel();
      this.updateAuthUI();
      console.log('✅ Logout exitoso');
    }
  }

  // ===== GESTIÓN DEL BOTÓN ADMIN =====
  showAdminButton() {
    if (document.getElementById('admin-btn')) return;

    const userActions = document.querySelector('.user-actions');
    if (!userActions) return;

    const adminBtn = document.createElement('button');
    adminBtn.id = 'admin-btn';
    adminBtn.className = 'btn-admin-header';
    adminBtn.innerHTML = '<i class="fas fa-cogs"></i><span class="btn-text">Panel Admin</span>';
    
    adminBtn.onclick = () => this.showAdminPanel();
    
    const logoutBtn = document.getElementById('header-logout-btn');
    userActions.insertBefore(adminBtn, logoutBtn);
  }

  hideAdminButton() {
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) adminBtn.remove();
  }

  // ===== PANEL DE ADMINISTRACIÓN =====
  showAdminPanel() {
    if (!authSystem?.isAuthenticated()) {
      this.showLoginModal();
      return;
    }

    const existingModal = document.getElementById('admin-modal');
    if (existingModal) {
      existingModal.style.display = 'flex';
      return;
    }

    this.createAdminModal();
  }

  createAdminModal() {
    const modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.className = 'modal admin-modal';
    modal.innerHTML = `
      <div class="modal-content admin-modal-content">
        <div class="admin-header">
          <h2><i class="fas fa-crown"></i> Panel de Administración</h2>
          <button id="admin-close" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="admin-tabs">
          <button class="admin-tab active" data-tab="dashboard" onclick="showAdminTab('dashboard')">
            <i class="fas fa-chart-pie"></i> Dashboard
          </button>
          <button class="admin-tab" data-tab="orders" onclick="showAdminTab('orders')">
            <i class="fas fa-shopping-cart"></i> Ventas
          </button>
          <button class="admin-tab" data-tab="products" onclick="showAdminTab('products')">
            <i class="fas fa-box"></i> Productos
          </button>
          <button class="admin-tab" data-tab="categories" onclick="showAdminTab('categories')">
            <i class="fas fa-tags"></i> Categorías
          </button>
          <button class="admin-tab" data-tab="add-product" onclick="showAdminTab('add-product')">
            <i class="fas fa-plus"></i> Agregar
          </button>
        </div>

        <div class="admin-content">
          <div id="admin-dashboard-tab" class="admin-tab-content active">
            <h3><i class="fas fa-chart-line"></i> Dashboard</h3>
            <div class="dashboard-stats">
              <div class="stat-card">
                <h4>Total Ventas</h4>
                <p id="total-sales">$0</p>
              </div>
              <div class="stat-card">
                <h4>Órdenes Hoy</h4>
                <p id="orders-today">0</p>
              </div>
              <div class="stat-card">
                <h4>Productos</h4>
                <p id="total-products">0</p>
              </div>
            </div>
          </div>

          <div id="admin-orders-tab" class="admin-tab-content">
            <h3><i class="fas fa-shopping-cart"></i> Gestión de Ventas</h3>
            <div class="orders-filters">
              <button class="filter-status active" data-status="all" onclick="filterOrders('all')">Todas</button>
              <button class="filter-status" data-status="pendiente" onclick="filterOrders('pendiente')">Pendientes</button>
              <button class="filter-status" data-status="confirmado" onclick="filterOrders('confirmado')">Confirmadas</button>
              <button class="filter-status" data-status="enviado" onclick="filterOrders('enviado')">Enviadas</button>
            </div>
            <div id="admin-orders-list" class="admin-orders-list">
              <!-- Las órdenes se cargan dinámicamente -->
            </div>
          </div>

          <div id="admin-products-tab" class="admin-tab-content">
            <h3><i class="fas fa-box"></i> Gestión de Productos</h3>
            <div id="admin-products-list" class="admin-products-list">
              <!-- Los productos se cargan dinámicamente -->
            </div>
          </div>

          <div id="admin-categories-tab" class="admin-tab-content">
            <h3><i class="fas fa-tags"></i> Gestión de Categorías</h3>
            <div id="admin-categories-list" class="admin-categories-list">
              <!-- Las categorías se cargan dinámicamente -->
            </div>
          </div>

          <div id="admin-add-tab" class="admin-tab-content">
            <h3><i class="fas fa-plus"></i> Agregar Producto</h3>
            <form id="add-product-form" class="product-form">
              <div class="form-group">
                <label for="product-name">Nombre del Producto</label>
                <input type="text" id="product-name" required>
              </div>
              <div class="form-group">
                <label for="product-price">Precio</label>
                <input type="number" id="product-price" required>
              </div>
              <div class="form-group">
                <label for="product-category">Categoría</label>
                <select id="product-category" required>
                  <option value="">Selecciona una categoría</option>
                </select>
              </div>
              <div class="form-group">
                <label for="product-image">Imagen</label>
                <input type="file" id="product-image" accept="image/*">
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Agregar Producto</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    this.setupAdminEventListeners();
    this.loadDashboard();
  }

  setupAdminEventListeners() {
    const closeBtn = document.getElementById('admin-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeAdminPanel());
    }

    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
    }
  }

  closeAdminPanel() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // ===== CARGA DE DATOS =====
  loadDashboard() {
    console.log('🔄 Cargando dashboard...');
    
    try {
      const orders = orderManager?.orders || [];
      const products = productManager?.products || [];
      
      // Si no hay órdenes, mostrar estadísticas vacías
      let effectiveOrders = orders;
      if (orders.length === 0) {
        console.log('📊 No hay órdenes reales, mostrando estadísticas vacías...');
        this.showEmptyOrdersStats();
        return;
      }
      
      // Filtrar órdenes que cuentan para estadísticas (excluir pending y cancelled)
      const validOrdersForStats = effectiveOrders.filter(order => 
        order.status !== 'pending' && order.status !== 'cancelled'
      );
      
      const totalRevenue = validOrdersForStats.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = validOrdersForStats.length;
      const averageOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const pendingOrders = effectiveOrders.filter(order => order.status === 'pending').length;

      // Actualizar estadísticas
      const revenueEl = document.getElementById('stat-total-revenue');
      const ordersEl = document.getElementById('stat-total-orders');
      const averageEl = document.getElementById('stat-average-order');
      const pendingEl = document.getElementById('stat-pending');

      if (revenueEl) revenueEl.textContent = `$${totalRevenue.toLocaleString('es-CO')}`;
      if (ordersEl) ordersEl.textContent = totalOrders;
      if (averageEl) averageEl.textContent = `$${averageOrder.toLocaleString('es-CO')}`;
      if (pendingEl) pendingEl.textContent = pendingOrders;

      console.log(`✅ Dashboard actualizado: ${totalOrders} órdenes válidas (excluyendo pending/cancelled), $${totalRevenue.toLocaleString('es-CO')} ingresos`);
      console.log(`📊 Desglose: ${effectiveOrders.length} órdenes totales, ${pendingOrders} pendientes, ${effectiveOrders.filter(o => o.status === 'cancelled').length} canceladas`);
      
      // Cargar gráficas si están disponibles
      this.loadCharts();
      
      // Cargar productos con poco stock
      this.loadLowStockProducts();
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    }
  }

  loadCharts() {
    console.log('📊 Cargando gráficas...');
    
    try {
      const orders = orderManager?.orders || [];
      
      // Si no hay órdenes, no mostrar gráficas
      let effectiveOrders = orders;
      if (orders.length === 0) {
        console.log('📊 No hay órdenes para mostrar gráficas');
        this.showEmptyCharts();
        return;
      }
      
      // Filtrar órdenes válidas para gráficas (excluir pending y cancelled)
      const validOrders = effectiveOrders.filter(order => 
        order.status !== 'pending' && order.status !== 'cancelled'
      );
      
      // Gráfica de productos más vendidos
      this.loadTopProductsChart(validOrders);
      
      // Gráfica de distribución por estados
      this.loadStatusPieChart(effectiveOrders);
      
      // Gráfica de ventas por día
      this.loadSalesChart(validOrders, 'day');
      
    } catch (error) {
      console.error('❌ Error cargando gráficas:', error);
    }
  }

  loadTopProductsChart(orders) {
    const canvas = document.getElementById('top-products-chart');
    if (!canvas) return;

    // Contar productos vendidos
    const productCounts = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productName = item.productName || item.name || 'Producto sin nombre';
          productCounts[productName] = (productCounts[productName] || 0) + (item.quantity || 1);
        });
      }
    });

    // Convertir a array y ordenar
    const sortedProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5

    const ctx = canvas.getContext('2d');
    
    // Destruir gráfica anterior si existe
    if (window.topProductsChart) {
      window.topProductsChart.destroy();
    }

    window.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedProducts.map(([name]) => name.length > 20 ? name.substring(0, 20) + '...' : name),
        datasets: [{
          label: 'Cantidad Vendida',
          data: sortedProducts.map(([, count]) => count),
          backgroundColor: '#e74c3c',
          borderColor: '#c0392b',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Productos Más Vendidos'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  loadStatusPieChart(orders) {
    const canvas = document.getElementById('status-pie-chart');
    if (!canvas) return;

    // Contar órdenes por estado
    const statusCounts = {};
    const statusLabels = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado', 
      'preparing': 'En Preparación',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };

    orders.forEach(order => {
      const status = order.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const ctx = canvas.getContext('2d');
    
    // Destruir gráfica anterior si existe
    if (window.statusPieChart) {
      window.statusPieChart.destroy();
    }

    const colors = {
      'pending': '#FFA726',      // Naranja - En espera
      'confirmed': '#42A5F5',    // Azul - Confirmado
      'preparing': '#AB47BC',    // Púrpura - En preparación
      'shipped': '#26C6DA',      // Cian - Enviado
      'delivered': '#66BB6A',    // Verde claro - Entregado
      'completed': '#2E7D32',    // Verde oscuro - Completado
      'cancelled': '#EF5350'     // Rojo - Cancelado
    };

    window.statusPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts).map(status => statusLabels[status] || status),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(status => colors[status] || '#95a5a6'),
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribución por Estados'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  loadSalesChart(orders, period = 'day') {
    const canvas = document.getElementById('sales-day-chart');
    if (!canvas) return;

    // Agrupar ventas por fecha
    const salesByDate = {};
    const now = new Date();
    
    // Preparar fechas para el período
    const dates = [];
    const salesData = [];
    
    if (period === 'day') {
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('es-CO');
        dates.push(dateStr);
        salesByDate[dateStr] = 0;
      }
    } else if (period === 'week') {
      // Últimas 4 semanas
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekLabel = `Semana ${weekStart.toLocaleDateString('es-CO', {month: 'short', day: 'numeric'})}`;
        dates.push(weekLabel);
        salesByDate[weekLabel] = 0;
      }
    } else if (period === 'month') {
      // Últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthLabel = date.toLocaleDateString('es-CO', {year: 'numeric', month: 'long'});
        dates.push(monthLabel);
        salesByDate[monthLabel] = 0;
      }
    }

    // Sumar ventas por fecha
    orders.forEach(order => {
      const orderDate = new Date(order.date || order.created_at || now);
      let dateKey;
      
      if (period === 'day') {
        dateKey = orderDate.toLocaleDateString('es-CO');
      } else if (period === 'week') {
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        dateKey = `Semana ${weekStart.toLocaleDateString('es-CO', {month: 'short', day: 'numeric'})}`;
      } else if (period === 'month') {
        dateKey = orderDate.toLocaleDateString('es-CO', {year: 'numeric', month: 'long'});
      }
      
      if (salesByDate.hasOwnProperty(dateKey)) {
        salesByDate[dateKey] += order.total || 0;
      }
    });

    dates.forEach(date => {
      salesData.push(salesByDate[date] || 0);
    });

    const ctx = canvas.getContext('2d');
    
    // Destruir gráfica anterior si existe
    if (window.salesChart) {
      window.salesChart.destroy();
    }

    window.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Ventas ($)',
          data: salesData,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: period === 'day' ? 'Ventas por Día (Últimos 7 días)' : 
                  period === 'week' ? 'Ventas por Semana (Últimas 4 semanas)' :
                  'Ventas por Mes (Últimos 6 meses)'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString('es-CO');
              }
            }
          }
        }
      }
    });
  }

  loadLowStockProducts() {
    console.log('📦 Cargando productos con poco stock...');
    
    try {
      const products = productManager?.products || [];
      
      // Filtrar productos con stock bajo (menos de 10 unidades)
      const lowStockProducts = products.filter(product => {
        const stock = parseInt(product.stock) || 0;
        return stock > 0 && stock < 10;
      }).sort((a, b) => (parseInt(a.stock) || 0) - (parseInt(b.stock) || 0));
      
      const lowStockContainer = document.getElementById('low-stock-list');
      if (!lowStockContainer) {
        console.log('⚠️ Contenedor de productos con poco stock no encontrado');
        return;
      }
      
      if (lowStockProducts.length === 0) {
        lowStockContainer.innerHTML = `
          <div class="low-stock-empty">
            <i class="fas fa-check-circle"></i>
            <p>Todos los productos tienen stock suficiente</p>
          </div>
        `;
        return;
      }
      
      lowStockContainer.innerHTML = `
        <div class="low-stock-header">
          <h4><i class="fas fa-exclamation-triangle"></i> Productos con Poco Stock</h4>
          <span class="stock-count">${lowStockProducts.length} productos</span>
        </div>
        <div class="low-stock-items">
          ${lowStockProducts.map(product => {
            const stockLevel = parseInt(product.stock) || 0;
            const urgencyClass = stockLevel <= 3 ? 'critical' : stockLevel <= 6 ? 'warning' : 'low';
            
            return `
              <div class="low-stock-item ${urgencyClass}">
                <div class="product-info">
                  <div class="product-image">
                    ${product.image ? 
                      `<img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMyNi42Mjc0IDMyIDMyIDI2LjYyNzQgMzIgMjBDMzIgMTMuMzcyNiAyNi42Mjc0IDggMjAgOEMxMy4zNzI2IDggOCAxMy4zNzI2IDggMjBDOCAyNi42Mjc0IDEzLjM3MjYgMzIgMjAgMzJaIiBmaWxsPSIjRERERERFIi8+CjxwYXRoIGQ9Ik0xNiAxNkgyNFYyNEgxNlYxNloiIGZpbGw9IiNCQkJCQkIiLz4KPC9zdmc+Cg==" />` : 
                      `<div class="product-placeholder"><i class="fas fa-chair"></i></div>`
                    }
                  </div>
                  <div class="product-details">
                    <h5>${product.name}</h5>
                    <p class="product-category">${product.category || 'Sin categoría'}</p>
                    <p class="product-price">$${(product.price || 0).toLocaleString('es-CO')}</p>
                  </div>
                </div>
                <div class="stock-info">
                  <div class="stock-number ${urgencyClass}">
                    <span class="stock-value">${stockLevel}</span>
                    <span class="stock-label">unidades</span>
                  </div>
                  <div class="stock-indicator ${urgencyClass}">
                    <i class="fas fa-${urgencyClass === 'critical' ? 'exclamation-circle' : urgencyClass === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    <span>${urgencyClass === 'critical' ? 'Crítico' : urgencyClass === 'warning' ? 'Bajo' : 'Revisar'}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      
      console.log(`✅ Productos con poco stock cargados: ${lowStockProducts.length}`);
      
    } catch (error) {
      console.error('❌ Error cargando productos con poco stock:', error);
    }
  }

  async loadOrdersList(statusFilter = 'all') {
    const ordersList = document.getElementById('admin-orders-list');
    if (!ordersList) return;

    let orders = orderManager?.orders || [];
    
    // Si no hay órdenes reales, mostrar mensaje vacío
    if (orders.length === 0) {
      console.log('📊 No hay órdenes reales para mostrar');
      ordersList.innerHTML = `<div class="empty-state" style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem; display: block;"></i>
        <h3 style="margin-bottom: 0.5rem;">No hay órdenes aún</h3>
        <p>Las órdenes de los clientes aparecerán aquí cuando se realicen compras.</p>
      </div>`;
      this.updateOrdersStats([]);
      return;
    }
    
    console.log('🔍 Filtrando órdenes por estado:', statusFilter);
    console.log('📊 Órdenes antes de filtrar:', orders.length);
    console.log('📋 Estados disponibles:', orders.map(o => o.status).join(', '));
    
    // Aplicar filtro
    let filteredOrders = orders;
    if (statusFilter !== 'all') {
      filteredOrders = orders.filter(order => {
        const matches = order.status === statusFilter;
        if (matches) {
          console.log(`✅ Orden #${order.orderNumber} (${order.status}) coincide con filtro ${statusFilter}`);
        }
        return matches;
      });
    }
    
    console.log('📊 Órdenes después de filtrar:', filteredOrders.length);

    if (filteredOrders.length === 0) {
      ordersList.innerHTML = `<p style="text-align: center; color: #666; font-style: italic; padding: 2rem;">No hay órdenes con estado: <strong>${statusFilter === 'all' ? 'Todos' : statusFilter}</strong></p>`;
      this.updateOrdersStats(filteredOrders);
      return;
    }

    ordersList.innerHTML = filteredOrders.map(order => `
      <div class="admin-order-item">
        <div class="order-info">
          <h4>Orden #${order.orderNumber || order.order_number || order.id}</h4>
          <p><strong>Cliente:</strong> ${order.customer_info?.name || order.customerInfo?.name || 'No especificado'}</p>
          <p><strong>Total:</strong> $${(order.total || 0).toLocaleString('es-CO')}</p>
          <p><strong>Estado:</strong> <span class="status ${order.status}">${order.status}</span></p>
        </div>
        <div class="order-actions">
          <button onclick="adminPanel.viewOrder('${order.id}')" class="btn btn-info">Ver</button>
          <button onclick="adminPanel.changeOrderStatus('${order.id}')" class="btn btn-warning">Cambiar Estado</button>
        </div>
      </div>
    `).join('');

    // Actualizar estadísticas de órdenes (usar las órdenes filtradas)
    this.updateOrdersStats(filteredOrders);
  }

  updateOrdersStats(orders = null) {
    // Si no se pasan órdenes, obtener las actuales
    if (!orders) {
      orders = orderManager?.orders || [];
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Actualizar elementos en el DOM
    const totalEl = document.getElementById('orders-total');
    const revenueEl = document.getElementById('orders-revenue');

    if (totalEl) {
      totalEl.textContent = totalOrders;
    }

    if (revenueEl) {
      revenueEl.textContent = `$${totalRevenue.toLocaleString('es-CO')}`;
    }

    console.log(`📊 Estadísticas de órdenes actualizadas: ${totalOrders} órdenes, $${totalRevenue.toLocaleString('es-CO')} ingresos`);
  }

  showEmptyOrdersStats() {
    // Mostrar estadísticas vacías
    const totalEl = document.getElementById('orders-total');
    const revenueEl = document.getElementById('orders-revenue');
    const productsCountEl = document.getElementById('products-count');
    const categoriesCountEl = document.getElementById('categories-count');

    if (totalEl) totalEl.textContent = '0';
    if (revenueEl) revenueEl.textContent = '$0';
    if (productsCountEl) {
      const products = productManager?.products || [];
      productsCountEl.textContent = products.length;
    }
    if (categoriesCountEl) {
      const categories = categoryManager?.categories || [];
      categoriesCountEl.textContent = categories.length;
    }

    console.log('📊 Mostrando estadísticas vacías - no hay órdenes');
  }

  showEmptyCharts() {
    // Mostrar mensaje en lugar de gráficas vacías
    const topProductsChart = document.getElementById('top-products-chart');
    const monthlyChart = document.getElementById('monthly-sales-chart');

    if (topProductsChart) {
      topProductsChart.innerHTML = `
        <div class="empty-chart-state">
          <i class="fas fa-chart-bar" style="font-size: 2rem; color: #ccc; margin-bottom: 0.5rem;"></i>
          <p>No hay datos para mostrar productos más vendidos</p>
        </div>
      `;
    }

    if (monthlyChart) {
      monthlyChart.innerHTML = `
        <div class="empty-chart-state">
          <i class="fas fa-chart-line" style="font-size: 2rem; color: #ccc; margin-bottom: 0.5rem;"></i>
          <p>No hay datos para mostrar ventas mensuales</p>
        </div>
      `;
    }

    console.log('📊 Mostrando gráficas vacías - no hay órdenes');
  }

  async loadProductsList() {
    console.log('🔄 Cargando lista de productos...');
    const productsList = document.getElementById('admin-products-list');
    if (!productsList) {
      console.error('❌ Elemento admin-products-list no encontrado');
      return;
    }

    try {
      await productManager.initialize();
      const products = productManager.getAvailableProducts();
      
      if (products.length === 0) {
        productsList.innerHTML = '<p>No hay productos para mostrar</p>';
        return;
      }

      productsList.innerHTML = products.map(product => `
        <div class="admin-product-item">
          <div class="product-status-badge ${product.available ? 'available' : 'unavailable'}">
            ${product.available ? 'Disponible' : 'No disponible'}
          </div>
          <img src="${product.image || 'recursos/lunilogo.png'}" alt="${product.name}" onerror="this.src='recursos/lunilogo.png'">
          <div class="product-info">
            <h4>${product.name}</h4>
            <div class="product-details-grid">
              <div class="product-detail-item price">
                <span class="label">Precio</span>
                <span class="value">$${product.price.toLocaleString('es-CO')}</span>
              </div>
              <div class="product-detail-item stock ${product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : ''}">
                <span class="label">Stock</span>
                <span class="value">${product.stock || 0}</span>
              </div>
              <div class="product-detail-item">
                <span class="label">Categoría</span>
                <span class="value">${this.formatCategoryName(product.category)}</span>
              </div>
              <div class="product-detail-item">
                <span class="label">Color</span>
                <span class="value">${product.color || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div class="product-actions">
            <button onclick="adminPanel.editProduct('${product.id}')" class="btn btn-primary">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button onclick="adminPanel.deleteProduct('${product.id}')" class="btn btn-danger">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `).join('');
      
      console.log(`✅ ${products.length} productos cargados`);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      productsList.innerHTML = '<p>Error cargando productos</p>';
    }
  }

  async loadCategoriesList() {
    console.log('🔄 Cargando lista de categorías...');
    const categoriesList = document.getElementById('admin-categories-list');
    if (!categoriesList) {
      console.error('❌ Elemento admin-categories-list no encontrado');
      return;
    }

    try {
      await categoryManager.initialize();
      const categories = categoryManager.getCategories();
      
      if (categories.length === 0) {
        categoriesList.innerHTML = '<p>No hay categorías para mostrar</p>';
        return;
      }

      categoriesList.innerHTML = categories.map(category => `
        <div class="admin-category-item">
          <div class="category-info">
            <h4>${category.icon || '📁'} ${category.name}</h4>
            <p><strong>Slug:</strong> ${category.slug}</p>
            <p><strong>Estado:</strong> ${category.active ? 'Activa' : 'Inactiva'}</p>
          </div>
          <div class="category-actions">
            <button onclick="adminPanel.editCategory('${category.slug}')" class="btn btn-primary">Editar</button>
            <button onclick="adminPanel.deleteCategory('${category.slug}')" class="btn btn-danger">Eliminar</button>
          </div>
        </div>
      `).join('');
      
      console.log(`✅ ${categories.length} categorías cargadas`);
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      categoriesList.innerHTML = '<p>Error cargando categorías</p>';
    }
  }

  showAddCategoryForm() {
    const form = document.getElementById('category-form');
    const title = document.getElementById('category-form-title');
    const saveBtn = document.getElementById('save-category-btn');
    
    if (form && title && saveBtn) {
      // Limpiar formulario
      document.getElementById('category-id').value = '';
      document.getElementById('category-name').value = '';
      document.getElementById('category-slug').value = '';
      document.getElementById('category-icon').value = '';
      document.getElementById('category-active').checked = true;
      
      // Configurar para agregar
      title.textContent = 'Agregar Nueva Categoría';
      saveBtn.textContent = 'Guardar Categoría';
      
      form.style.display = 'block';
      
      // Auto-generar slug cuando se escriba el nombre
      const nameInput = document.getElementById('category-name');
      const slugInput = document.getElementById('category-slug');
      
      nameInput.oninput = () => {
        const slug = nameInput.value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        slugInput.value = slug;
      };
    }
  }

  async editCategory(categorySlug) {
    console.log('✏️ Editando categoría:', categorySlug);
    
    try {
      await categoryManager.initialize();
      const category = categoryManager.getCategoryBySlug(categorySlug);
      
      if (!category) {
        alert('Categoría no encontrada');
        return;
      }
      
      const form = document.getElementById('category-form');
      const title = document.getElementById('category-form-title');
      const saveBtn = document.getElementById('save-category-btn');
      
      if (form && title && saveBtn) {
        // Llenar formulario con datos existentes
        document.getElementById('category-id').value = category.id || '';
        document.getElementById('category-name').value = category.name || '';
        document.getElementById('category-slug').value = category.slug || '';
        document.getElementById('category-icon').value = category.icon || '';
        document.getElementById('category-active').checked = category.active !== false;
        
        // Configurar para editar
        title.textContent = 'Editar Categoría';
        saveBtn.textContent = 'Actualizar Categoría';
        
        form.style.display = 'block';
      }
    } catch (error) {
      console.error('❌ Error editando categoría:', error);
      alert('Error al cargar los datos de la categoría');
    }
  }

  async deleteCategory(categorySlug) {
    console.log('🗑️ Eliminando categoría:', categorySlug);
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?\n\nEsta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await categoryManager.initialize();
      const category = categoryManager.getCategoryBySlug(categorySlug);
      
      if (!category) {
        alert('Categoría no encontrada');
        return;
      }
      
      const result = await categoryManager.deleteCategory(category.id);
      
      if (result.success) {
        alert('Categoría eliminada exitosamente');
        this.loadCategoriesList(); // Recargar lista
        
        // Actualizar filtros en la página principal
        await this.updateCategoryFilters();
      } else {
        alert('Error al eliminar la categoría: ' + (result.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error eliminando categoría:', error);
      alert('Error al eliminar la categoría: ' + error.message);
    }
  }

  async saveCategory() {
    console.log('💾 Guardando categoría...');
    
    try {
      const categoryId = document.getElementById('category-id').value;
      const name = document.getElementById('category-name').value.trim();
      const slug = document.getElementById('category-slug').value.trim();
      const icon = document.getElementById('category-icon').value.trim();
      const active = document.getElementById('category-active').checked;
      
      // Validaciones
      if (!name) {
        alert('El nombre de la categoría es obligatorio');
        return;
      }
      
      if (!slug) {
        alert('El slug es obligatorio');
        return;
      }
      
      // Validar formato del slug
      if (!/^[a-z0-9-]+$/.test(slug)) {
        alert('El slug solo puede contener letras minúsculas, números y guiones');
        return;
      }
      
      await categoryManager.initialize();
      
      const categoryData = {
        name,
        slug,
        icon: icon || '📁',
        active
      };
      
      let success;
      
      if (categoryId) {
        // Actualizar categoría existente
        success = await categoryManager.updateCategory(categoryId, categoryData);
      } else {
        // Crear nueva categoría
        success = await categoryManager.addCategory(categoryData);
      }
      
      if (success) {
        alert(categoryId ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente');
        document.getElementById('category-form').style.display = 'none';
        this.loadCategoriesList(); // Recargar lista
        
        // Actualizar filtros en la página principal
        await this.updateCategoryFilters();
      } else {
        alert('Error al guardar la categoría');
      }
    } catch (error) {
      console.error('❌ Error guardando categoría:', error);
      alert('Error al guardar la categoría: ' + error.message);
    }
  }

  async editProduct(productId) {
    console.log('✏️ Editando producto:', productId);
    
    try {
      await productManager.initialize();
      const product = productManager.getProduct(productId);
      
      if (!product) {
        alert('Producto no encontrado');
        return;
      }
      
      // Crear modal de edición de producto
      this.showEditProductModal(product);
      
    } catch (error) {
      console.error('❌ Error editando producto:', error);
      alert('Error al cargar los datos del producto');
    }
  }

  showEditProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = `edit-product-modal-${product.id}`;
    
    modal.innerHTML = `
      <div class="modal-content edit-product-modal-content">
        <button class="modal-close-btn" onclick="document.getElementById('edit-product-modal-${product.id}').remove()">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="edit-product-header">
          <h2><i class="fas fa-edit"></i> Editar Producto</h2>
          <p>Modificar información de: <strong>${product.name}</strong></p>
        </div>
        
        <form class="edit-product-form">
          <input type="hidden" id="edit-product-id" value="${product.id}">
          
          <div class="form-section">
            <h4>Información Básica</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="edit-product-name">Nombre del Producto *</label>
                <input type="text" id="edit-product-name" value="${product.name || ''}" required>
              </div>
              <div class="form-group">
                <label for="edit-product-category">Categoría *</label>
                <select id="edit-product-category" required>
                  <option value="">Seleccione una categoría</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="edit-product-price">Precio *</label>
                <input type="number" id="edit-product-price" value="${product.price || ''}" min="0" step="100" required>
              </div>
              <div class="form-group">
                <label for="edit-product-stock">Stock Disponible</label>
                <input type="number" id="edit-product-stock" value="${product.stock || 0}" min="0">
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h4>Características</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="edit-product-color">Color</label>
                <input type="text" id="edit-product-color" value="${product.color || ''}">
              </div>
              <div class="form-group">
                <label for="edit-product-size">Tamaño</label>
                <select id="edit-product-size">
                  <option value="Pequeño" ${product.size === 'Pequeño' ? 'selected' : ''}>Pequeño</option>
                  <option value="Mediano" ${product.size === 'Mediano' ? 'selected' : ''}>Mediano</option>
                  <option value="Grande" ${product.size === 'Grande' ? 'selected' : ''}>Grande</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="edit-product-description">Descripción</label>
              <textarea id="edit-product-description" rows="3">${product.description || ''}</textarea>
            </div>
          </div>
          
          <div class="form-section">
            <h4>Imágenes del Producto</h4>
            <div class="images-upload-container">
              <!-- Imagen Principal -->
              <div class="main-image-section">
                <h5>Imagen Principal *</h5>
                <div class="image-upload-container">
                  <div class="image-preview-wrapper">
                    <img id="edit-product-image-preview" src="${product.image || 'recursos/lunilogo.png'}" alt="Preview" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px;">
                    <div class="upload-progress-container">
                      <div id="edit-upload-progress" class="upload-progress"></div>
                    </div>
                  </div>
                  <div class="upload-controls">
                    <label for="edit-product-image-input" class="btn btn-upload">
                      <i class="fas fa-cloud-upload-alt"></i> Subir Nueva Imagen Principal
                    </label>
                    <input type="file" id="edit-product-image-input" accept="image/*" style="display: none;">
                    <small>Formatos: JPG, PNG, WEBP (máx. 5MB)</small>
                  </div>
                  <div class="form-group">
                    <label for="edit-product-image-url">URL de Imagen Principal (Cloudinary)</label>
                    <input type="text" id="edit-product-image-url" value="${product.image || ''}" placeholder="Se actualizará automáticamente al subir" onchange="document.getElementById('edit-product-image-preview').src = this.value || 'recursos/lunilogo.png'">
                  </div>
                </div>
              </div>
              
              <!-- Imágenes Adicionales -->
              <div class="additional-images-section">
                <h5>Imágenes Adicionales (Opcional)</h5>
                <div id="edit-additional-images-container">
                  <!-- Se cargarán dinámicamente las imágenes existentes -->
                </div>
                <div class="additional-images-controls">
                  <button type="button" onclick="adminPanel.addEditAdditionalImageField()" class="btn btn-secondary">
                    <i class="fas fa-plus"></i> Agregar Imagen Adicional
                  </button>
                  <small class="help-text">Máximo 4 imágenes adicionales. Ideal para mostrar diferentes ángulos del producto.</small>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <div class="form-group">
              <label for="edit-product-available">
                <input type="checkbox" id="edit-product-available" ${product.available !== false ? 'checked' : ''}>
                Producto Disponible
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" onclick="adminPanel.showEditProductPreview('${product.id}')" class="btn btn-info">
              <i class="fas fa-eye"></i> Vista Previa Profesional
            </button>
            <button type="button" onclick="adminPanel.updateProductFromModal('${product.id}')" class="btn btn-primary">
              <i class="fas fa-save"></i> Actualizar Producto
            </button>
            <button type="button" onclick="document.getElementById('edit-product-modal-${product.id}').remove()" class="btn btn-secondary">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cargar categorías en el select y establecer la actual
    this.loadCategoriesInEditModal(product.category);
    
    // Cargar imágenes adicionales existentes
    this.loadExistingAdditionalImages(product);
    
    // Configurar event listener para subida de imagen en modal de editar
    const editImageInput = document.getElementById('edit-product-image-input');
    if (editImageInput) {
      editImageInput.addEventListener('change', (e) => this.handleEditImageUpload(e));
    }
  }

  // ===== SUBIDA DE IMAGEN EN MODAL DE EDITAR =====
  async handleEditImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.showNotification('Error: Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showNotification('Error: La imagen debe ser menor a 5MB', 'error');
      return;
    }

    this.showNotification('Actualizando imagen del producto...', 'info');
    this.showEditUploadProgress();

    try {
      // Mostrar preview inmediatamente
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('edit-product-image-preview');
        if (preview) {
          preview.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const cloudinary = new CloudinaryUploader();
      const result = await cloudinary.uploadImage(file);
      
      if (result.success) {
        // Actualizar el campo de URL
        const urlInput = document.getElementById('edit-product-image-url');
        if (urlInput) {
          urlInput.value = result.url;
        }
        
        // Actualizar preview con la URL de Cloudinary
        const preview = document.getElementById('edit-product-image-preview');
        if (preview) {
          preview.src = result.url;
        }
        
        this.showNotification('✅ Nueva imagen cargada exitosamente', 'success');
      } else {
        this.showNotification('Error al subir la imagen: ' + (result.message || 'Error desconocido'), 'error');
      }
    } catch (error) {
      console.error('Error en upload de edición:', error);
      this.showNotification('Error al subir la imagen: ' + (error.message || 'Error de conexión'), 'error');
    } finally {
      this.hideEditUploadProgress();
      // Limpiar el input para permitir subir la misma imagen nuevamente
      event.target.value = '';
    }
  }

  showEditUploadProgress() {
    const progressContainer = document.querySelector('#edit-upload-progress')?.parentElement;
    const progress = document.getElementById('edit-upload-progress');
    if (progressContainer && progress) {
      progressContainer.style.display = 'block';
      progress.style.width = '0%';
      
      // Simular progreso
      let width = 0;
      this.editProgressInterval = setInterval(() => {
        width += Math.random() * 15;
        if (width >= 85) {
          clearInterval(this.editProgressInterval);
          progress.style.width = '85%';
        } else {
          progress.style.width = width + '%';
        }
      }, 200);
    }
  }

  hideEditUploadProgress() {
    if (this.editProgressInterval) {
      clearInterval(this.editProgressInterval);
    }
    
    setTimeout(() => {
      const progressContainer = document.querySelector('#edit-upload-progress')?.parentElement;
      const progress = document.getElementById('edit-upload-progress');
      if (progressContainer && progress) {
        progress.style.width = '100%';
        setTimeout(() => {
          progressContainer.style.display = 'none';
          progress.style.width = '0%';
        }, 500);
      }
    }, 1000);
  }

  // ===== FUNCIONES PARA MÚLTIPLES IMÁGENES EN MODAL DE EDITAR =====
  
  /**
   * Carga las imágenes adicionales existentes del producto en el modal de edición
   */
  loadExistingAdditionalImages(product) {
    console.log('🖼️ Cargando imágenes existentes del producto:', product.id);
    
    const container = document.getElementById('edit-additional-images-container');
    if (!container) return;

    // Limpiar contenedor
    container.innerHTML = '';

    // Parsear imágenes adicionales
    let additionalImages = [];
    try {
      if (product.additional_images) {
        additionalImages = Array.isArray(product.additional_images) 
          ? product.additional_images 
          : JSON.parse(product.additional_images);
      }
    } catch (error) {
      console.warn('Error al parsear imágenes adicionales:', error);
      additionalImages = [];
    }

    // Crear campos para cada imagen adicional existente
    additionalImages.forEach((imageUrl, index) => {
      if (imageUrl && imageUrl.trim()) {
        this.addEditAdditionalImageField(imageUrl);
      }
    });

    // Si no hay imágenes adicionales, agregar un campo vacío
    if (additionalImages.length === 0) {
      this.addEditAdditionalImageField();
    }
  }

  /**
   * Agregar un nuevo campo de imagen adicional en el modal de edición
   */
  addEditAdditionalImageField(existingUrl = '') {
    const container = document.getElementById('edit-additional-images-container');
    if (!container) return;

    const currentFields = container.querySelectorAll('.additional-image-field').length;
    if (currentFields >= 4) {
      this.showNotification('⚠️ Máximo 4 imágenes adicionales permitidas', 'warning');
      return;
    }

    const fieldIndex = currentFields;
    const fieldHtml = `
      <div class="additional-image-field" data-index="${fieldIndex}">
        <div class="image-field-header">
          <h6>Imagen Adicional ${fieldIndex + 1}</h6>
          <button type="button" onclick="this.parentElement.parentElement.remove()" class="btn-remove-image" title="Eliminar esta imagen">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
        <div class="image-upload-container">
          <div class="image-preview-wrapper">
            <img class="additional-image-preview" src="${existingUrl || 'recursos/lunilogo.png'}" alt="Preview ${fieldIndex + 1}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">
            <div class="upload-progress-container">
              <div class="additional-upload-progress" style="width: 0%;"></div>
            </div>
          </div>
          <div class="upload-controls">
            <label for="edit-additional-image-input-${fieldIndex}" class="btn btn-upload btn-sm">
              <i class="fas fa-cloud-upload-alt"></i> Subir
            </label>
            <input type="file" id="edit-additional-image-input-${fieldIndex}" accept="image/*" style="display: none;">
          </div>
          <div class="form-group">
            <input type="text" class="additional-image-url" value="${existingUrl}" placeholder="URL de imagen adicional">
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', fieldHtml);

    // Configurar event listener para el nuevo campo
    const newInput = document.getElementById(`edit-additional-image-input-${fieldIndex}`);
    if (newInput) {
      newInput.addEventListener('change', (e) => this.handleEditAdditionalImageUpload(e, fieldIndex));
    }

    // Configurar cambio en URL input
    const urlInput = container.querySelector(`[data-index="${fieldIndex}"] .additional-image-url`);
    if (urlInput) {
      urlInput.addEventListener('change', (e) => {
        const preview = container.querySelector(`[data-index="${fieldIndex}"] .additional-image-preview`);
        if (preview) {
          preview.src = e.target.value || 'recursos/lunilogo.png';
        }
      });
    }
  }

  /**
   * Manejar subida de imagen adicional en modal de edición
   */
  async handleEditAdditionalImageUpload(event, fieldIndex) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.showNotification('Error: Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('Error: La imagen debe ser menor a 5MB', 'error');
      return;
    }

    try {
      const container = document.getElementById('edit-additional-images-container');
      const field = container.querySelector(`[data-index="${fieldIndex}"]`);
      const progress = field.querySelector('.additional-upload-progress');
      const preview = field.querySelector('.additional-image-preview');
      const urlInput = field.querySelector('.additional-image-url');

      // Mostrar progreso
      progress.style.width = '20%';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'lunistore');
      formData.append('folder', 'lunistore/products');

      progress.style.width = '50%';

      const response = await fetch('https://api.cloudinary.com/v1_1/dwjaidrip/image/upload', {
        method: 'POST',
        body: formData
      });

      progress.style.width = '80%';

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      progress.style.width = '100%';

      // Actualizar preview y URL
      if (preview && urlInput) {
        preview.src = result.secure_url;
        urlInput.value = result.secure_url;
      }

      this.showNotification(`✅ Imagen adicional ${fieldIndex + 1} subida exitosamente`, 'success');
      
      // Ocultar progreso
      setTimeout(() => {
        progress.style.width = '0%';
      }, 1000);

    } catch (error) {
      console.error('Error al subir imagen adicional:', error);
      this.showNotification('❌ Error al subir la imagen adicional', 'error');
      
      const field = document.querySelector(`[data-index="${fieldIndex}"]`);
      if (field) {
        const progress = field.querySelector('.additional-upload-progress');
        if (progress) progress.style.width = '0%';
      }
    }
  }

  /**
   * Recopilar todas las imágenes adicionales del modal de edición
   */
  collectEditProductImages() {
    const additionalImages = [];
    const container = document.getElementById('edit-additional-images-container');
    
    if (container) {
      const urlInputs = container.querySelectorAll('.additional-image-url');
      urlInputs.forEach(input => {
        const url = input.value?.trim();
        if (url && url !== 'recursos/lunilogo.png') {
          additionalImages.push(url);
        }
      });
    }
    
    return additionalImages;
  }

  /**
   * Mostrar vista previa profesional del producto en edición
   */
  showEditProductPreview(productId) {
    console.log('👁️ Mostrando vista previa profesional del producto:', productId);
    
    // Recopilar datos del formulario
    const name = document.getElementById('edit-product-name')?.value?.trim() || 'Producto Sin Nombre';
    const price = parseFloat(document.getElementById('edit-product-price')?.value || 0);
    const mainImage = document.getElementById('edit-product-image-url')?.value?.trim() || 'recursos/lunilogo.png';
    const description = document.getElementById('edit-product-description')?.value?.trim() || 'Sin descripción';
    const additionalImages = this.collectEditProductImages();
    
    // Crear array completo de imágenes (principal + adicionales)
    const allImages = [mainImage, ...additionalImages].filter(img => img && img.trim());
    
    this.showProfessionalPreview({
      name,
      price,
      description,
      images: allImages,
      isEdit: true,
      productId
    });
  }

  /**
   * Mostrar modal de vista previa profesional tipo Amazon
   */
  showProfessionalPreview(productData) {
    console.log('🎭 Mostrando vista previa profesional:', productData);
    
    // Eliminar modal existente si existe
    const existingModal = document.getElementById('professional-preview-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'professional-preview-modal';
    modal.className = 'modal professional-preview-modal';
    modal.innerHTML = `
      <div class="modal-content professional-preview-content">
        <div class="preview-header">
          <h3><i class="fas fa-eye"></i> Vista Previa Profesional</h3>
          <button class="modal-close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="preview-body">
          <div class="preview-gallery-section">
            <div class="main-image-container">
              <img id="preview-main-image" src="${productData.images[0] || 'recursos/lunilogo.png'}" alt="${productData.name}">
              <div class="image-counter">
                <span id="preview-image-counter">1 / ${productData.images.length}</span>
              </div>
              <div class="gallery-navigation">
                <button class="nav-btn prev-btn" onclick="adminPanel.switchPreviewImage(-1)" ${
                  productData.images.length <= 1 ? 'style="display: none"' : ''
                }>
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button class="nav-btn next-btn" onclick="adminPanel.switchPreviewImage(1)" ${
                  productData.images.length <= 1 ? 'style="display: none"' : ''
                }>
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            
            <div class="thumbnails-container" ${
              productData.images.length <= 1 ? 'style="display: none"' : ''
            }>
              ${productData.images.map((image, index) => `
                <img class="thumbnail ${index === 0 ? 'active' : ''}" 
                     src="${image}" 
                     alt="Vista ${index + 1}"
                     onclick="adminPanel.selectPreviewImage(${index})">
              `).join('')}
            </div>
          </div>
          
          <div class="preview-info-section">
            <div class="product-preview-info">
              <h4>${productData.name}</h4>
              <div class="price-preview">
                <span class="currency">$</span>
                <span class="amount">${productData.price?.toLocaleString('es-CO') || '0'}</span>
              </div>
              <div class="description-preview">
                <h5>Descripción:</h5>
                <p>${productData.description}</p>
              </div>
              <div class="images-info">
                <h5>Galería de Imágenes:</h5>
                <p><i class="fas fa-images"></i> ${productData.images.length} imagen${productData.images.length !== 1 ? 's' : ''} disponible${productData.images.length !== 1 ? 's' : ''}</p>
                <div class="images-list">
                  ${productData.images.map((img, index) => `
                    <div class="image-item">
                      <i class="fas fa-image"></i>
                      <span>Imagen ${index + 1}${index === 0 ? ' (Principal)' : ''}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <div class="preview-actions">
              <div class="simulation-note">
                <i class="fas fa-info-circle"></i>
                Esta es una simulación de cómo se verá tu producto en el catálogo
              </div>
              <button class="btn btn-success" onclick="this.parentElement.parentElement.parentElement.parentElement.parentElement.remove()">
                <i class="fas fa-check"></i> ¡Se Ve Perfecto!
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Inicializar datos del modal
    this.currentPreviewIndex = 0;
    this.previewImages = productData.images;
    
    // Auto-cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  /**
   * Cambiar imagen en la vista previa (navegación con flechas)
   */
  switchPreviewImage(direction) {
    if (!this.previewImages || this.previewImages.length <= 1) return;
    
    this.currentPreviewIndex = (this.currentPreviewIndex + direction + this.previewImages.length) % this.previewImages.length;
    this.updatePreviewImage();
  }
  
  /**
   * Seleccionar imagen específica desde thumbnail
   */
  selectPreviewImage(index) {
    if (!this.previewImages || index < 0 || index >= this.previewImages.length) return;
    
    this.currentPreviewIndex = index;
    this.updatePreviewImage();
  }
  
  /**
   * Actualizar imagen principal y thumbnails en vista previa
   */
  updatePreviewImage() {
    const mainImage = document.getElementById('preview-main-image');
    const counter = document.getElementById('preview-image-counter');
    const thumbnails = document.querySelectorAll('#professional-preview-modal .thumbnail');
    
    if (mainImage && this.previewImages) {
      mainImage.src = this.previewImages[this.currentPreviewIndex];
    }
    
    if (counter && this.previewImages) {
      counter.textContent = `${this.currentPreviewIndex + 1} / ${this.previewImages.length}`;
    }
    
    // Actualizar thumbnails activos
    thumbnails.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === this.currentPreviewIndex);
    });
  }

  async updateProductFromModal(productId) {
    console.log('💾 Actualizando producto desde modal:', productId);
    
    try {
      const name = document.getElementById('edit-product-name')?.value?.trim();
      const category = document.getElementById('edit-product-category')?.value;
      const price = parseFloat(document.getElementById('edit-product-price')?.value || 0);
      const color = document.getElementById('edit-product-color')?.value?.trim();
      const size = document.getElementById('edit-product-size')?.value;
      const image = document.getElementById('edit-product-image-url')?.value?.trim();
      const stock = parseInt(document.getElementById('edit-product-stock')?.value || 0);
      const description = document.getElementById('edit-product-description')?.value?.trim();
      const available = document.getElementById('edit-product-available')?.checked !== false;
      
      // Validaciones
      if (!name) {
        alert('El nombre del producto es obligatorio');
        return;
      }
      
      if (!category) {
        alert('La categoría es obligatoria');
        return;
      }
      
      if (price <= 0) {
        alert('El precio debe ser mayor a 0');
        return;
      }
      
      // Recopilar imágenes adicionales
      const additionalImages = this.collectEditProductImages();
      
      await productManager.initialize();
      
      const productData = {
        name,
        category,
        price,
        color: color || 'Variado',
        size: size || 'Mediano',
        image: image || 'recursos/lunilogo.png',
        additional_images: additionalImages.length > 0 ? JSON.stringify(additionalImages) : null,
        stock,
        description: description || '',
        available
      };
      
      const success = await productManager.updateProduct(productId, productData);
      
      if (success) {
        this.showNotification('✅ Producto actualizado exitosamente', 'success');
        document.getElementById(`edit-product-modal-${productId}`).remove();
        this.loadProductsList(); // Recargar lista
        
        // Actualizar catálogo principal inmediatamente para los clientes
        if (typeof window.renderProductCatalog === 'function') {
          console.log('🔄 Actualizando catálogo principal tras edición...');
          window.renderProductCatalog();
        }
      } else {
        this.showNotification('❌ Error al actualizar el producto', 'error');
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      alert('Error al actualizar el producto: ' + error.message);
    }
  }
  
  async loadCategoriesInEditModal(currentCategory = '') {
    try {
      await categoryManager.initialize();
      const categories = categoryManager.getCategories();
      const select = document.getElementById('edit-product-category');
      
      if (select && categories.length > 0) {
        // Limpiar opciones existentes excepto la primera
        select.innerHTML = '<option value="">Seleccione una categoría</option>';
        
        // Agregar categorías
        categories.forEach(category => {
          if (category.active) {
            const option = document.createElement('option');
            option.value = category.slug;
            option.textContent = category.name;
            if (category.slug === currentCategory) {
              option.selected = true;
            }
            select.appendChild(option);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error cargando categorías en modal:', error);
    }
  }

  // ===== SUBIDA DE IMAGEN EN MODAL DE EDITAR =====
  async handleEditImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.showNotification('Error: Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showNotification('Error: La imagen debe ser menor a 5MB', 'error');
      return;
    }

    this.showNotification('Actualizando imagen del producto...', 'info');
    this.showEditUploadProgress();

    try {
      // Mostrar preview inmediatamente
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('edit-product-image-preview');
        if (preview) {
          preview.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const cloudinary = new CloudinaryUploader();
      const result = await cloudinary.uploadImage(file);
      
      if (result.success) {
        // Actualizar el campo de URL
        const urlInput = document.getElementById('edit-product-image-url');
        if (urlInput) {
          urlInput.value = result.url;
        }
        
        // Actualizar preview con la URL de Cloudinary
        const preview = document.getElementById('edit-product-image-preview');
        if (preview) {
          preview.src = result.url;
        }
        
        this.showNotification('✅ Nueva imagen cargada exitosamente', 'success');
      } else {
        this.showNotification('Error al subir la imagen: ' + (result.message || 'Error desconocido'), 'error');
      }
    } catch (error) {
      console.error('Error en upload de edición:', error);
      this.showNotification('Error al subir la imagen: ' + (error.message || 'Error de conexión'), 'error');
    } finally {
      this.hideEditUploadProgress();
      // Limpiar el input para permitir subir la misma imagen nuevamente
      event.target.value = '';
    }
  }

  showEditUploadProgress() {
    const progressContainer = document.querySelector('#edit-upload-progress')?.parentElement;
    const progress = document.getElementById('edit-upload-progress');
    if (progressContainer && progress) {
      progressContainer.style.display = 'block';
      progress.style.width = '0%';
      
      // Simular progreso
      let width = 0;
      this.editProgressInterval = setInterval(() => {
        width += Math.random() * 15;
        if (width >= 85) {
          clearInterval(this.editProgressInterval);
          progress.style.width = '85%';
        } else {
          progress.style.width = width + '%';
        }
      }, 200);
    }
  }

  hideEditUploadProgress() {
    if (this.editProgressInterval) {
      clearInterval(this.editProgressInterval);
    }
    
    setTimeout(() => {
      const progressContainer = document.querySelector('#edit-upload-progress')?.parentElement;
      const progress = document.getElementById('edit-upload-progress');
      if (progressContainer && progress) {
        progress.style.width = '100%';
        setTimeout(() => {
          progressContainer.style.display = 'none';
          progress.style.width = '0%';
        }, 500);
      }
    }, 1000);
  }

  async deleteProduct(productId) {
    console.log('🗑️ Eliminando producto:', productId);
    
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?\n\nEsta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await productManager.initialize();
      const product = productManager.getProduct(productId);
      
      if (!product) {
        alert('Producto no encontrado');
        return;
      }
      
      const success = await productManager.deleteProduct(productId);
      
      if (success) {
        this.showNotification('✅ Producto eliminado exitosamente', 'success');
        this.loadProductsList(); // Recargar lista
        
        // Actualizar catálogo principal inmediatamente para los clientes
        if (typeof window.renderProductCatalog === 'function') {
          console.log('🔄 Actualizando catálogo principal tras eliminación...');
          window.renderProductCatalog();
        }
      } else {
        this.showNotification('❌ Error al eliminar el producto', 'error');
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      alert('Error al eliminar el producto: ' + error.message);
    }
  }

  resetProductForm() {
    // Función para resetear el formulario de producto
    const fields = [
      'product-id', 'product-name', 'product-category', 'product-price', 
      'product-color', 'product-image-url', 'product-stock', 'product-description'
    ];
    
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = '';
      }
    });
    
    // Resetear campos especiales
    const sizeField = document.getElementById('product-size');
    if (sizeField) sizeField.value = 'Mediano';
    
    const availableField = document.getElementById('product-available');
    if (availableField) availableField.checked = true;
    
    // Resetear vista previa de imagen
    const imagePreview = document.getElementById('product-image-preview');
    if (imagePreview) {
      imagePreview.src = 'recursos/lunilogo.png';
    }
    
    // Restaurar título y botón
    const formTitle = document.getElementById('form-title');
    const saveBtn = document.getElementById('save-product-btn');
    
    if (formTitle) {
      formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nuevo Producto';
    }
    
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    }
  }

  async saveProduct() {
    console.log('💾 Guardando producto...');
    
    try {
      const productId = document.getElementById('product-id')?.value;
      const name = document.getElementById('product-name')?.value?.trim();
      const category = document.getElementById('product-category')?.value;
      const price = parseFloat(document.getElementById('product-price')?.value || 0);
      const color = document.getElementById('product-color')?.value?.trim();
      const size = document.getElementById('product-size')?.value;
      const image = document.getElementById('product-image-url')?.value?.trim();
      const stock = parseInt(document.getElementById('product-stock')?.value || 0);
      const description = document.getElementById('product-description')?.value?.trim();
      const available = document.getElementById('product-available')?.checked !== false;
      
      // Validaciones
      if (!name) {
        alert('El nombre del producto es obligatorio');
        return;
      }
      
      if (!category) {
        alert('La categoría es obligatoria');
        return;
      }
      
      if (price <= 0) {
        alert('El precio debe ser mayor a 0');
        return;
      }
      
      await productManager.initialize();
      
      // Recolectar todas las imágenes del formulario
      const productImages = this.collectProductImages();
      
      const productData = {
        name,
        category,
        price,
        color: color || 'Variado',
        size: size || 'Mediano',
        image: image || 'recursos/lunilogo.png', // Imagen principal para compatibilidad
        images: productImages, // Array completo de imágenes
        stock,
        description: description || '',
        available
      };
      
      let success;
      
      if (productId) {
        // Actualizar producto existente
        success = await productManager.updateProduct(productId, productData);
      } else {
        // Crear nuevo producto
        success = await productManager.addProduct(productData);
      }
      
      if (success) {
        const message = productId ? '✅ Producto actualizado exitosamente' : '✅ Producto creado exitosamente';
        this.showNotification(message, 'success');
        this.resetProductForm();
        this.loadProductsList(); // Recargar lista
        
        // Actualizar catálogo principal inmediatamente para los clientes
        if (typeof window.renderProductCatalog === 'function') {
          console.log('🔄 Actualizando catálogo principal...');
          await window.renderProductCatalog();
        }
        
        showAdminTab('products'); // Volver a la lista
      } else {
        this.showNotification('❌ Error al guardar el producto', 'error');
      }
    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      alert('Error al guardar el producto: ' + error.message);
    }
  }

  cancelProductForm() {
    this.resetProductForm();
    showAdminTab('products'); // Volver a la lista de productos
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.showNotification('Error: Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }
    
    // Validar tamaño (5MB máx)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showNotification('Error: La imagen debe ser menor a 5MB', 'error');
      return;
    }
    
    try {
      this.showNotification('Subiendo imagen...', 'info');
      this.showUploadProgress(0);
      
      // Inicializar Cloudinary uploader
      const cloudinary = new CloudinaryUploader();
      
      // Simular progreso durante la subida
      const progressInterval = setInterval(() => {
        const progress = Math.min(90, Math.random() * 80 + 10);
        this.showUploadProgress(progress);
      }, 200);
      
      const result = await cloudinary.uploadImage(file);
      
      clearInterval(progressInterval);
      this.showUploadProgress(100);
      
      if (result.success) {
        // Actualizar preview de imagen
        const preview = document.getElementById('product-image-preview');
        const urlInput = document.getElementById('product-image-url');
        
        if (preview) {
          preview.src = result.url;
        }
        
        if (urlInput) {
          urlInput.value = result.url;
        }
        
        setTimeout(() => {
          this.hideUploadProgress();
          this.showNotification('✅ Imagen subida exitosamente', 'success');
        }, 500);
      } else {
        this.hideUploadProgress();
        this.showNotification('Error al subir la imagen: ' + (result.message || 'Error desconocido'), 'error');
      }
    } catch (error) {
      this.hideUploadProgress();
      console.error('❌ Error subiendo imagen:', error);
      this.showNotification('Error al subir la imagen: ' + (error.message || 'Error de conexión'), 'error');
    }
  }

  showUploadProgress(percentage) {
    const progressContainer = document.querySelector('.upload-progress-container');
    const progressBar = document.getElementById('upload-progress');
    
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
    
    if (progressBar) {
      progressBar.style.width = percentage + '%';
    }
  }

  hideUploadProgress() {
    const progressContainer = document.querySelector('.upload-progress-container');
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  closeAdminPanel() {
    console.log('🚪 Cerrando panel de administración...');
    
    // Obtener el modal del admin
    const adminModal = document.getElementById('admin-modal');
    if (adminModal) {
      adminModal.style.display = 'none';
      console.log('✅ Panel de administración cerrado');
    } else {
      console.warn('⚠️ Modal de admin no encontrado');
    }
  }

  // Formatear nombres de categorías
  formatCategoryName(category) {
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

  async loadCategoriesInSelect() {
    try {
      await categoryManager.initialize();
      const categories = categoryManager.getActiveCategories();
      const categorySelect = document.getElementById('product-category');
      
      if (categorySelect) {
        // Mantener la opción por defecto
        categorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';
        
        // Agregar categorías
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.slug;
          option.textContent = `${category.icon || '📁'} ${category.name}`;
          categorySelect.appendChild(option);
        });
        
        console.log(`✅ ${categories.length} categorías cargadas en select`);
      }
    } catch (error) {
      console.error('❌ Error cargando categorías en select:', error);
    }
  }

  // ===== GESTIÓN DE MÚLTIPLES IMÁGENES =====
  addAdditionalImageField() {
    const container = document.getElementById('additional-images-list');
    if (!container) return;
    
    const currentImages = container.querySelectorAll('.additional-image-item').length;
    if (currentImages >= 4) {
      alert('Máximo 4 imágenes adicionales permitidas');
      return;
    }
    
    const imageId = `additional-image-${Date.now()}`;
    const imageItem = document.createElement('div');
    imageItem.className = 'additional-image-item';
    imageItem.innerHTML = `
      <div class="additional-image-wrapper">
        <div class="image-preview-small">
          <img id="${imageId}-preview" src="recursos/lunilogo.png" alt="Preview">
        </div>
        <div class="image-controls">
          <label for="${imageId}-input" class="btn btn-small btn-upload">
            <i class="fas fa-upload"></i> Subir
          </label>
          <input type="file" id="${imageId}-input" accept="image/*" style="display: none;">
          <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <input type="text" class="additional-image-url" placeholder="URL de imagen" readonly>
      </div>
    `;
    
    container.appendChild(imageItem);
    
    // Configurar event listener para la nueva imagen
    const newInput = document.getElementById(`${imageId}-input`);
    if (newInput) {
      newInput.addEventListener('change', (e) => this.handleAdditionalImageUpload(e, imageId));
    }
  }
  
  async handleAdditionalImageUpload(event, imageId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.showNotification('Error: Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showNotification('Error: La imagen debe ser menor a 5MB', 'error');
      return;
    }

    this.showNotification('Subiendo imagen adicional...', 'info');

    try {
      // Mostrar preview inmediatamente
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById(`${imageId}-preview`);
        if (preview) {
          preview.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const cloudinary = new CloudinaryUploader();
      const result = await cloudinary.uploadImage(file);
      
      if (result.success) {
        // Actualizar el campo de URL
        const urlInput = event.target.parentElement.parentElement.querySelector('.additional-image-url');
        if (urlInput) {
          urlInput.value = result.url;
        }
        
        // Actualizar preview con la URL de Cloudinary
        const preview = document.getElementById(`${imageId}-preview`);
        if (preview) {
          preview.src = result.url;
        }
        
        this.showNotification('✅ Imagen adicional subida exitosamente', 'success');
      } else {
        this.showNotification('❌ Error al subir imagen adicional', 'error');
      }
    } catch (error) {
      console.error('❌ Error subiendo imagen adicional:', error);
      this.showNotification('❌ Error al subir imagen adicional: ' + error.message, 'error');
    }
  }

  // Función para recolectar todas las imágenes del producto
  collectProductImages() {
    const images = [];
    
    // Imagen principal
    const mainImageUrl = document.getElementById('product-image-url')?.value?.trim();
    if (mainImageUrl) {
      images.push({
        url: mainImageUrl,
        primary: true
      });
    }
    
    // Imágenes adicionales
    const additionalImages = document.querySelectorAll('.additional-image-url');
    additionalImages.forEach((input, index) => {
      const url = input.value.trim();
      if (url) {
        images.push({
          url: url,
          primary: false
        });
      }
    });
    
    return images;
  }

  // Función auxiliar para actualizar filtros después de cambios
  async updateCategoryFilters() {
    try {
      console.log('🔄 Actualizando filtros de categoría...');
      if (typeof window.generateCategoryFilters === 'function') {
        await window.generateCategoryFilters();
        console.log('✅ Filtros actualizados exitosamente');
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron actualizar los filtros:', error);
    }
  }

  // ===== DATOS DE EJEMPLO CENTRALIZADOS =====
  // Función eliminada - ya no se usan datos de ejemplo hardcodeados
  
  getOrderById(orderId) {
    let orders = orderManager?.orders || [];
    
    // Buscar la orden por ID
    return orders.find(order => order.id == orderId);
  }

  viewOrder(orderId) {
    console.log('🔍 Viendo orden:', orderId);
    
    const order = this.getOrderById(orderId);
    
    if (!order) {
      alert('Orden no encontrada');
      return;
    }

    // Crear modal con detalles de la orden
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
        <button class="modal-close-btn" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
        <div class="order-detail-header">
          <h2><i class="fas fa-shopping-bag"></i> Detalle de Orden #${order.orderNumber || order.id}</h2>
        </div>
        <div class="order-detail-content">
          <div class="order-info-section">
            <h3><i class="fas fa-user"></i> Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${order.customer_info?.name || order.customerInfo?.name || 'No especificado'}</p>
            <p><strong>Email:</strong> ${order.customer_info?.email || order.customerInfo?.email || 'No especificado'}</p>
            <p><strong>Teléfono:</strong> ${order.customer_info?.phone || order.customerInfo?.phone || 'No especificado'}</p>
            <p><strong>Dirección:</strong> ${order.customer_info?.address || order.customerInfo?.address || 'No especificado'}</p>
          </div>
          
          <div class="order-status-section">
            <h3><i class="fas fa-flag"></i> Estado de la Orden</h3>
            <p><strong>Estado Actual:</strong> <span class="status ${order.status}">${order.status}</span></p>
            <p><strong>Fecha:</strong> ${order.date ? new Date(order.date).toLocaleDateString('es-CO') : order.created_at ? new Date(order.created_at).toLocaleDateString('es-CO') : 'No especificada'}</p>
            <p><strong>Total:</strong> <strong style="color: var(--primary-color);">$${(order.total || 0).toLocaleString('es-CO')}</strong></p>
          </div>
          
          ${order.items ? `
            <div class="order-products-section">
              <h3><i class="fas fa-box"></i> Productos</h3>
              <div class="order-products-list">
                ${order.items.map(item => `
                  <div class="order-product-item">
                    <div class="product-info">
                      <h4>${item.productName || item.name || 'Producto sin nombre'}</h4>
                      <p>Cantidad: ${item.quantity || 1}</p>
                      <p>Precio: $${(item.price || 0).toLocaleString('es-CO')}</p>
                    </div>
                    <div class="product-total">
                      <strong>$${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-CO')}</strong>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="order-detail-actions">
          <button onclick="adminPanel.changeOrderStatus('${order.id}')" class="btn btn-warning">
            <i class="fas fa-edit"></i> Cambiar Estado
          </button>
          ${order.status !== 'pending' && order.status !== 'cancelled' ? `
          <button onclick="adminPanel.showInvoiceOptions('${order.id}')" class="btn btn-success">
            <i class="fas fa-file-invoice-dollar"></i> Enviar Factura
          </button>` : ''}
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">
            <i class="fas fa-times"></i> Cerrar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  changeOrderStatus(orderId) {
    console.log('🔄 Cambiando estado de orden:', orderId);
    
    const order = this.getOrderById(orderId);
    
    if (!order) {
      alert('Orden no encontrada');
      return;
    }

    // Crear modal para cambiar estado
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <button class="modal-close-btn" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
        <div class="status-change-header">
          <h2><i class="fas fa-edit"></i> Cambiar Estado</h2>
          <p>Orden #${order.orderNumber || order.id}</p>
        </div>
        <div class="status-change-content">
          <div class="form-group">
            <label for="new-status">Nuevo Estado:</label>
            <select id="new-status" class="form-control">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
              <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
              <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>En Preparación</option>
              <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregado</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>
        </div>
        <div class="status-change-actions">
          <button onclick="adminPanel.updateOrderStatusAndShowInvoiceOptions('${order.id}', document.getElementById('new-status').value); this.parentElement.parentElement.parentElement.remove();" class="btn btn-primary">
            <i class="fas fa-save"></i> Actualizar Estado
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  updateOrderStatus(orderId, newStatus) {
    console.log('💾 Actualizando estado de orden:', orderId, 'a:', newStatus);
    
    const orders = orderManager?.orders || [];
    
    // Si hay órdenes reales, actualizar la real
    if (orders.length > 0) {
      const orderIndex = orders.findIndex(o => o.id === orderId || o.id === parseInt(orderId));
      
      if (orderIndex === -1) {
        alert('Orden no encontrada');
        return;
      }

      // Actualizar el estado
      orders[orderIndex].status = newStatus;
      
      // Guardar en localStorage si orderManager lo permite
      if (orderManager?.saveOrders) {
        orderManager.saveOrders();
      }
    } else {
      // Para órdenes de ejemplo, solo simular la actualización
      console.log('📝 Actualizando orden de ejemplo (simulado)');
    }
    
    // Actualizar la lista de órdenes
    this.loadOrdersList();
    
    alert(`Estado de la orden actualizado a: ${newStatus}`);
  }

  updateOrderStatusAndShowInvoiceOptions(orderId, newStatus) {
    console.log('💾 Actualizando estado con opciones de factura:', orderId, 'a:', newStatus);
    
    // Primero actualizar el estado
    this.updateOrderStatus(orderId, newStatus);
    
    // Mostrar opciones de facturación para todos los estados excepto 'pending' y 'cancelled'
    if (newStatus !== 'pending' && newStatus !== 'cancelled') {
      this.showInvoiceOptions(orderId);
    }
  }

  showInvoiceOptions(orderId) {
    console.log('📋 Mostrando opciones de facturación para orden:', orderId);
    
    const order = this.getOrderById(orderId);
    if (!order) {
      console.error('❌ Orden no encontrada para facturación');
      return;
    }

    // Crear modal con opciones de facturación
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = `invoice-modal-${orderId}`;
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <button class="modal-close-btn" onclick="document.getElementById('invoice-modal-${orderId}').remove()">
          <i class="fas fa-times"></i>
        </button>
        <div class="invoice-options-header">
          <h2><i class="fas fa-file-invoice-dollar"></i> Generar Factura</h2>
          <p>Orden #${order.orderNumber || order.order_number || order.id} - Estado: ${order.status}</p>
          <p><strong>Cliente:</strong> ${order.customer_info?.name || order.customerInfo?.name || 'No especificado'}</p>
          <p><strong>Total:</strong> <span style="color: var(--primary-color); font-weight: bold;">$${(order.total || 0).toLocaleString('es-CO')}</span></p>
        </div>
        <div class="invoice-options-content">
          <div class="invoice-option-card" onclick="adminPanel.generatePDFInvoice('${order.id}')">
            <div class="option-icon pdf">
              <i class="fas fa-file-pdf"></i>
            </div>
            <div class="option-info">
              <h3>Descargar Factura PDF</h3>
              <p>Generar y descargar la factura en formato PDF</p>
            </div>
            <div class="option-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div class="invoice-option-card" onclick="adminPanel.sendWhatsAppInvoice('${order.id}')">
            <div class="option-icon whatsapp">
              <i class="fab fa-whatsapp"></i>
            </div>
            <div class="option-info">
              <h3>Enviar por WhatsApp</h3>
              <p>Enviar mensaje con la factura al cliente</p>
            </div>
            <div class="option-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div class="invoice-option-card" onclick="adminPanel.generatePDFInvoice('${order.id}'); adminPanel.sendWhatsAppInvoice('${order.id}');">
            <div class="option-icon both">
              <i class="fas fa-paper-plane"></i>
            </div>
            <div class="option-info">
              <h3>PDF + WhatsApp</h3>
              <p>Descargar PDF y enviar mensaje de WhatsApp</p>
            </div>
            <div class="option-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
        <div class="invoice-options-actions">
          <button onclick="document.getElementById('invoice-modal-${orderId}').remove()" class="btn btn-secondary">
            <i class="fas fa-times"></i> Cerrar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  async generatePDFInvoice(orderId) {
    console.log('📄 Generando PDF para orden:', orderId);
    
    const order = this.getOrderById(orderId);
    if (!order) {
      alert('Orden no encontrada');
      return;
    }

    // Normalizar datos de la orden para InvoiceGenerator
    const normalizedOrder = {
      orderNumber: order.orderNumber || order.order_number || order.id,
      order_number: order.orderNumber || order.order_number || order.id,
      createdAt: order.date || order.created_at || new Date().toISOString(),
      created_at: order.date || order.created_at || new Date().toISOString(),
      status: order.status || 'confirmed',
      total: order.total || 0,
      customerInfo: order.customer_info || order.customerInfo || {},
      customer_info: order.customer_info || order.customerInfo || {},
      items: order.items || [],
      paymentMethod: order.paymentMethod || 'No especificado',
      notes: order.notes || ''
    };

    // Asegurar que customerInfo tenga todas las propiedades
    if (!normalizedOrder.customerInfo.city && normalizedOrder.customerInfo.address) {
      const address = normalizedOrder.customerInfo.address;
      if (address.includes('Bogotá')) normalizedOrder.customerInfo.city = 'Bogotá';
      else if (address.includes('Medellín')) normalizedOrder.customerInfo.city = 'Medellín';
      else if (address.includes('Cali')) normalizedOrder.customerInfo.city = 'Cali';
      else if (address.includes('Barranquilla')) normalizedOrder.customerInfo.city = 'Barranquilla';
      else if (address.includes('Bucaramanga')) normalizedOrder.customerInfo.city = 'Bucaramanga';
      else normalizedOrder.customerInfo.city = 'Colombia';
    }

    try {
      // Verificar que InvoiceGenerator esté disponible
      if (typeof window.invoiceGenerator === 'undefined') {
        console.log('🔄 InvoiceGenerator no disponible, inicializando...');
        if (typeof window.initializeInvoiceGenerator === 'function') {
          window.initializeInvoiceGenerator();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (window.invoiceGenerator && window.invoiceGenerator.downloadPDFInvoice) {
        console.log('📥 Iniciando descarga de PDF...');
        console.log('📋 Datos de la orden:', normalizedOrder);
        await window.invoiceGenerator.downloadPDFInvoice(normalizedOrder);
        console.log('✅ PDF generado y descargado exitosamente');
        alert('✅ Factura PDF descargada exitosamente');
      } else {
        throw new Error('InvoiceGenerator no está inicializado correctamente');
      }
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      alert('❌ Error generando PDF: ' + error.message);
    }
  }

  sendWhatsAppInvoice(orderId) {
    console.log('📱 Enviando WhatsApp para orden:', orderId);
    
    const order = this.getOrderById(orderId);
    if (!order) {
      alert('Orden no encontrada');
      return;
    }

    const customerPhone = order.customer_info?.phone || order.customerInfo?.phone;
    if (!customerPhone) {
      alert('No se encontró número de teléfono del cliente');
      return;
    }

    // Crear mensaje de WhatsApp
    const mensaje = `¡Hola ${order.customer_info?.name || order.customerInfo?.name || 'Cliente'}! 👋

Tu orden ha sido CONFIRMADA ✅

📋 *Detalles de tu pedido:*
🆔 Orden: #${order.orderNumber || order.order_number || order.id}
💰 Total: $${(order.total || 0).toLocaleString('es-CO')}

${order.items ? order.items.map(item => 
`• ${item.productName || item.name || 'Producto'} x${item.quantity || 1}`
).join('\n') : ''}

📱 ¡Gracias por tu compra en Luni Chairs!
🪑 Tu silla de ensueño está en camino

¿Tienes alguna pregunta? ¡Estamos aquí para ayudarte! 😊`;

    // Limpiar número de teléfono
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    
    // Crear URL de WhatsApp
    const whatsappURL = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(mensaje)}`;
    
    console.log('📱 Abriendo WhatsApp:', whatsappURL);
    window.open(whatsappURL, '_blank');
  }

  handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const imageFile = document.getElementById('product-image').files[0];

    if (!name || !price || !category) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const product = {
      id: Date.now().toString(),
      name,
      price,
      category,
      stock: 10, // Stock por defecto
      image: imageFile ? URL.createObjectURL(imageFile) : 'recursos/default-product.png'
    };

    if (productManager?.addProduct) {
      productManager.addProduct(product);
      alert('✅ Producto agregado exitosamente');
      e.target.reset();
    } else {
      alert('❌ Error al agregar producto');
    }
  }
}

// ===== FUNCIONES GLOBALES =====
function showAdminTab(tab) {
  console.log('🔄 Cambiando a pestaña:', tab);
  
  // Remover clase active de todos los tabs
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.remove('active');
    console.log('Removiendo active de:', t.dataset.tab);
  });
  
  document.querySelectorAll('.admin-tab-content').forEach(c => {
    c.classList.remove('active');
    console.log('Ocultando contenido:', c.id);
  });
  
  // Activar tab seleccionado
  const selectedTab = document.querySelector(`.admin-tab[data-tab="${tab}"]`);
  const selectedContent = document.getElementById(`admin-${tab}-tab`);
  
  console.log('Tab seleccionado:', selectedTab);
  console.log('Contenido seleccionado:', selectedContent);
  
  if (selectedTab) {
    selectedTab.classList.add('active');
    console.log('✅ Tab activado:', tab);
  } else {
    console.error('❌ No se encontró tab:', tab);
  }
  
  if (selectedContent) {
    selectedContent.classList.add('active');
    console.log('✅ Contenido mostrado:', tab);
  } else {
    console.error('❌ No se encontró contenido para:', tab);
  }
  
  // Actualizar menú mobile
  if (adminPanel && adminPanel.updateMobileActiveTab) {
    adminPanel.updateMobileActiveTab(tab);
  }
  
  // Cargar contenido específico
  if (adminPanel) {
    switch(tab) {
      case 'dashboard':
        adminPanel.loadDashboard();
        break;
      case 'orders':
        adminPanel.loadOrdersList();
        break;
      case 'products':
        if (adminPanel.loadProductsList) adminPanel.loadProductsList();
        break;
      case 'categories':
        if (adminPanel.loadCategoriesList) adminPanel.loadCategoriesList();
        break;
      case 'add-product':
        // Mostrar formulario de agregar producto
        console.log('Mostrando tab de agregar producto');
        const productForm = document.getElementById('product-form');
        if (productForm) {
          productForm.style.display = 'block';
        }
        // Cargar categorías en el select
        if (adminPanel.loadCategoriesInSelect) {
          adminPanel.loadCategoriesInSelect();
        }
        break;
    }
  }
}

function filterOrders(status) {
  document.querySelectorAll('.filter-status').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.filter-status[data-status="${status}"]`)?.classList.add('active');
  
  if (adminPanel?.loadOrdersList) {
    adminPanel.loadOrdersList(status);
  }
}

// Inicializar panel de administración
const adminPanel = new AdminPanel();

// Función global para cambiar período de gráficas
function changePeriodChart(period) {
  console.log('📊 Cambiando período de gráfica a:', period);
  
  // Actualizar botones activos
  document.querySelectorAll('.period-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[onclick="changePeriodChart('${period}')"]`)?.classList.add('active');
  
  // Recargar gráfica de ventas con el nuevo período
  if (window.adminPanel) {
    const orders = orderManager?.orders || [];
    let effectiveOrders = orders;
    if (orders.length === 0) {
      // No mostrar gráficas si no hay órdenes reales
      console.log('📊 No hay órdenes para mostrar gráficas de ventas');
      return;
    }
    
    const validOrders = effectiveOrders.filter(order => 
      order.status !== 'pending' && order.status !== 'cancelled'
    );
    
    window.adminPanel.loadSalesChart(validOrders, period);
  }
}

// Exportar para uso global
window.adminPanel = adminPanel;
window.showAdminTab = showAdminTab;
window.filterOrders = filterOrders;
window.changePeriodChart = changePeriodChart;