// Panel de administración limpio y sin duplicados
class AdminPanel {
  constructor() {
    this.currentTab = 'dashboard';
    // Propiedades para paginación de productos
    this.currentPage = 1;
    this.productsPerPage = 10;
    this.totalProducts = 0;
    this.allProducts = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateAuthUI();
    // console.log('✅ AdminPanel inicializado correctamente');
  }

  async initialize() {
    // console.log('🚀 Inicializando AdminPanel managers...');
    try {
      // Esperar a que se inicialicen los managers solo si tienen la función
      if (typeof productManager !== 'undefined' && typeof productManager.initialize === 'function') {
        await productManager.initialize();
        // console.log('✅ ProductManager inicializado');
      } else if (typeof productManager !== 'undefined') {
        // console.log('ℹ️ ProductManager disponible pero sin función initialize');
      }
      
      if (typeof orderManager !== 'undefined' && typeof orderManager.initialize === 'function') {
        await orderManager.initialize();
        // console.log('✅ OrderManager inicializado');
      } else if (typeof orderManager !== 'undefined') {
        // console.log('ℹ️ OrderManager disponible pero sin función initialize');
      }
      
      // console.log('✅ AdminPanel managers verificados correctamente');
    } catch (error) {
      // console.error('❌ Error inicializando AdminPanel managers:', error);
    }
  }

  // Generar datos de prueba para desarrollo
  generateTestData() {
    // console.log('🧪 Generando datos de prueba para dashboard...');
    
    const now = new Date();
    const testOrders = [
      {
        id: 'test-order-1',
        order_number: 'ORD-001',
        date: new Date(now.getTime() - 86400000 * 5).toISOString(), // 5 días atrás
        created_at: new Date(now.getTime() - 86400000 * 5).toISOString(),
        status: 'completed',
        total: 15000,
        customer: 'Juan Pérez',
        customerEmail: 'juan@test.com',
        items: [
          { productName: 'Orquídea Rosa', quantity: 2, price: 6000 },
          { productName: 'Set Mini x3', quantity: 1, price: 3000 }
        ]
      },
      {
        id: 'test-order-2',
        order_number: 'ORD-002',
        date: new Date(now.getTime() - 86400000 * 3).toISOString(), // 3 días atrás
        created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
        status: 'shipped',
        total: 8000,
        customer: 'María González',
        customerEmail: 'maria@test.com',
        items: [
          { productName: 'Rosa Eternal', quantity: 1, price: 8000 }
        ]
      },
      {
        id: 'test-order-3',
        order_number: 'ORD-003',
        date: new Date(now.getTime() - 86400000 * 1).toISOString(), // 1 día atrás
        created_at: new Date(now.getTime() - 86400000 * 1).toISOString(),
        status: 'confirmed',
        total: 12000,
        customer: 'Carlos López',
        customerEmail: 'carlos@test.com',
        items: [
          { productName: 'Set Deluxe', quantity: 1, price: 12000 }
        ]
      },
      {
        id: 'test-order-4',
        order_number: 'ORD-004',
        date: now.toISOString(), // Hoy
        created_at: now.toISOString(),
        status: 'pending',
        total: 5000,
        customer: 'Ana Ruiz',
        customerEmail: 'ana@test.com',
        items: [
          { productName: 'Mini Rosa', quantity: 2, price: 2500 }
        ]
      }
    ];

    const testProducts = [
      {
        id: 'test-prod-1',
        name: 'Orquídea Rosa',
        category: 'Orquídeas',
        stock: 15,
        price: 6000,
        available: true
      },
      {
        id: 'test-prod-2',
        name: 'Rosa Eternal',
        category: 'Rosas',
        stock: 3,
        price: 8000,
        available: true
      },
      {
        id: 'test-prod-3',
        name: 'Set Mini x3',
        category: 'Sets',
        stock: 0,
        price: 3000,
        available: false
      },
      {
        id: 'test-prod-4',
        name: 'Set Deluxe',
        category: 'Sets',
        stock: 8,
        price: 12000,
        available: true
      },
      {
        id: 'test-prod-5',
        name: 'Mini Rosa',
        category: 'Minis',
        stock: 2,
        price: 2500,
        available: true
      }
    ];

    // console.log('🔍 Datos de prueba generados:', { 
    //   orders: testOrders.length, 
    //   products: testProducts.length 
    // });
    return { orders: testOrders, products: testProducts };
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
      addCategoryBtn.addEventListener('click', () => this.showNewCategoryForm());
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

    // Event listener para generar slug automáticamente
    this.setupCategoryNameToSlugListener();

    // Configurar filtros y paginación de órdenes
    this.setupOrdersFilters();

    // Configurar menú hamburguesa solo para mobile
    this.setupMobileMenuIfNeeded();
  }

  setupCategoryNameToSlugListener() {
    // Configurar listener cuando el modal esté disponible
    const setListener = () => {
      const categoryNameInput = document.getElementById('category-name');
      const categorySlugInput = document.getElementById('category-slug');
      
      if (categoryNameInput && categorySlugInput) {
        // Remover listener anterior si existe
        categoryNameInput.removeEventListener('input', this.generateSlugFromName);
        
        // Función para generar slug
        this.generateSlugFromName = (e) => {
          // Si el campo slug está vacío o fue generado automáticamente, actualizarlo
          const currentSlug = categorySlugInput.value;
          const generatedSlug = this.generateSlug(e.target.value);
          
          // Solo actualizar si el campo está vacío o si ya contenía un slug generado
          if (!currentSlug || this.isGeneratedSlug(currentSlug, categoryNameInput.value)) {
            categorySlugInput.value = generatedSlug;
          }
        };
        
        // Agregar listener
        categoryNameInput.addEventListener('input', this.generateSlugFromName);
      }
    };
    
    // Intentar configurar inmediatamente
    setListener();
    
    // También configurar cuando se abra el modal
    const originalShowModal = this.createAdminModal;
    this.createAdminModal = (...args) => {
      const result = originalShowModal.apply(this, args);
      setTimeout(setListener, 100); // Pequeño delay para asegurar que el DOM esté listo
      return result;
    };
  }

  generateSlug(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .trim()
      .replace(/[áäàâã]/g, 'a')
      .replace(/[éëèê]/g, 'e')
      .replace(/[íïìî]/g, 'i')
      .replace(/[óöòôõ]/g, 'o')
      .replace(/[úüùû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Múltiples guiones consecutivos por uno solo
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
  }

  isGeneratedSlug(slug, name) {
    // Verificar si el slug actual corresponde al nombre (podría haber sido generado automáticamente)
    const expectedSlug = this.generateSlug(name);
    return slug === expectedSlug || slug === '';
  }

  setupOrdersFilters() {
    // Event listener para filtro de estado
    const statusFilter = document.getElementById('orders-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        const status = e.target.value;
        // console.log('🔄 Cambiando filtro de estado a:', status);
        this.loadOrdersList(status, 1, this.ordersPerPage || 10);
      });
    }

    // Event listener para cambiar items por página
    const itemsPerPageSelect = document.getElementById('orders-per-page');
    if (itemsPerPageSelect) {
      itemsPerPageSelect.addEventListener('change', (e) => {
        const itemsPerPage = parseInt(e.target.value);
        // console.log('🔄 Cambiando items por página a:', itemsPerPage);
        this.loadOrdersList(this.ordersStatusFilter || 'all', 1, itemsPerPage);
      });
    }

    // Configurar valores por defecto
    if (statusFilter) statusFilter.value = 'all';
    if (itemsPerPageSelect) itemsPerPageSelect.value = '10';
  }

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
      const currentActiveTab = document.querySelector('.admin-tab.active');
      const activeTabText = currentActiveTab ? currentActiveTab.textContent.trim() : 'Dashboard';
      adminTabs.innerHTML = `
        <div class="admin-tabs-toggle modern-toggle" onclick="adminPanel.toggleMobileTabsMenu()">
          <div class="hamburger-icon modern-hamburger">
            <span></span><span></span><span></span>
          </div>
          <span class="current-tab-text">${activeTabText}</span>
        </div>
        <div class="admin-tabs-overlay"></div>
        <div class="admin-tabs-sidebar">
          <button class="admin-tab" data-tab="dashboard">
            <i class="fas fa-chart-line"></i> Dashboard
          </button>
          <button class="admin-tab" data-tab="orders">
            <i class="fas fa-shopping-bag"></i> Ventas
          </button>
          <button class="admin-tab" data-tab="categories">
            <i class="fas fa-tags"></i> Categorías
          </button>
          <button class="admin-tab" data-tab="products">
            <i class="fas fa-box"></i> Productos
          </button>
          <button class="admin-tab" data-tab="add-product">
            <i class="fas fa-plus"></i> Agregar Producto
          </button>
        </div>
      `;
      document.querySelector('.admin-tabs-sidebar').classList.remove('show');
      document.querySelector('.admin-tabs-overlay').style.display = 'none';
      // Add event listeners to close menu on tab click
      setTimeout(() => {
        const sidebar = document.querySelector('.admin-tabs-sidebar');
        const tabs = sidebar.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
          tab.addEventListener('click', function() {
            const tabName = tab.getAttribute('data-tab');
            window.showAdminTab(tabName);
            sidebar.classList.remove('show');
            document.querySelector('.admin-tabs-toggle').classList.remove('active');
            document.querySelector('.admin-tabs-overlay').style.display = 'none';
          });
        });
      }, 100);
    }
    else if (!isMobile && document.querySelector('.admin-tabs-toggle')) {
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
    const sidebar = document.querySelector('.admin-tabs-sidebar');
    const overlay = document.querySelector('.admin-tabs-overlay');
    if (toggle && sidebar && overlay) {
      const isOpen = sidebar.classList.contains('show');
      if (isOpen) {
        sidebar.classList.remove('show');
        toggle.classList.remove('active');
        overlay.style.display = 'none';
        this.removeMobileMenuListener();
      } else {
        sidebar.classList.add('show');
        toggle.classList.add('active');
        overlay.style.display = 'block';
        this.addMobileMenuListener();
      }
    }
  }

  // Agregar listener para cerrar menú al hacer click fuera
  addMobileMenuListener() {
    if (!this.mobileMenuListener) {
      this.mobileMenuListener = (e) => {
        const sidebar = document.querySelector('.admin-tabs-sidebar');
        const toggle = document.querySelector('.admin-tabs-toggle');
        const overlay = document.querySelector('.admin-tabs-overlay');
        if (sidebar && toggle && overlay && (e.target === overlay || (!toggle.contains(e.target) && !sidebar.contains(e.target)))) {
          sidebar.classList.remove('show');
          toggle.classList.remove('active');
          overlay.style.display = 'none';
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
      // console.log('✅ Login exitoso');
    } else {
      const errorMessage = result?.message || 'Credenciales incorrectas';
      this.showNotification(`❌ Error de acceso: ${errorMessage}`, 'error');
      // console.log('❌ Error de login:', errorMessage);
    }
  }

  logout() {
    if (authSystem?.logout()) {
      this.showNotification('👋 Sesión cerrada exitosamente', 'info');
      this.closeAdminPanel();
      this.updateAuthUI();
      // console.log('✅ Logout exitoso');
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
      // console.log('🔄 Removiendo modal existente para recrear con widgets...');
      existingModal.remove();
    }

    // console.log('🔍 Creando modal completamente nuevo...');
    this.createAdminModal();
  }

  createAdminModal() {
    // console.log('🏗️ Iniciando creación de modal admin...');
    
    // Verificar si ya existe un modal y removerlo
    const existingModal = document.getElementById('admin-modal');
    if (existingModal) {
      // console.log('⚠️ Modal admin ya existe, removiendo anterior...');
      existingModal.remove();
    }
    
    // console.log('🏗️ Creando elemento modal...');
    const modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.className = 'modal admin-modal';
    
    // console.log('📝 Preparando HTML del modal...');
    const modalHTML = `
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
            <h3><i class="fas fa-chart-line"></i> Dashboard Analítico</h3>
            
            <div class="dashboard-filters">
              <button class="period-filter" data-period="7">Últimos 7 días</button>
              <button class="period-filter" data-period="30">Últimos 30 días</button>
              <button class="period-filter active" data-period="90">Últimos 90 días</button>
              <button class="period-filter" data-period="180">Últimos 6 meses</button>
              <button class="period-filter" data-period="365">Último año</button>
              <button class="period-filter" data-period="999999">Todas las fechas</button>
            </div>

            <div class="dashboard-kpis">
              <div class="kpi-card revenue">
                <div class="kpi-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="kpi-content">
                  <h4>Ingresos Totales</h4>
                  <p id="kpi-total-revenue">$0</p>
                  <span id="kpi-revenue-change" class="kpi-change">+0%</span>
                </div>
              </div>
              <div class="kpi-card orders">
                <div class="kpi-icon"><i class="fas fa-shopping-cart"></i></div>
                <div class="kpi-content">
                  <h4>Total Órdenes</h4>
                  <p id="kpi-total-orders">0</p>
                  <span id="kpi-orders-change" class="kpi-change">+0%</span>
                </div>
              </div>
              <div class="kpi-card ticket">
                <div class="kpi-icon"><i class="fas fa-receipt"></i></div>
                <div class="kpi-content">
                  <h4>Ticket Promedio</h4>
                  <p id="kpi-average-ticket">$0</p>
                  <span id="kpi-ticket-change" class="kpi-change">+0%</span>
                </div>
              </div>
              <div class="kpi-card conversion">
                <div class="kpi-icon"><i class="fas fa-percentage"></i></div>
                <div class="kpi-content">
                  <h4>Tasa Conversión</h4>
                  <p id="kpi-conversion-rate">0%</p>
                  <span id="kpi-conversion-change" class="kpi-change">+0%</span>
                </div>
              </div>
              <div class="kpi-card customers">
                <div class="kpi-icon"><i class="fas fa-users"></i></div>
                <div class="kpi-content">
                  <h4>Clientes Únicos</h4>
                  <p id="kpi-unique-customers">0</p>
                  <span id="kpi-customers-change" class="kpi-change">+0%</span>
                </div>
              </div>
              <div class="kpi-card products">
                <div class="kpi-icon"><i class="fas fa-box"></i></div>
                <div class="kpi-content">
                  <h4>Productos Activos</h4>
                  <p id="kpi-active-products">0</p>
                  <span id="kpi-products-change" class="kpi-change">+0</span>
                </div>
              </div>
            </div>

            <div class="dashboard-charts">
              <div class="chart-row">
                <div class="chart-container"><canvas id="sales-day-chart"></canvas></div>
                <div class="chart-container"><canvas id="status-pie-chart"></canvas></div>
              </div>
              <div class="chart-row">
                <div class="chart-container"><canvas id="top-products-chart"></canvas></div>
              </div>
            </div>

            <!-- Widgets Adicionales -->
            <div class="dashboard-widgets">
              <div class="widget critical-products">
                <h4><i class="fas fa-exclamation-triangle"></i> Productos Críticos</h4>
                <div id="critical-products-list">
                  <!-- Se carga dinámicamente -->
                </div>
              </div>
              
              <div class="widget top-gainers">
                <h4><i class="fas fa-trending-up"></i> Top Productos por Ganancia</h4>
                <div id="top-gainers-list">
                  <!-- Se carga dinámicamente -->
                </div>
              </div>
              
              <div class="widget low-stock-summary">
                <h4><i class="fas fa-warehouse"></i> Resumen de Stock</h4>
                <div id="stock-summary">
                  <!-- Se carga dinámicamente -->
                </div>
              </div>
            </div>
          </div>

          <div id="admin-orders-tab" class="admin-tab-content">
            <div class="orders-header">
              <h3><i class="fas fa-shopping-bag"></i> Gestión de Ventas</h3>
              <div class="orders-filters">
                <select id="orders-status-filter" class="filter-select">
                  <option value="all">Todos los Estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <select id="orders-per-page" class="filter-select">
                  <option value="10">10 por página</option>
                  <option value="25">25 por página</option>
                  <option value="50">50 por página</option>
                  <option value="100">100 por página</option>
                </select>
              </div>
            </div>
            
            <div class="orders-stats">
              <div class="stat-card">
                <div class="stat-value" id="orders-total">0</div>
                <div class="stat-label">Total Órdenes</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="orders-revenue">$0</div>
                <div class="stat-label">Ingresos Totales</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" id="filtered-orders-count">0</div>
                <div class="stat-label">Órdenes Filtradas</div>
              </div>
            </div>
            
            <div id="admin-orders-list" class="orders-list"></div>
            
            <div id="orders-pagination" class="pagination-container">
              <div class="pagination-info">
                <span id="pagination-info-text">Mostrando 0 - 0 de 0 resultados</span>
              </div>
              <div class="pagination-controls">
                <button id="prev-page" class="pagination-btn" disabled>
                  <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <div id="pagination-numbers" class="pagination-numbers"></div>
                <button id="next-page" class="pagination-btn" disabled>
                  Siguiente <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div id="admin-products-tab" class="admin-tab-content">
            <h3>Gestión de Productos</h3>
            <div id="admin-products-list"></div>
          </div>

          <div id="admin-categories-tab" class="admin-tab-content">
            <h3><i class="fas fa-tags"></i> Gestión de Categorías</h3>
            
            <div class="categories-header">
              <button onclick="adminPanel.showNewCategoryForm()" class="btn btn-primary">
                <i class="fas fa-plus"></i> Agregar Nueva Categoría
              </button>
            </div>
            
            <!-- Formulario de Categorías -->
            <div id="category-form" class="category-form" style="display: none;">
              <h4 id="category-form-title">Agregar Nueva Categoría</h4>
              <form onsubmit="adminPanel.saveCategory(event)">
                <input type="hidden" id="category-id">
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="category-name">Nombre de la Categoría *</label>
                    <input type="text" id="category-name" required placeholder="Ej: Ganchitos">
                  </div>
                  <div class="form-group">
                    <label for="category-slug">Slug (URL) *</label>
                    <input type="text" id="category-slug" required placeholder="ej: ganchitos">
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="category-icon">Icono (Emoji)</label>
                    <input type="text" id="category-icon" placeholder="🎀">
                  </div>
                  <div class="form-group">
                    <label for="category-active">
                      <input type="checkbox" id="category-active" checked>
                      Categoría Activa
                    </label>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="submit" id="save-category-btn" class="btn btn-primary">
                    <i class="fas fa-save"></i> Guardar Categoría
                  </button>
                  <button type="button" onclick="adminPanel.cancelCategoryForm()" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Cancelar
                  </button>
                </div>
              </form>
            </div>
            
            <!-- Lista de Categorías -->
            <div id="admin-categories-list" class="admin-categories-list">
              <!-- Las categorías se cargan dinámicamente -->
            </div>
          </div>

          <div id="admin-add-product-tab" class="admin-tab-content">
            <h3><i class="fas fa-plus"></i> Agregar Producto</h3>
            <form id="add-product-form" class="product-form">
              
              <div class="form-section">
                <h4>Información Básica</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="product-name">Nombre del Producto *</label>
                    <input type="text" id="product-name" required placeholder="Ej: Ganchito Rosa Elegante">
                  </div>
                  <div class="form-group">
                    <label for="product-category">Categoría *</label>
                    <select id="product-category" required>
                      <option value="">Seleccione una categoría</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="product-price">Precio *</label>
                    <input type="number" id="product-price" min="0" step="100" required placeholder="Ej: 5000">
                  </div>
                  <div class="form-group">
                    <label for="product-stock">Stock Inicial</label>
                    <input type="number" id="product-stock" min="0" value="10" placeholder="Cantidad disponible">
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Características</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="product-color">Color</label>
                    <input type="text" id="product-color" placeholder="Ej: Rosa, Azul, Multicolor">
                  </div>
                  <div class="form-group">
                    <label for="product-size">Tamaño</label>
                    <select id="product-size">
                      <option value="">Seleccionar tamaño</option>
                      <option value="Pequeño">Pequeño</option>
                      <option value="Mediano">Mediano</option>
                      <option value="Grande">Grande</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label for="product-description">Descripción</label>
                  <textarea id="product-description" rows="3" placeholder="Descripción detallada del producto..."></textarea>
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
                        <img id="product-image-preview" src="recursos/lunilogo.png" alt="Preview" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px;">
                        <div class="upload-progress-container">
                          <div id="upload-progress" class="upload-progress"></div>
                        </div>
                      </div>
                      <div class="upload-controls">
                        <label for="product-image-input" class="btn btn-upload">
                          <i class="fas fa-cloud-upload-alt"></i> Subir Imagen Principal
                        </label>
                        <input type="file" id="product-image-input" accept="image/*" style="display: none;">
                        <small>Formatos: JPG, PNG, WEBP (máx. 5MB)</small>
                      </div>
                      <div class="form-group">
                        <label for="product-image-url">URL de Imagen Principal (Cloudinary)</label>
                        <input type="text" id="product-image-url" placeholder="Se actualizará automáticamente al subir" onchange="document.getElementById('product-image-preview').src = this.value || 'recursos/lunilogo.png'">
                      </div>
                    </div>
                  </div>
                  
                  <!-- Imágenes Adicionales -->
                  <div class="additional-images-section">
                    <h5>Imágenes Adicionales (Opcional)</h5>
                    <div id="additional-images-container">
                      <!-- Se cargarán dinámicamente -->
                    </div>
                    <div class="additional-images-controls">
                      <button type="button" onclick="adminPanel.addAdditionalImageField()" class="btn btn-secondary">
                        <i class="fas fa-plus"></i> Agregar Imagen Adicional
                      </button>
                      <small class="help-text">Máximo 4 imágenes adicionales. Ideal para mostrar diferentes ángulos del producto.</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <div class="form-group">
                  <label for="product-available">
                    <input type="checkbox" id="product-available" checked>
                    Producto Disponible
                  </label>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" onclick="adminPanel.showAddProductPreview()" class="btn btn-info" style="background-color: #D6C9CC; color: #3B2C35; border: none; font-weight: 600; box-shadow: 0 2px 8px rgba(59,44,53,0.08);">
                  <i class="fas fa-eye"></i> Vista Previa Profesional
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-plus"></i> Agregar Producto
                </button>
                <button type="reset" class="btn btn-secondary">
                  <i class="fas fa-eraser"></i> Limpiar Formulario
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // console.log('✍️ Asignando HTML al modal...');
    modal.innerHTML = modalHTML;
    
    // console.log('📏 Verificando longitud del HTML:', modalHTML.length);
    // console.log('🔍 HTML contiene widgets?', modalHTML.includes('dashboard-widgets'));

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    this.setupAdminEventListeners();
    //
    // Verificar inmediatamente después de crear el modal
    // console.log('🔍 Verificación inmediata del modal creado:');
    // console.log('- Modal existe:', !!document.getElementById('admin-modal'));
    // console.log('- Dashboard tab existe:', !!document.getElementById('admin-dashboard-tab'));
    // console.log('- Dashboard widgets existe:', !!document.querySelector('.dashboard-widgets'));
    // console.log('- Critical widget existe:', !!document.querySelector('.widget.critical-products'));
    // console.log('- HTML del modal (primeros 500 chars):', modal.innerHTML.substring(0, 500));
    
    // Verificar que los widgets existen en el DOM
    setTimeout(() => {
      // console.log('🔍 Verificando elementos DOM después de crear modal:');
      const modalCheck = document.getElementById('admin-modal');
      if (modalCheck) {
        // console.log('- Elementos .dashboard-widgets en modal:', modalCheck.querySelectorAll('.dashboard-widgets').length);
        // console.log('- Elementos .widget en modal:', modalCheck.querySelectorAll('.widget').length);
        // console.log('- Critical products en modal:', modalCheck.querySelectorAll('.widget.critical-products').length);
        // console.log('- Stock summary en modal:', modalCheck.querySelectorAll('.widget.low-stock-summary').length);
      } else {
        // console.log('❌ Modal no encontrado en verificación retrasada');
      }
    }, 50);
    
    // Forzar inicialización de managers y cargar dashboard con mayor delay
    setTimeout(async () => {
      // console.log('Iniciando carga de datos reales...');
      
      // Intentar inicializar/refrescar managers
      try {
        if (typeof productManager !== 'undefined' && typeof productManager.loadProducts === 'function') {
          // console.log('Refrescando productos desde BD...');
          await productManager.loadProducts();
        }
        
        if (typeof orderManager !== 'undefined' && typeof orderManager.loadOrders === 'function') {
          // console.log('Refrescando órdenes desde BD...');
          await orderManager.loadOrders();
        }
      } catch (error) {
        // console.log('Error refrescando datos:', error);
      }
      
      this.loadDashboard();
    }, 500); // Aumentar significativamente el delay para asegurar DOM completo
  }

  setupAdminEventListeners() {
    const closeBtn = document.getElementById('admin-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeAdminPanel());
    }

    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
      
      // Configurar event listener para subida de imagen principal
      const imageInput = document.getElementById('product-image-input');
      if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const preview = document.getElementById('product-image-preview');
            const urlInput = document.getElementById('product-image-url');
            // Mostrar notificación de carga
            adminPanel.showNotification('Cargando imagen...', 'info');
            // Mostrar barra de progreso
            const progressContainer = document.querySelector('.upload-progress-container');
            const progressBar = document.getElementById('upload-progress');
            if (progressContainer && progressBar) {
              progressContainer.style.display = 'block';
              progressBar.style.width = '0%';
              let width = 0;
              const interval = setInterval(() => {
                width += Math.random() * 20;
                if (width >= 90) {
                  clearInterval(interval);
                  progressBar.style.width = '90%';
                } else {
                  progressBar.style.width = width + '%';
                }
              }, 200);
              // Simular carga real
              const reader = new FileReader();
              reader.onload = function(event) {
                preview.src = event.target.result;
                urlInput.value = event.target.result;
                progressBar.style.width = '100%';
                setTimeout(() => {
                  progressContainer.style.display = 'none';
                  adminPanel.showNotification('✅ Imagen cargada correctamente', 'success');
                }, 600);
              };
              reader.onerror = function() {
                progressContainer.style.display = 'none';
                adminPanel.showNotification('❌ Error al cargar la imagen', 'error');
              };
              reader.readAsDataURL(file);
            } else {
              // Fallback si no hay barra
              const reader = new FileReader();
              reader.onload = function(event) {
                preview.src = event.target.result;
                urlInput.value = event.target.result;
                adminPanel.showNotification('✅ Imagen cargada correctamente', 'success');
              };
              reader.onerror = function() {
                adminPanel.showNotification('❌ Error al cargar la imagen', 'error');
              };
              reader.readAsDataURL(file);
            }
          }
        });
      }
      
      // Cargar categorías en el select del formulario
      this.loadCategoriesInSelect('product-category');
    }
  }

  closeAdminPanel() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // ===== CARGA DE DATOS =====
  loadDashboard(period = 90) {
    // console.log('Cargando dashboard para período de ' + period + ' días...');
    
    try {
      // Verificar managers
      // console.log('Verificando managers:', { ... })
      // (log removed, object literal removed)

      let orders = orderManager?.orders || [];
      let products = productManager?.products || [];
      
      // Validar y agregar stock por defecto si no existe - PARA DATOS REALES
      if (products.length > 0) {
        products = products.map(product => {
          // Para datos reales de Firebase/BD, asegurar que tengan stock válido
          let validStock = product.stock;
          if (validStock === undefined || validStock === null || isNaN(validStock)) {
            // Si no tienen stock, usar un valor aleatorio para demostración
            validStock = Math.floor(Math.random() * 15) + 1; // 1-15 unidades
            // console.log(`🔄 Producto '${product.name}' sin stock válido, asignando: ${validStock}`);
          }
          return {
            ...product,
            stock: parseInt(validStock) || 0
          };
        });
        // console.log('🔍 Productos con stock normalizado:', products.slice(0, 5).map(p => ({name: p.name, stock: p.stock, originalStock: p.originalStock || 'N/A'})));
        // console.log(`📋 Total productos procesados: ${products.length}`);
      }
      
      // console.log('Datos reales de BD:', { ... })
      // (log removed, object literal removed)
      
      // Solo usar datos de prueba si NO hay datos reales
      if (orders.length === 0) {
        // console.log('No hay órdenes reales en BD, usando datos de prueba como respaldo...');
        const testData = this.generateTestData();
        orders = testData.orders;
        if (products.length === 0) {
          products = testData.products;
        } else {
          // Si usamos datos reales, agregar stock aleatorio para demostración
          products = products.map((product, index) => ({
            ...product,
            stock: product.stock !== undefined ? product.stock : Math.floor(Math.random() * 20) + 1 // Stock aleatorio entre 1-20
          }));
          // console.log('🔄 Productos reales con stock simulado para demostración:', products.map(p => ({name: p.name, stock: p.stock})));
        }
        // console.log('Usando datos de prueba: ...')
      } else {
        // console.log('Usando datos reales de la base de datos: ...')
      }
      
      // console.log('Datos finales a usar: ...')
      
      // Configurar event listeners para filtros de período
      this.setupPeriodFilters();
      
      // Si aún no hay órdenes después de cargar datos de prueba, mostrar estadísticas vacías
      if (orders.length === 0) {
        // console.log('No hay órdenes disponibles incluso con datos de prueba, mostrando estadísticas vacías...');
        this.showEmptyDashboard();
        return;
      }
      
      // Filtrar órdenes por período
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - period);
      
      // console.log('DEBUG Filtro de fechas: ...')
      
      const filteredOrders = orders.filter((order, index) => {
        // Si es "todas las fechas", incluir todas las órdenes
        if (period >= 999999) {
          if (index < 3) {
            // console.log('Orden ' + (index + 1) + ' (SIN FILTRO): ...')
          }
          return true;
        }
        
        const orderDate = new Date(order.created_at || new Date());
        const isInPeriod = orderDate >= cutoffDate;
        
        if (index < 3) { // Log primeras 3 órdenes para debugging
          // console.log('Orden ' + (index + 1) + ': ...')
        }
        
        return isInPeriod;
      });
      
      // console.log('Filtro por período: ' + orders.length + ' -> ' + filteredOrders.length + ' órdenes');
      
      const validOrders = filteredOrders.filter(order => {
        const status = (order.status || '').toLowerCase();
        const excludedStatuses = ['cancelled', 'cancelado', 'canceled'];
        return !excludedStatuses.includes(status);
      });
      
      // Calcular período anterior para comparaciones
      const previousPeriodStart = new Date(cutoffDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - period);
      
      const previousOrders = orders.filter(order => {
        // Si es "todas las fechas", no hay período anterior para comparar
        if (period >= 999999) return false;
        
        const orderDate = new Date(order.created_at || new Date());
        return orderDate >= previousPeriodStart && orderDate < cutoffDate;
      }).filter(order => {
        const status = (order.status || '').toLowerCase();
        const excludedStatuses = ['cancelled', 'cancelado', 'canceled'];
        return !excludedStatuses.includes(status);
      });
      
      // Calcular KPIs principales
      this.calculateAndDisplayKPIs(validOrders, previousOrders, products, period);
      
      // Cargar todos los gráficos
      this.loadAllCharts(filteredOrders, validOrders, period);
      
      // Cargar widgets adicionales
      this.loadDashboardWidgets(validOrders, products);
      
      // console.log(`✅ Dashboard cargado: ${validOrders.length} órdenes válidas en ${period} días`);
      
    } catch (error) {
      // console.error('❌ Error cargando dashboard:', error);
      this.showEmptyDashboard();
    }
  }

  setupPeriodFilters() {
    const filterButtons = document.querySelectorAll('.period-filter');
    filterButtons.forEach(button => {
      // Solo añadir listener a los botones que no son de datos de prueba
      if (!button.id || button.id !== 'load-test-data') {
        button.addEventListener('click', (e) => {
          // Remover active de todos los botones
          filterButtons.forEach(btn => {
            if (!btn.id || btn.id !== 'load-test-data') {
              btn.classList.remove('active');
            }
          });
          // Añadir active al botón clickeado
          e.target.classList.add('active');
          // Cargar dashboard con nuevo período
          const period = parseInt(e.target.dataset.period);
          this.loadDashboard(period);
        });
      }
    });
  }

  setupTestDataButton() {
    // Configurar botón de datos de prueba
    const testDataBtn = document.getElementById('load-test-data');
    // console.log('🔍 Buscando botón de datos de prueba:', !!testDataBtn);
    
    if (testDataBtn) {
      // console.log('✅ Botón de datos de prueba encontrado, agregando listener...');
      testDataBtn.addEventListener('click', (e) => {
        // console.log('🧪 Click en botón de solo datos de prueba');
        e.preventDefault();
        this.loadDashboardWithTestData();
      });
    }

    // Configurar botón de refresh datos reales
    const refreshBtn = document.getElementById('refresh-real-data');
    // console.log('🔍 Buscando botón de refresh BD:', !!refreshBtn);
    
    if (refreshBtn) {
      // console.log('✅ Botón de refresh BD encontrado, agregando listener...');
      refreshBtn.addEventListener('click', (e) => {
        // console.log('🔄 Click en botón de actualizar BD');
        e.preventDefault();
        this.refreshRealData();
      });
    }
  }

  async refreshRealData() {
    // console.log('🔄 Refrescando datos reales desde BD...');
    
    try {
      // Mostrar indicador de carga
      const refreshBtn = document.getElementById('refresh-real-data');
      if (refreshBtn) {
        refreshBtn.innerHTML = '⏳ Cargando...';
        refreshBtn.disabled = true;
      }

      // Intentar cargar datos desde BD
      if (typeof productManager !== 'undefined') {
        // console.log('📦 Refrescando productos...');
        if (typeof productManager.loadProducts === 'function') {
          await productManager.loadProducts();
        } else if (typeof productManager.initialize === 'function') {
          await productManager.initialize();
        }
      }
      
      if (typeof orderManager !== 'undefined') {
        // console.log('🛒 Refrescando órdenes...');
        if (typeof orderManager.loadOrders === 'function') {
          await orderManager.loadOrders();
        } else if (typeof orderManager.initialize === 'function') {
          await orderManager.initialize();
        }
      }

      // Recargar dashboard con datos frescos
      // console.log('✅ Datos refrescados, recargando dashboard...');
      this.loadDashboard();

      // Restaurar botón
      if (refreshBtn) {
        refreshBtn.innerHTML = '🔄 Actualizar BD';
        refreshBtn.disabled = false;
      }

    } catch (error) {
      // console.error('❌ Error refrescando datos:', error);
      
      // Restaurar botón en caso de error
      const refreshBtn = document.getElementById('refresh-real-data');
      if (refreshBtn) {
        refreshBtn.innerHTML = '❌ Error - Reintentar';
        refreshBtn.disabled = false;
      }
    }
  }

  loadDashboardWithTestData() {
    // console.log('🧪 Forzando carga SOLO de datos de prueba (ignorando BD)...');
    const testData = this.generateTestData();
    
    try {
      // Configurar event listeners para filtros de período
      this.setupPeriodFilters();
      
      const orders = testData.orders;
      const products = testData.products;
      const period = 30;
      
      // console.log('🔴 MODO PRUEBA: Usando datos de prueba forzados');
      
      // Filtrar órdenes por período
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - period);
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at || new Date());
        return orderDate >= cutoffDate;
      });
      
      // Filtrar órdenes válidas para estadísticas (excluir solo canceladas - TEST DATA)
      const validOrders = filteredOrders.filter(order => {
        const status = (order.status || '').toLowerCase();
        const excludedStatuses = ['cancelled', 'cancelado', 'canceled'];
        return !excludedStatuses.includes(status);
      });
      
      // Calcular período anterior para comparaciones
      const previousPeriodStart = new Date(cutoffDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - period);
      
      const previousOrders = orders.filter(order => {
        const orderDate = new Date(order.date || order.created_at || new Date());
        return orderDate >= previousPeriodStart && orderDate < cutoffDate;
      }).filter(order => {
        const status = (order.status || '').toLowerCase();
        const excludedStatuses = ['cancelled', 'cancelado', 'canceled'];
        return !excludedStatuses.includes(status);
      });
      
      // Calcular KPIs principales
      this.calculateAndDisplayKPIs(validOrders, previousOrders, products, period);
      
      // Cargar todos los gráficos
      this.loadAllCharts(filteredOrders, validOrders, period);
      
      // Cargar widgets adicionales
      this.loadDashboardWidgets(validOrders, products);
      
      // console.log(`✅ Dashboard cargado con datos de prueba FORZADOS: ${validOrders.length} órdenes válidas`);
      
    } catch (error) {
      // console.error('❌ Error cargando dashboard con datos de prueba:', error);
    }
  }

  calculateAndDisplayKPIs(currentOrders, previousOrders, products, period) {
    // console.log('Calculando KPIs...');
    
    // Cálculos período actual
    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const currentOrderCount = currentOrders.length;
    const currentAverageTicket = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
    const uniqueCustomers = new Set(currentOrders.map(order => order.customerEmail || order.customer || 'anonymous')).size;
    const activeProducts = products.filter(p => p.available !== false).length;
    
    // Calcular tasa de conversión (órdenes / productos activos)
    const conversionRate = activeProducts > 0 ? (currentOrderCount / activeProducts) * 100 : 0;
    
    // Cálculos período anterior para comparación
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousOrderCount = previousOrders.length;
    const previousAverageTicket = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
    const previousCustomers = new Set(previousOrders.map(order => order.customerEmail || order.customer || 'anonymous')).size;
    
    // Calcular cambios porcentuales
    const revenueChange = this.calculatePercentageChange(currentRevenue, previousRevenue);
    const ordersChange = this.calculatePercentageChange(currentOrderCount, previousOrderCount);
    const ticketChange = this.calculatePercentageChange(currentAverageTicket, previousAverageTicket);
    const customersChange = this.calculatePercentageChange(uniqueCustomers, previousCustomers);
    const previousConversionRate = activeProducts > 0 ? (previousOrderCount / activeProducts) * 100 : 0;
    const conversionChange = this.calculatePercentageChange(conversionRate, previousConversionRate);
    
    // Actualizar UI
    this.updateKPIDisplay('kpi-total-revenue', currentRevenue, revenueChange, 'currency');
    this.updateKPIDisplay('kpi-total-orders', currentOrderCount, ordersChange, 'number');
    this.updateKPIDisplay('kpi-average-ticket', currentAverageTicket, ticketChange, 'currency');
  }

  calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  updateKPIDisplay(elementId, value, change, type) {
    const valueElement = document.getElementById(elementId);
    if (!valueElement) return;
    
    // Formatear valor según tipo
    let formattedValue;
    switch (type) {
      case 'currency':
        formattedValue = `$${Math.round(value).toLocaleString('es-CO')}`;
        break;
      case 'percentage':
        formattedValue = `${value.toFixed(1)}%`;
        break;
      default:
        formattedValue = Math.round(value).toLocaleString('es-CO');
    }
    
    valueElement.textContent = formattedValue;
  }

  loadCharts() {
    // console.log('📊 Cargando gráficas...');
    
    try {
      const orders = orderManager?.orders || [];
      
      // Si no hay órdenes, no mostrar gráficas
      let effectiveOrders = orders;
      if (orders.length === 0) {
        // console.log('📊 No hay órdenes para mostrar gráficas');
        this.showEmptyCharts();
        return;
      }
      
      // Filtrar órdenes válidas para gráficas (excluir solo canceladas)
      const validOrders = effectiveOrders.filter(order => {
        const status = (order.status || '').toLowerCase();
        const excludedStatuses = ['cancelled', 'cancelado', 'canceled'];
        return !excludedStatuses.includes(status);
      });
      
      // Cargar gráficos básicos (compatibilidad)
      this.loadTopProductsChart(validOrders);
      this.loadStatusPieChart(effectiveOrders);
      this.loadSalesChart(validOrders, 'day');
      
    } catch (error) {
      // console.error('❌ Error cargando gráficas:', error);
    }
  }

  loadAllCharts(allOrders, validOrders, period) {
      // console.log('📊 Cargando todos los gráficos...')
    
    try {
      // Gráficos principales - usar órdenes válidas para ventas, todas para estados
      this.loadTopProductsChart(validOrders);
      this.loadStatusPieChart(allOrders); // Usar todas las órdenes para mostrar distribución
      this.loadSalesChart(validOrders, 'day');
      
      // Nuevos gráficos
      this.loadCategorySalesChart(validOrders);
      this.loadWeekdayActivityChart(validOrders);
      this.loadGrowthTrendChart(validOrders, period);
      
    } catch (error) {
      // console.error('❌ Error cargando gráficos:', error);
    }
  }

  loadCategorySalesChart(orders) {
    const canvas = document.getElementById('category-sales-chart');
    if (!canvas) return;

    // console.log('📊 Cargando gráfico de categorías...', orders.length, 'órdenes');

    // Verificar si hay órdenes válidas
    if (!orders || orders.length === 0) {
      this.createEmptyChart('category-sales-chart', 'Categorías - Sin Ventas');
      return;
    }

    // Agrupar ventas por categoría
    const categorySales = {};
    const products = productManager?.products || [];
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productName = item.productName || item.name;
          const product = products.find(p => p.name === productName);
          const category = product ? product.category : 'Sin categoría';
          const revenue = (item.quantity || 1) * (item.price || 0);
          
          categorySales[category] = (categorySales[category] || 0) + revenue;
        });
      }
    });

    const sortedCategories = Object.entries(categorySales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6); // Top 6 categorías

    const ctx = canvas.getContext('2d');
    
    if (window.categorySalesChart) {
      window.categorySalesChart.destroy();
    }

    const colors = [
      'rgba(224, 108, 159, 0.8)',
      'rgba(102, 126, 234, 0.8)',
      'rgba(76, 201, 240, 0.8)',
      'rgba(129, 236, 236, 0.8)',
      'rgba(174, 213, 129, 0.8)',
      'rgba(255, 193, 7, 0.8)'
    ];

    window.categorySalesChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: sortedCategories.map(([name]) => name),
        datasets: [{
          label: 'Ingresos por Categoría',
          data: sortedCategories.map(([, revenue]) => revenue),
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Ingresos por Categoría',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: $${context.raw.toLocaleString('es-CO')}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString('es-CO');
              }
            }
          }
        },
        animation: { duration: 1000 }
      }
    });
  }

  loadWeekdayActivityChart(orders) {
    const canvas = document.getElementById('weekday-activity-chart');
    if (!canvas) return;

    // Agrupar órdenes por día de la semana
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const activityByWeekday = Array(7).fill(0);
    
    orders.forEach(order => {
      const orderDate = new Date(order.date || order.created_at || new Date());
      const weekday = orderDate.getDay();
      activityByWeekday[weekday] += order.total || 0;
    });

    const ctx = canvas.getContext('2d');
    
    if (window.weekdayChart) {
      window.weekdayChart.destroy();
    }

    window.weekdayChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weekdays,
        datasets: [{
          label: 'Ventas por Día de Semana',
          data: activityByWeekday,
          backgroundColor: 'rgba(129, 236, 236, 0.8)',
          borderColor: 'rgb(129, 236, 236)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Actividad por Día de Semana',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: { display: false }
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
        },
        animation: { duration: 1000 }
      }
    });
  }

  loadGrowthTrendChart(orders, period) {
    const canvas = document.getElementById('growth-trend-chart');
    if (!canvas) return;

    // Calcular crecimiento mensual
    const monthlyGrowth = [];
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at || now);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      months.push(monthStart.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }));
      monthlyGrowth.push(monthRevenue);
    }

    const ctx = canvas.getContext('2d');
    
    if (window.growthChart) {
      window.growthChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(174, 213, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(174, 213, 129, 0.05)');

    window.growthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Tendencia de Crecimiento',
          data: monthlyGrowth,
          borderColor: 'rgb(174, 213, 129)',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(174, 213, 129)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Tendencia de Crecimiento (6 meses)',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: { display: false }
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
        },
        animation: { duration: 1000 }
      }
    });
  }

  loadDashboardWidgets(orders, products) {
    // console.log('🔧 Cargando widgets del dashboard...', orders.length, 'órdenes,', products.length, 'productos');
    // console.log('📊 Productos recibidos para análisis:', products);
    
    try {
      this.loadCriticalProductsWidget(orders, products);
      this.loadTopGainersWidget(orders, products);
      this.loadStockSummaryWidget(products);
      // console.log('✅ Widgets cargados exitosamente');
    } catch (error) {
      // console.error('❌ Error cargando widgets:', error);
    }
  }

  loadCriticalProductsWidget(orders, products) {
    // console.log('🔍 Buscando contenedor critical-products-list en modal...');
    
    // Buscar específicamente dentro del modal admin
    const modal = document.getElementById('admin-modal');
    if (!modal) {
      // console.log('❌ Modal admin-modal no encontrado');
      return;
    }
    
    let container = modal.querySelector('#critical-products-list');
    
    if (!container) {
      // console.log('⚠️ Contenedor critical-products-list no encontrado en modal, buscando widget padre...');
      const parentWidget = modal.querySelector('.widget.critical-products');
      // console.log('🔍 Widget padre encontrado en modal:', !!parentWidget);
      
      if (parentWidget) {
        // console.log('✅ Creando contenedor dentro del widget padre');
        const listDiv = document.createElement('div');
        listDiv.id = 'critical-products-list';
        parentWidget.appendChild(listDiv);
        container = listDiv;
        // console.log('✅ Contenedor crítico creado exitosamente');
      } else {
        // console.log('❌ Widget padre .widget.critical-products no encontrado en modal');
        // console.log('🔍 Elementos dashboard en modal:', modal.querySelectorAll('.dashboard-widgets *').length);
        return;
      }
    } else {
      // console.log('✅ Contenedor critical-products-list encontrado en modal');
    }

    // console.log('🔧 Cargando widget productos críticos...', products.length, 'productos');
    // console.log('🔍 Analizando stock de productos: ...')

    // Verificar si hay productos
    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="widget-empty">
          <i class="fas fa-box"></i>
          <p>No hay productos para analizar</p>
        </div>
      `;
      return;
    }

    // Productos con stock muy bajo (menos de 5) - INDEPENDIENTE de las órdenes
    const lowStockProducts = products.filter(p => {
      const stock = parseInt(p.stock) || 0;
      return stock > 0 && stock <= 5;
    }).sort((a, b) => (parseInt(a.stock) || 0) - (parseInt(b.stock) || 0));

    // Productos sin stock
    const outOfStockProducts = products.filter(p => (parseInt(p.stock) || 0) <= 0);

      // console.log('🔍 Productos críticos encontrados: ...')

    let html = '';
    
    if (outOfStockProducts.length === 0 && lowStockProducts.length === 0) {
      html = `
        <div class="widget-empty">
          <i class="fas fa-check-circle"></i>
          <p>No hay productos críticos</p>
        </div>
      `;
    } else {
      // Mostrar productos sin stock
      outOfStockProducts.slice(0, 5).forEach(product => {
        html += `
          <div class="critical-item out-of-stock">
            <div class="item-info">
              <span class="item-name">${product.name}</span>
              <span class="item-status">Sin Stock</span>
            </div>
            <span class="item-badge critical">0</span>
          </div>
        `;
      });

      // Mostrar productos con stock bajo
      lowStockProducts.slice(0, 5).forEach(product => {
        html += `
          <div class="critical-item low-stock">
            <div class="item-info">
              <span class="item-name">${product.name}</span>
              <span class="item-status">Stock Bajo</span>
            </div>
            <span class="item-badge warning">${product.stock || 0}</span>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  loadTopGainersWidget(orders, products) {
    const container = document.getElementById('top-gainers-list');
    if (!container) {
      // console.log('⚠️ Contenedor top-gainers-list no encontrado, creando...');
      // Intentar mostrar en el contenedor del widget padre
      const parentWidget = document.querySelector('.widget.top-gainers');
      if (parentWidget) {
        const listDiv = document.createElement('div');
        listDiv.id = 'top-gainers-list';
        parentWidget.appendChild(listDiv);
        this.loadTopGainersWidget(orders, products);
      }
      return;
    }

    // console.log('🔧 Cargando widget top gainers...', orders.length, 'órdenes');

    // Verificar si hay órdenes
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="widget-empty">
          <i class="fas fa-chart-line"></i>
          <p>No hay ventas para analizar</p>
        </div>
      `;
      return;
    }

    // Calcular ganancias por producto (asumiendo un margen del 40%)
    const productGains = {};
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productName = item.productName || item.name;
          const revenue = (item.quantity || 1) * (item.price || 0);
          const estimatedCost = revenue * 0.6; // 60% costo, 40% ganancia
          const profit = revenue - estimatedCost;
          
          productGains[productName] = (productGains[productName] || 0) + profit;
        });
      }
    });

    const sortedGains = Object.entries(productGains)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    let html = '';
    
    if (sortedGains.length === 0) {
      html = `
        <div class="widget-empty">
          <i class="fas fa-chart-line"></i>
          <p>No hay datos de ganancias</p>
        </div>
      `;
    } else {
      sortedGains.forEach(([productName, profit], index) => {
        html += `
          <div class="gainer-item">
            <div class="gainer-rank">${index + 1}</div>
            <div class="gainer-info">
              <span class="gainer-name">${productName}</span>
              <span class="gainer-profit">+$${Math.round(profit).toLocaleString('es-CO')}</span>
            </div>
            <div class="gainer-trend">
              <i class="fas fa-arrow-up"></i>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  loadStockSummaryWidget(products) {
    // console.log('🔍 Buscando contenedor stock-summary en modal...');
    
    // Buscar específicamente dentro del modal admin  
    const modal = document.getElementById('admin-modal');
    if (!modal) {
      // console.log('❌ Modal admin-modal no encontrado');
      return;
    }
    
    let container = modal.querySelector('#stock-summary');
    
    if (!container) {
      // console.log('⚠️ Contenedor stock-summary no encontrado en modal, buscando widget padre...');
      const parentWidget = modal.querySelector('.widget.low-stock-summary');
      console.log('🔍 Widget padre stock encontrado en modal:', !!parentWidget);
      
      if (parentWidget) {
        // console.log('✅ Creando contenedor dentro del widget padre stock');
        const listDiv = document.createElement('div');
        listDiv.id = 'stock-summary';
        parentWidget.appendChild(listDiv);
        container = listDiv;
        // console.log('✅ Contenedor stock creado exitosamente');
      } else {
        // console.log('❌ Widget padre .widget.low-stock-summary no encontrado en modal');
        return;
      }
    } else {
      // console.log('✅ Contenedor stock-summary encontrado en modal');
    }

    // console.log('🔧 Cargando widget resumen de stock...', products.length, 'productos');
    // console.log('🔍 Productos para análisis de stock:', products.map(p => ({name: p.name, stock: p.stock, tipo: typeof p.stock})));

    // Verificar si hay productos
    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="widget-empty">
          <i class="fas fa-warehouse"></i>
          <p>No hay productos para analizar</p>
        </div>
      `;
      return;
    }

    const totalProducts = products.length;
    const inStock = products.filter(p => (parseInt(p.stock) || 0) > 5).length;
    const lowStock = products.filter(p => {
      const stock = parseInt(p.stock) || 0;
      return stock > 0 && stock <= 5;
    }).length;
    const outOfStock = products.filter(p => (parseInt(p.stock) || 0) <= 0).length;

    // console.log('📊 Análisis de stock:', { totalProducts, inStock, lowStock, outOfStock });

    const html = `
      <div class="stock-summary-grid">
        <div class="stock-item in-stock">
          <div class="stock-number">${inStock}</div>
          <div class="stock-label">En Stock</div>
          <div class="stock-bar">
            <div class="stock-fill" style="width: ${totalProducts > 0 ? (inStock/totalProducts)*100 : 0}%"></div>
          </div>
        </div>
        
        <div class="stock-item low-stock">
          <div class="stock-number">${lowStock}</div>
          <div class="stock-label">Stock Bajo</div>
          <div class="stock-bar">
            <div class="stock-fill warning" style="width: ${totalProducts > 0 ? (lowStock/totalProducts)*100 : 0}%"></div>
          </div>
        </div>
        
        <div class="stock-item out-stock">
          <div class="stock-number">${outOfStock}</div>
          <div class="stock-label">Sin Stock</div>
          <div class="stock-bar">
            <div class="stock-fill critical" style="width: ${totalProducts > 0 ? (outOfStock/totalProducts)*100 : 0}%"></div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  showEmptyDashboard() {
    // console.log('📊 Mostrando dashboard vacío...');
    
    // Resetear todos los KPIs a 0
    const kpiIds = ['kpi-total-revenue', 'kpi-total-orders', 'kpi-average-ticket', 'kpi-conversion-rate', 'kpi-unique-customers', 'kpi-active-products'];
    kpiIds.forEach(id => {
      this.updateKPIDisplay(id, 0, 0, 'number');
    });
    
    // Mostrar gráficos vacíos
    this.showEmptyCharts();
    
    // Mostrar widgets vacíos
    const widgetContainers = ['critical-products-list', 'top-gainers-list', 'stock-summary'];
    widgetContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="widget-empty">
            <i class="fas fa-chart-line"></i>
            <p>No hay datos disponibles</p>
          </div>
        `;
      }
    });
  }

  loadTopProductsChart(orders) {
    const canvas = document.getElementById('top-products-chart');
    if (!canvas) return;

    // console.log('📊 Cargando gráfico de top productos...', orders.length, 'órdenes');

    // Destruir gráfico existente si existe
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      // console.log('🗑️ Destruyendo gráfico existente de top productos');
      existingChart.destroy();
    }

    // Verificar si hay órdenes válidas
    if (!orders || orders.length === 0) {
      this.createEmptyChart('top-products-chart', 'Top Productos - Sin Ventas');
      return;
    }

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

    // console.log('Top productos calculados:', sortedProducts);

    // Si no hay productos vendidos
    if (sortedProducts.length === 0) {
      this.createEmptyChart('top-products-chart', 'Top Productos - Sin Ventas');
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // El gráfico ya fue destruido arriba, crear uno nuevo
    const colors = [
      'rgba(224, 108, 159, 0.8)',
      'rgba(102, 126, 234, 0.8)',
      'rgba(76, 201, 240, 0.8)',
      'rgba(129, 236, 236, 0.8)',
      'rgba(174, 213, 129, 0.8)'
    ];

    const borderColors = [
      'rgb(224, 108, 159)',
      'rgb(102, 126, 234)',
      'rgb(76, 201, 240)',
      'rgb(129, 236, 236)',
      'rgb(174, 213, 129)'
    ];

    window.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedProducts.map(([name]) => name.length > 20 ? name.substring(0, 20) + '...' : name),
        datasets: [{
          label: 'Cantidad Vendida',
          data: sortedProducts.map(([, count]) => count),
          backgroundColor: colors.slice(0, sortedProducts.length),
          borderColor: borderColors.slice(0, sortedProducts.length),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Top 5 Productos Más Vendidos',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#2c3e50'
          },
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(224, 108, 159, 0.8)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#6c757d',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#6c757d',
              font: {
                size: 11
              },
              maxRotation: 45
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  loadStatusPieChart(orders) {
    const canvas = document.getElementById('status-pie-chart');
    if (!canvas) return;

    // console.log('📊 Cargando gráfico de estados...', orders.length, 'órdenes');

    // Destruir gráfico existente si existe
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      // console.log('🗑️ Destruyendo gráfico existente de estados');
      existingChart.destroy();
    }

    // Verificar si hay órdenes
    if (!orders || orders.length === 0) {
      this.createEmptyChart('status-pie-chart', 'Estados - Sin Órdenes');
      return;
    }

    // Contar órdenes por estado
    const statusCounts = {};
    const statusLabels = {
      'pending': 'Pendiente',
      'pendiente': 'Pendiente',
      'confirmed': 'Confirmado',
      'confirmado': 'Confirmado', 
      'preparing': 'En Preparación',
      'preparando': 'En Preparación',
      'shipped': 'Enviado',
      'enviado': 'Enviado',
      'delivered': 'Entregado',
      'entregado': 'Entregado',
      'completed': 'Completado',
      'completado': 'Completado',
      'cancelled': 'Cancelado',
      'cancelado': 'Cancelado'
    };

    orders.forEach(order => {
      const status = order.status || 'pending';
      const normalizedStatus = status.toLowerCase();
      statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1;
    });

    // console.log('Estados calculados:', statusCounts);

    // Si no hay datos de estados
    if (Object.keys(statusCounts).length === 0) {
      this.createEmptyChart('status-pie-chart', 'Estados - Sin Datos');
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // El gráfico ya fue destruido arriba
    const colors = {
      'pending': { bg: 'rgba(255, 193, 7, 0.8)', border: 'rgb(255, 193, 7)' },
      'pendiente': { bg: 'rgba(255, 193, 7, 0.8)', border: 'rgb(255, 193, 7)' },
      'confirmed': { bg: 'rgba(102, 126, 234, 0.8)', border: 'rgb(102, 126, 234)' },
      'confirmado': { bg: 'rgba(102, 126, 234, 0.8)', border: 'rgb(102, 126, 234)' },
      'preparing': { bg: 'rgba(156, 39, 176, 0.8)', border: 'rgb(156, 39, 176)' },
      'preparando': { bg: 'rgba(156, 39, 176, 0.8)', border: 'rgb(156, 39, 176)' },
      'shipped': { bg: 'rgba(76, 201, 240, 0.8)', border: 'rgb(76, 201, 240)' },
      'enviado': { bg: 'rgba(76, 201, 240, 0.8)', border: 'rgb(76, 201, 240)' },
      'delivered': { bg: 'rgba(129, 199, 132, 0.8)', border: 'rgb(129, 199, 132)' },
      'entregado': { bg: 'rgba(129, 199, 132, 0.8)', border: 'rgb(129, 199, 132)' },
      'completed': { bg: 'rgba(76, 175, 80, 0.8)', border: 'rgb(76, 175, 80)' },
      'completado': { bg: 'rgba(76, 175, 80, 0.8)', border: 'rgb(76, 175, 80)' },
      'cancelled': { bg: 'rgba(244, 67, 54, 0.8)', border: 'rgb(244, 67, 54)' },
      'cancelado': { bg: 'rgba(244, 67, 54, 0.8)', border: 'rgb(244, 67, 54)' }
    };

    const dataEntries = Object.entries(statusCounts);
    const backgroundColors = dataEntries.map(([status]) => colors[status]?.bg || 'rgba(149, 165, 166, 0.8)');
    const borderColors = dataEntries.map(([status]) => colors[status]?.border || 'rgb(149, 165, 166)');
    const labels = dataEntries.map(([status]) => statusLabels[status] || status);

    window.statusPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataEntries.map(([, count]) => count),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Órdenes por Estado',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#2c3e50',
            padding: 20
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              },
              color: '#495057',
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(224, 108, 159, 0.8)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 1200
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
        const dateStr = date.toLocaleDateString('es-CO', {weekday: 'short', month: 'short', day: 'numeric'});
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
        dateKey = orderDate.toLocaleDateString('es-CO', {weekday: 'short', month: 'short', day: 'numeric'});
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

    // Crear gradiente para el fondo
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(224, 108, 159, 0.3)');
    gradient.addColorStop(1, 'rgba(224, 108, 159, 0.05)');

    window.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Ventas ($)',
          data: salesData,
          borderColor: 'rgb(224, 108, 159)',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(224, 108, 159)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgb(196, 69, 105)',
          pointHoverBorderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: period === 'day' ? 'Ventas por Día (Últimos 7 días)' : 
                  period === 'week' ? 'Ventas por Semana (Últimas 4 semanas)' :
                  'Ventas por Mes (Últimos 6 meses)',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#2c3e50',
            padding: 20
          },
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(224, 108, 159, 0.8)',
            borderWidth: 1,
            intersect: false,
            mode: 'index'
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString('es-CO');
              },
              color: '#6c757d',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#6c757d',
              font: {
                size: 11
              },
              maxRotation: 45
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
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

  async loadOrdersList(statusFilter = 'all', page = 1, itemsPerPage = 10) {
    const ordersList = document.getElementById('admin-orders-list');
    if (!ordersList) return;

    // Inicializar propiedades de paginación si no existen
    if (!this.ordersPage) this.ordersPage = 1;
    if (!this.ordersPerPage) this.ordersPerPage = 10;
    if (!this.ordersStatusFilter) this.ordersStatusFilter = 'all';

    // Actualizar parámetros
    this.ordersPage = page;
    this.ordersPerPage = itemsPerPage;
    this.ordersStatusFilter = statusFilter;

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
      this.updatePaginationControls(0, 0, page, itemsPerPage);
      return;
    }
    
    // console.log('🔍 Filtrando órdenes por estado:', statusFilter);
    // console.log('📊 Órdenes antes de filtrar:', orders.length);
    // console.log('📋 Estados disponibles:', orders.map(o => o.status).join(', '));
    
    // Aplicar filtro
    let filteredOrders = orders;
    if (statusFilter !== 'all') {
      filteredOrders = orders.filter(order => {
        const matches = order.status === statusFilter;
        if (matches) {
          // console.log(`✅ Orden #${order.orderNumber} (${order.status}) coincide con filtro ${statusFilter}`);
        }
        return matches;
      });
    }
    
    // console.log('📊 Órdenes después de filtrar:', filteredOrders.length);

    if (filteredOrders.length === 0) {
      ordersList.innerHTML = `<p style="text-align: center; color: #666; font-style: italic; padding: 2rem;">No hay órdenes con estado: <strong>${statusFilter === 'all' ? 'Todos' : statusFilter}</strong></p>`;
      this.updateOrdersStats(filteredOrders);
      this.updatePaginationControls(0, 0, page, itemsPerPage);
      return;
    }

    // Calcular paginación
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      // console.log('📄 Paginación: ...')

    // Ordenar por fecha de creación (más recientes primero)
    paginatedOrders.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || Date.now());
      const dateB = new Date(b.created_at || b.createdAt || Date.now());
      return dateB - dateA;
    });

    // Renderizar órdenes paginadas
    ordersList.innerHTML = paginatedOrders.map(order => {
      const orderDate = new Date(order.created_at || order.createdAt || Date.now());
      const formattedDate = orderDate.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Obtener ID correcto de la orden
      const orderId = order.id || order.order_id || order.orderNumber || order.order_number;
      
      // console.log('📋 Debug orden: ...')

      return `
        <div class="admin-order-item">
          <div class="order-info">
            <div class="order-header">
              <h4>Orden #${order.orderNumber || order.order_number || orderId}</h4>
              <span class="order-date">${formattedDate}</span>
            </div>
            <div class="order-details">
              <p><strong>Cliente:</strong> ${order.customer_info?.name || order.customerInfo?.name || 'No especificado'}</p>
              <p><strong>Email:</strong> ${order.customer_info?.email || order.customerInfo?.email || 'No especificado'}</p>
              <p><strong>Total:</strong> <span class="order-total">$${(order.total || 0).toLocaleString('es-CO')}</span></p>
              <p><strong>Estado:</strong> <span class="status status-${order.status}">${this.getStatusLabel(order.status)}</span></p>
            </div>
          </div>
          <div class="order-actions">
            <button onclick="window.adminPanel.viewOrder('${orderId}'); /* console.log('Click Ver Detalles:', '${orderId}'); */" class="btn btn-info" style="
              background: #D6C9CC !important;
              color: #4B3B44 !important;
              border: none !important;
              border-radius: 8px !important;
              padding: 0.75rem 1.5rem !important;
              font-weight: 600 !important;
              box-shadow: 0 2px 8px rgba(214,201,204,0.15);
              transition: background 0.2s, color 0.2s;
            " onmouseover="this.style.background='#EDE6EA'; this.style.color='#2C1A23';" onmouseout="this.style.background='#D6C9CC'; this.style.color='#4B3B44';">
              <i class="fas fa-eye"></i> Ver Detalles
            </button>
            <button onclick="window.adminPanel.changeOrderStatus('${orderId}'); /* console.log('Click Cambiar Estado:', '${orderId}'); */" class="btn btn-warning">
              <i class="fas fa-edit"></i> Cambiar Estado
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Actualizar estadísticas (usar todas las órdenes filtradas, no solo las paginadas)
    this.updateOrdersStats(orders, filteredOrders);

    // Actualizar controles de paginación
    this.updatePaginationControls(totalItems, totalPages, page, itemsPerPage, startIndex + 1, endIndex);
  }

  getStatusLabel(status) {
    const statusLabels = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  updateOrdersStats(allOrders = null, filteredOrders = null) {
    // Si no se pasan órdenes, obtener las actuales
    if (!allOrders) {
      allOrders = orderManager?.orders || [];
    }
    if (!filteredOrders) {
      filteredOrders = allOrders;
    }

    const totalOrders = allOrders.length;
    const filteredCount = filteredOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Actualizar elementos en el DOM
    const totalEl = document.getElementById('orders-total');
    const revenueEl = document.getElementById('orders-revenue');
    const filteredEl = document.getElementById('filtered-orders-count');

    if (totalEl) {
      totalEl.textContent = totalOrders;
    }

    if (revenueEl) {
      revenueEl.textContent = `$${totalRevenue.toLocaleString('es-CO')}`;
    }

    if (filteredEl) {
      filteredEl.textContent = filteredCount;
    }

    console.log(`📊 Estadísticas actualizadas: ${totalOrders} órdenes totales, ${filteredCount} filtradas, $${totalRevenue.toLocaleString('es-CO')} ingresos`);
  }

  updatePaginationControls(totalItems, totalPages, currentPage, itemsPerPage, startIndex = 0, endIndex = 0) {
    const paginationContainer = document.getElementById('orders-pagination');
    const paginationInfo = document.getElementById('pagination-info-text');
    const paginationNumbers = document.getElementById('pagination-numbers');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (!paginationContainer) return;

    // Mostrar/ocultar paginación
    if (totalItems <= itemsPerPage) {
      paginationContainer.style.display = 'none';
      return;
    } else {
      paginationContainer.style.display = 'flex';
    }

    // Actualizar información de paginación
    if (paginationInfo) {
      paginationInfo.textContent = `Mostrando ${startIndex} - ${endIndex} de ${totalItems} resultados`;
    }

    // Actualizar botones prev/next
    if (prevButton) {
      prevButton.disabled = currentPage <= 1;
      prevButton.onclick = () => {
        if (currentPage > 1) {
          this.loadOrdersList(this.ordersStatusFilter, currentPage - 1, this.ordersPerPage);
        }
      };
    }

    if (nextButton) {
      nextButton.disabled = currentPage >= totalPages;
      nextButton.onclick = () => {
        if (currentPage < totalPages) {
          this.loadOrdersList(this.ordersStatusFilter, currentPage + 1, this.ordersPerPage);
        }
      };
    }

    // Generar números de página
    if (paginationNumbers) {
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      let numbersHTML = '';

      // Botón primera página
      if (startPage > 1) {
        numbersHTML += `<button class="pagination-number" onclick="adminPanel.loadOrdersList('${this.ordersStatusFilter}', 1, ${this.ordersPerPage})">1</button>`;
        if (startPage > 2) {
          numbersHTML += `<span class="pagination-ellipsis">...</span>`;
        }
      }

      // Números de página visibles
      for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage ? 'active' : '';
        numbersHTML += `<button class="pagination-number ${isActive}" onclick="adminPanel.loadOrdersList('${this.ordersStatusFilter}', ${i}, ${this.ordersPerPage})">${i}</button>`;
      }

      // Botón última página
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          numbersHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        numbersHTML += `<button class="pagination-number" onclick="adminPanel.loadOrdersList('${this.ordersStatusFilter}', ${totalPages}, ${this.ordersPerPage})">${totalPages}</button>`;
      }

      paginationNumbers.innerHTML = numbersHTML;
    }
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
    console.log('📊 Destruyendo gráficos existentes y mostrando estado vacío...');
    
    // Destruir todos los gráficos existentes
    const chartInstances = [
      'salesChart', 'statusPieChart', 'topProductsChart', 
      'categorySalesChart', 'weekdayChart', 'growthChart'
    ];
    
    chartInstances.forEach(chartName => {
      if (window[chartName]) {
        window[chartName].destroy();
        window[chartName] = null;
      }
    });
    
    // Crear gráficos vacíos para cada canvas
    this.createEmptyChart('sales-day-chart', 'Ventas por Día - Sin Datos');
    this.createEmptyChart('status-pie-chart', 'Estado de Órdenes - Sin Datos');
    this.createEmptyChart('top-products-chart', 'Top Productos - Sin Datos');
    this.createEmptyChart('category-sales-chart', 'Ventas por Categoría - Sin Datos');
    this.createEmptyChart('weekday-activity-chart', 'Actividad Semanal - Sin Datos');
    this.createEmptyChart('growth-trend-chart', 'Tendencia de Crecimiento - Sin Datos');
  }

  createEmptyChart(canvasId, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    console.log(`🎨 Creando gráfico vacío para ${canvasId}`);
    
    // Destruir gráfico existente si existe
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      console.log(`🗑️ Destruyendo gráfico existente en ${canvasId}`);
      existingChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Sin Datos'],
        datasets: [{
          data: [0],
          borderColor: '#e2e8f0',
          backgroundColor: '#f8fafc',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            color: '#94a3b8'
          },
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: { point: { radius: 0 } }
      }
    });
    
    console.log(`✅ Gráfico vacío creado para ${canvasId}`);
    return newChart;
  }

  async loadProductsList(page = 1) {
    console.log(`🔄 Cargando lista de productos - Página ${page}...`);
    const productsList = document.getElementById('admin-products-list');
    if (!productsList) {
      console.error('❌ Elemento admin-products-list no encontrado');
      return;
    }

    try {
      await productManager.initialize();
      this.allProducts = productManager.getAvailableProducts();
      this.totalProducts = this.allProducts.length;
      this.currentPage = page;
      
      if (this.totalProducts === 0) {
        productsList.innerHTML = '<p class="no-products">No hay productos para mostrar</p>';
        this.renderPagination(0);
        return;
      }

      // Calcular productos para la página actual
      const startIndex = (page - 1) * this.productsPerPage;
      const endIndex = startIndex + this.productsPerPage;
      const productsToShow = this.allProducts.slice(startIndex, endIndex);

      // Renderizar productos de la página actual
      productsList.innerHTML = productsToShow.map(product => `
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

      // Renderizar controles de paginación
      this.renderPagination(this.totalProducts);
      
      console.log(`✅ Página ${page}: Mostrando ${productsToShow.length} de ${this.totalProducts} productos`);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      productsList.innerHTML = '<p class="error-message">Error cargando productos</p>';
      this.renderPagination(0);
    }
  }

  renderPagination(totalItems) {
    const paginationContainer = document.getElementById('products-pagination');
    if (!paginationContainer && totalItems > 0) {
      // Crear el contenedor de paginación si no existe
      const productsList = document.getElementById('admin-products-list');
      if (productsList && productsList.parentNode) {
        const paginationDiv = document.createElement('div');
        paginationDiv.id = 'products-pagination';
        paginationDiv.className = 'admin-pagination';
        productsList.parentNode.insertBefore(paginationDiv, productsList.nextSibling);
      }
    }

    const container = document.getElementById('products-pagination');
    if (!container) return;

    if (totalItems <= this.productsPerPage) {
      container.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(totalItems / this.productsPerPage);
    const currentPage = this.currentPage;
    
    let paginationHTML = `
      <div class="pagination-info">
        <span>Mostrando ${Math.min(((currentPage - 1) * this.productsPerPage) + 1, totalItems)}-${Math.min(currentPage * this.productsPerPage, totalItems)} de ${totalItems} productos</span>
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn ${currentPage <= 1 ? 'disabled' : ''}" 
                onclick="adminPanel.goToPage(${currentPage - 1})" 
                ${currentPage <= 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left"></i> Anterior
        </button>
    `;

    // Generar números de página
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Primera página si no está visible
    if (startPage > 1) {
      paginationHTML += `<button class="pagination-btn page-number" onclick="adminPanel.goToPage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn page-number ${i === currentPage ? 'active' : ''}" 
                onclick="adminPanel.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    // Última página si no está visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
      paginationHTML += `<button class="pagination-btn page-number" onclick="adminPanel.goToPage(${totalPages})">${totalPages}</button>`;
    }

    paginationHTML += `
        <button class="pagination-btn ${currentPage >= totalPages ? 'disabled' : ''}" 
                onclick="adminPanel.goToPage(${currentPage + 1})" 
                ${currentPage >= totalPages ? 'disabled' : ''}>
          Siguiente <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="pagination-size-selector">
        <label>Productos por página:</label>
        <select onchange="adminPanel.changePageSize(this.value)">
          <option value="5" ${this.productsPerPage === 5 ? 'selected' : ''}>5</option>
          <option value="10" ${this.productsPerPage === 10 ? 'selected' : ''}>10</option>
          <option value="20" ${this.productsPerPage === 20 ? 'selected' : ''}>20</option>
          <option value="50" ${this.productsPerPage === 50 ? 'selected' : ''}>50</option>
        </select>
      </div>
    `;

    container.innerHTML = paginationHTML;
  }

  goToPage(page) {
    if (page < 1 || page > Math.ceil(this.totalProducts / this.productsPerPage)) {
      return;
    }
    this.loadProductsList(page);
  }

  changePageSize(newSize) {
    this.productsPerPage = parseInt(newSize);
    this.currentPage = 1; // Resetear a la primera página
    this.loadProductsList(1);
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
        categoriesList.innerHTML = '<p class="no-data">No hay categorías para mostrar</p>';
        return;
      }

      categoriesList.innerHTML = categories.map(category => `
        <div class="admin-category-item">
          <div class="category-info">
            <h4>${category.icon ? `<i class="${category.icon}"></i>` : '📁'} ${category.name}</h4>
            <p><strong>Slug:</strong> ${category.slug}</p>
            <p><strong>Estado:</strong> <span class="category-status ${category.active ? 'active' : 'inactive'}">${category.active ? 'Activa' : 'Inactiva'}</span></p>
          </div>
          <div class="category-actions">
            <button onclick="adminPanel.editCategory('${category.slug}')" class="btn btn-primary">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button onclick="adminPanel.deleteCategory('${category.slug}')" class="btn btn-danger">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `).join('');
      
      console.log(`✅ ${categories.length} categorías cargadas`);
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      categoriesList.innerHTML = '<p class="error">Error cargando categorías</p>';
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

  async saveCategory(event) {
    if (event) event.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value.trim();
    const slug = document.getElementById('category-slug').value.trim();
    const icon = document.getElementById('category-icon').value.trim();
    const active = document.getElementById('category-active').checked;
    
    if (!name || !slug) {
      alert('❌ Por favor complete los campos requeridos');
      return;
    }
    
    try {
      const categoryData = {
        name,
        slug,
        icon: icon || '📁',
        active
      };
      
      let result;
      if (categoryId) {
        // Editar categoría existente
        result = await categoryManager.updateCategory(categoryId, categoryData);
        console.log('✅ Categoría actualizada:', result);
        alert('✅ Categoría actualizada exitosamente');
      } else {
        // Crear nueva categoría
        result = await categoryManager.addCategory(categoryData);
        console.log('✅ Categoría creada:', result);
        alert('✅ Categoría creada exitosamente');
      }
      
      // Ocultar formulario y recargar lista
      document.getElementById('category-form').style.display = 'none';
      this.loadCategoriesList();
      
    } catch (error) {
      console.error('❌ Error guardando categoría:', error);
      alert('❌ Error al guardar la categoría: ' + error.message);
    }
  }

  async editCategory(categorySlug) {
    console.log('✏️ Editando categoría:', categorySlug);
    
    try {
      await categoryManager.initialize();
      const category = categoryManager.getCategoryBySlug(categorySlug);
      
      if (!category) {
        alert('❌ Categoría no encontrada');
        return;
      }
      
      // Llenar formulario con datos existentes
      document.getElementById('category-id').value = category.id;
      document.getElementById('category-name').value = category.name;
      document.getElementById('category-slug').value = category.slug;
      document.getElementById('category-icon').value = category.icon || '';
      document.getElementById('category-active').checked = category.active !== false;
      
      // Cambiar título y botón
      document.getElementById('category-form-title').textContent = 'Editar Categoría';
      document.getElementById('save-category-btn').innerHTML = '<i class="fas fa-save"></i> Actualizar Categoría';
      
      // Mostrar formulario
      document.getElementById('category-form').style.display = 'block';
      
    } catch (error) {
      console.error('❌ Error cargando categoría para editar:', error);
      alert('❌ Error al cargar la categoría: ' + error.message);
    }
  }

  async deleteCategory(categorySlug) {
    console.log('🗑️ Eliminando categoría:', categorySlug);
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await categoryManager.initialize();
      const category = categoryManager.getCategoryBySlug(categorySlug);
      
      if (!category) {
        alert('❌ Categoría no encontrada');
        return;
      }
      
      const result = await categoryManager.deleteCategory(category.id);
      
      if (result) {
        console.log('✅ Categoría eliminada exitosamente');
        alert('✅ Categoría eliminada exitosamente');
        this.loadCategoriesList(); // Recargar lista
      } else {
        throw new Error('No se pudo eliminar la categoría');
      }
    } catch (error) {
      console.error('❌ Error eliminando categoría:', error);
      alert('❌ Error al eliminar la categoría: ' + error.message);
    }
  }

  showNewCategoryForm() {
    console.log('➕ Mostrando formulario nueva categoría');
    
    // Limpiar formulario
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-active').checked = true;
    
    // Cambiar título y botón
    document.getElementById('category-form-title').textContent = 'Nueva Categoría';
    document.getElementById('save-category-btn').innerHTML = '<i class="fas fa-plus"></i> Crear Categoría';
    
    // Mostrar formulario
    document.getElementById('category-form').style.display = 'block';
  }

  cancelCategoryForm() {
    console.log('❌ Cancelando formulario categoría');
    
    document.getElementById('category-form').style.display = 'none';
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
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
            <button type="button" onclick="adminPanel.showEditProductPreview('${product.id}')" class="btn btn-info" style="background-color: #D6C9CC; color: #3B2C35; border: none; font-weight: 600; box-shadow: 0 2px 8px rgba(59,44,53,0.08);">
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
    console.log('🖼️ Cargando imágenes existentes del producto:', product.id, product);
    
    const container = document.getElementById('edit-additional-images-container');
    if (!container) return;

    // Limpiar contenedor
    container.innerHTML = '';

    // Usar la función parseProductImages para obtener todas las imágenes
    let allImages = [];
    try {
      if (typeof productManager !== 'undefined' && productManager.parseProductImages) {
        const parsedImages = productManager.parseProductImages(product);
        // parseProductImages devuelve objetos con {url, alt, primary}, extraemos solo las URLs
        allImages = parsedImages.map(img => img.url || img).filter(Boolean);
      } else {
        // Fallback manual si no está disponible productManager
        if (product.images) {
          const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          allImages = Array.isArray(parsedImages) ? parsedImages.map(img => img.url || img) : [];
        } else if (product.image) {
          try {
            const parsedImage = JSON.parse(product.image);
            if (Array.isArray(parsedImage)) {
              allImages = parsedImage.map(img => img.url || img);
            } else {
              allImages = [product.image];
            }
          } catch {
            allImages = [product.image];
          }
        }
      }
    } catch (error) {
      console.warn('Error al parsear imágenes:', error);
      allImages = [product.image].filter(Boolean);
    }

    console.log('🎯 URLs de imágenes para edición:', allImages);

    // Separar imagen principal de adicionales
    const additionalImages = allImages.slice(1); // Todo excepto la primera imagen

    // Actualizar la imagen principal en el preview
    const mainImagePreview = document.getElementById('edit-product-image-preview');
    const mainImageUrl = document.getElementById('edit-product-image-url');
    if (allImages.length > 0 && mainImagePreview && mainImageUrl) {
      mainImagePreview.src = allImages[0] || 'recursos/lunilogo.png';
      mainImageUrl.value = allImages[0] || '';
    }

    // Crear campos para cada imagen adicional existente
    additionalImages.forEach((imageUrl, index) => {
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
        this.addEditAdditionalImageField(imageUrl.trim());
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

      // Mostrar progreso inicial
      progress.style.width = '20%';

      // Usar CloudinaryUploader como la función principal
      const cloudinary = new CloudinaryUploader();
      
      // Simular progreso durante la subida
      const progressInterval = setInterval(() => {
        const currentWidth = parseFloat(progress.style.width) || 20;
        if (currentWidth < 80) {
          progress.style.width = Math.min(80, currentWidth + Math.random() * 20) + '%';
        }
      }, 300);

      const result = await cloudinary.uploadImage(file);
      
      clearInterval(progressInterval);
      progress.style.width = '100%';

      if (result.success) {
        // Actualizar preview y URL
        if (preview && urlInput) {
          preview.src = result.url;
          urlInput.value = result.url;
        }

        this.showNotification(`✅ Imagen adicional ${fieldIndex + 1} subida exitosamente`, 'success');
      } else {
        throw new Error(result.message || 'Error al subir imagen');
      }
      
      // Ocultar progreso
      setTimeout(() => {
        progress.style.width = '0%';
      }, 1000);

    } catch (error) {
      console.error('Error al subir imagen adicional:', error);
      this.showNotification(`❌ Error al subir la imagen adicional: ${error.message || 'Error desconocido'}`, 'error');
      
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
    const images = [];
    
    // Imagen principal
    const mainImageUrl = document.getElementById('edit-product-image-url')?.value?.trim();
    if (mainImageUrl) {
      images.push({
        url: mainImageUrl,
        primary: true
      });
    }
    
    // Imágenes adicionales
    const container = document.getElementById('edit-additional-images-container');
    if (container) {
      const urlInputs = container.querySelectorAll('.additional-image-url');
      urlInputs.forEach((input, index) => {
        const url = input.value?.trim();
        if (url && url !== 'recursos/lunilogo.png') {
          images.push({
            url: url,
            primary: false
          });
        }
      });
    }
    
    return images;
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
    const productImages = this.collectEditProductImages();
    
    // Extraer solo las URLs de los objetos {url, primary}
    const allImageUrls = productImages.map(img => img.url || img).filter(url => url && typeof url === 'string' && url.trim());
    
    // Si no hay imágenes de productImages, usar la imagen principal
    const finalImages = allImageUrls.length > 0 ? allImageUrls : [mainImage].filter(Boolean);
    
    this.showProfessionalPreview({
      name,
      price,
      description,
      images: finalImages,
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
      
      // Recopilar todas las imágenes usando el mismo formato que la creación
      const productImages = this.collectEditProductImages();
      
      await productManager.initialize();
      
      const productData = {
        name,
        category,
        price,
        color: color || 'Variado',
        size: size || 'Mediano',
        image: image || 'recursos/lunilogo.png', // Imagen principal para compatibilidad
        images: productImages, // Array completo de imágenes en formato correcto
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

    // Agregar al contenedor fijo de toasts
    const toastContainer = document.getElementById('admin-toast-container');
    if (toastContainer) {
      toastContainer.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }

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

  async loadCategoriesInSelect(selectId = 'product-category') {
    try {
      await categoryManager.initialize();
      const categories = categoryManager.getActiveCategories();
      const categorySelect = document.getElementById(selectId);
      
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
        
        // console.log(`✅ ${categories.length} categorías cargadas en select ${selectId}`);
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
    
    console.log('🔍 Buscando orden por ID:', orderId);
    console.log('📋 Órdenes disponibles:', orders.length);
    
    // Buscar la orden por diferentes campos de ID
    const order = orders.find(order => {
      const matches = order.id == orderId || 
                     order.order_id == orderId || 
                     order.orderNumber == orderId || 
                     order.order_number == orderId;
      
      if (matches) {
        console.log('✅ Orden encontrada:', {
          id: order.id,
          order_id: order.order_id,
          orderNumber: order.orderNumber,
          order_number: order.order_number
        });
      }
      
      return matches;
    });
    
    if (!order) {
      console.log('❌ Orden no encontrada. IDs disponibles:', 
        orders.map(o => ({
          id: o.id,
          order_id: o.order_id,
          orderNumber: o.orderNumber,
          order_number: o.order_number
        }))
      );
    }
    
    return order;
  }

  viewOrder(orderId) {
    console.log('🔍 Viendo orden:', orderId);
    
    const order = this.getOrderById(orderId);
    
    if (!order) {
      alert('Orden no encontrada');
      return;
    }

    console.log('✅ Creando modal para orden:', order);

    // Crear modal con detalles de la orden
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      display: flex !important;
      position: fixed !important;
      z-index: 20002 !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: rgba(0, 0, 0, 0.8) !important;
      justify-content: center !important;
      align-items: center !important;
      backdrop-filter: blur(5px) !important;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: white !important;
        border-radius: 12px !important;
        padding: 2rem !important;
        max-width: 800px !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
        position: relative !important;
      ">
        <button class="modal-close-btn" onclick="this.parentElement.parentElement.remove(); console.log('Modal cerrado');" style="
          position: absolute !important;
          top: 1rem !important;
          right: 1rem !important;
          background: none !important;
          border: none !important;
          font-size: 1.5rem !important;
          cursor: pointer !important;
          color: #666 !important;
          z-index: 10000 !important;
        ">
          <i class="fas fa-times"></i>
        </button>
        <div class="order-detail-header">
          <h2 style="margin-bottom: 1rem; color: var(--text-dark);"><i class="fas fa-shopping-bag"></i> Detalle de Orden #${order.orderNumber || order.order_number || order.id}</h2>
        </div>
        <div class="order-detail-content">
          <div class="order-info-section" style="margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <h3 style="margin-bottom: 1rem; color: var(--text-dark);"><i class="fas fa-user"></i> Información del Cliente</h3>
            <p style="margin: 0.5rem 0;"><strong>Nombre:</strong> ${order.customer_info?.name || order.customerInfo?.name || 'No especificado'}</p>
            <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${order.customer_info?.email || order.customerInfo?.email || 'No especificado'}</p>
            <p style="margin: 0.5rem 0;"><strong>Teléfono:</strong> ${order.customer_info?.phone || order.customerInfo?.phone || 'No especificado'}</p>
            <p style="margin: 0.5rem 0;"><strong>Dirección:</strong> ${order.customer_info?.address || order.customerInfo?.address || 'No especificado'}</p>
          </div>
          
          <div class="order-status-section" style="margin-bottom: 1.5rem; padding: 1rem; background: #f0fdf4; border-radius: 8px;">
            <h3 style="margin-bottom: 1rem; color: var(--text-dark);"><i class="fas fa-flag"></i> Estado de la Orden</h3>
            <p style="margin: 0.5rem 0;"><strong>Estado Actual:</strong> <span class="status status-${order.status}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${this.getStatusLabel(order.status)}</span></p>
            <p style="margin: 0.5rem 0;"><strong>Fecha:</strong> ${order.date ? new Date(order.date).toLocaleDateString('es-CO') : order.created_at ? new Date(order.created_at).toLocaleDateString('es-CO') : 'No especificada'}</p>
            <p style="margin: 0.5rem 0;"><strong>Total:</strong> <strong style="color: var(--primary-color); font-size: 1.25rem;">$${(order.total || 0).toLocaleString('es-CO')}</strong></p>
          </div>
          
          ${order.items && order.items.length > 0 ? `
            <div class="order-products-section" style="margin-bottom: 1.5rem;">
              <h3 style="margin-bottom: 1rem; color: var(--text-dark);"><i class="fas fa-box"></i> Productos</h3>
              <div class="order-products-list">
                ${order.items.map(item => `
                  <div class="order-product-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem;">
                    <div class="product-info">
                      <h4 style="margin: 0 0 0.5rem 0; color: var(--text-dark);">${item.productName || item.name || 'Producto sin nombre'}</h4>
                      <p style="margin: 0.25rem 0; color: var(--text-light); font-size: 0.9rem;">Cantidad: ${item.quantity || 1}</p>
                      <p style="margin: 0.25rem 0; color: var(--text-light); font-size: 0.9rem;">Precio unitario: $${(item.price || 0).toLocaleString('es-CO')}</p>
                    </div>
                    <div class="product-total">
                      <strong style="color: var(--primary-color); font-size: 1.1rem;">$${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-CO')}</strong>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="no-products" style="text-align: center; padding: 2rem; color: var(--text-muted); background: #f8fafc; border-radius: 8px;">
              <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; display: block; color: #ccc;"></i>
              <p style="margin: 0; font-style: italic;">No hay información de productos disponible para esta orden.</p>
            </div>
          `}
        </div>
        <div class="order-detail-actions" style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
          <button onclick="window.adminPanel.changeOrderStatus('${order.id}'); console.log('Abriendo cambio de estado');" class="btn btn-warning" style="
            padding: 0.75rem 1.5rem !important;
            background: #f59e0b !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
          ">
            <i class="fas fa-edit"></i> Cambiar Estado
          </button>
          ${order.status !== 'pending' && order.status !== 'cancelled' ? `
          <button onclick="window.adminPanel.showInvoiceOptions('${order.id}')" class="btn btn-success" style="
            padding: 0.75rem 1.5rem !important;
            background: #059669 !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
          ">
            <i class="fas fa-file-invoice-dollar"></i> Enviar Factura
          </button>` : ''}
          <button onclick="this.parentElement.parentElement.parentElement.remove(); console.log('Modal cerrado');" class="btn btn-secondary" style="
            padding: 0.75rem 1.5rem !important;
            background: #6b7280 !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
          ">
            <i class="fas fa-times"></i> Cerrar
          </button>
        </div>
      </div>
    `;
    
    console.log('📝 Modal creado, agregando al DOM...');
    document.body.appendChild(modal);
    console.log('✅ Modal agregado al DOM');
  }

  changeOrderStatus(orderId) {
    console.log('🔄 Cambiando estado de orden:', orderId);
    
    const order = this.getOrderById(orderId);
    
    if (!order) {
      alert('Orden no encontrada');
      return;
    }

    console.log('✅ Creando modal para cambio de estado:', order);

    // Crear modal para cambiar estado
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      display: flex !important;
      position: fixed !important;
      z-index: 20003 !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: rgba(0, 0, 0, 0.8) !important;
      justify-content: center !important;
      align-items: center !important;
      backdrop-filter: blur(5px) !important;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: white !important;
        border-radius: 12px !important;
        padding: 2rem !important;
        max-width: 500px !important;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
        position: relative !important;
      ">
        <button class="modal-close-btn" onclick="this.parentElement.parentElement.remove(); console.log('Modal estado cerrado');" style="
          position: absolute !important;
          top: 1rem !important;
          right: 1rem !important;
          background: none !important;
          border: none !important;
          font-size: 1.5rem !important;
          cursor: pointer !important;
          color: #666 !important;
        ">
          <i class="fas fa-times"></i>
        </button>
        <div class="status-change-header" style="margin-bottom: 1.5rem;">
          <h2 style="margin-bottom: 0.5rem; color: var(--text-dark);"><i class="fas fa-edit"></i> Cambiar Estado</h2>
          <p style="color: var(--text-light);">Orden #${order.orderNumber || order.order_number || order.id}</p>
        </div>
        <div class="status-change-content">
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="new-status" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-dark);">Nuevo Estado:</label>
            <select id="new-status" class="form-control" style="
              width: 100% !important;
              padding: 0.75rem !important;
              border: 2px solid #e2e8f0 !important;
              border-radius: 8px !important;
              font-size: 1rem !important;
              background: white !important;
            ">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
              <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
              <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>En Preparación</option>
              <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregado</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>
        </div>
        <div class="status-change-actions" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button onclick="window.adminPanel.updateOrderStatusAndShowInvoiceOptions('${order.id}', document.getElementById('new-status').value); this.parentElement.parentElement.parentElement.remove(); console.log('Estado actualizado');" class="btn btn-primary" style="
            padding: 0.75rem 1.5rem !important;
            background: var(--primary-color) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
          ">
            <i class="fas fa-save"></i> Actualizar Estado
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove(); console.log('Modal estado cancelado');" class="btn btn-secondary" style="
            padding: 0.75rem 1.5rem !important;
            background: #6b7280 !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
          ">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </div>
    `;
    
    console.log('📝 Modal estado creado, agregando al DOM...');
    document.body.appendChild(modal);
    console.log('✅ Modal estado agregado al DOM');
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
    this.loadOrdersList(this.ordersStatusFilter || 'all', this.ordersPage || 1, this.ordersPerPage || 10);
    
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

    console.log('✅ Creando modal de facturación para orden:', order);

    // Crear modal con opciones de facturación
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      display: flex !important;
      position: fixed !important;
      z-index: 9999 !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: rgba(0, 0, 0, 0.8) !important;
      justify-content: center !important;
      align-items: center !important;
      backdrop-filter: blur(5px) !important;
    `;
    modal.id = `invoice-modal-${orderId}`;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: white !important;
        border-radius: 12px !important;
        padding: 2rem !important;
        max-width: 600px !important;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
        position: relative !important;
        width: 90% !important;
      ">
        <button class="modal-close-btn" onclick="document.getElementById('invoice-modal-${orderId}').remove(); console.log('Modal factura cerrado');" style="
          position: absolute !important;
          top: 1rem !important;
          right: 1rem !important;
          background: none !important;
          border: none !important;
          font-size: 1.5rem !important;
          cursor: pointer !important;
          color: #666 !important;
          z-index: 10000 !important;
        ">
          <i class="fas fa-times"></i>
        </button>
        <div class="invoice-options-header" style="margin-bottom: 2rem; text-align: center;">
          <h2 style="margin-bottom: 1rem; color: var(--text-dark);"><i class="fas fa-file-invoice-dollar"></i> Generar Factura</h2>
          <p style="margin: 0.5rem 0; color: var(--text-light);">Orden #${order.orderNumber || order.order_number || order.id} - Estado: ${this.getStatusLabel(order.status)}</p>
          <p style="margin: 0.5rem 0; color: var(--text-light);"><strong>Cliente:</strong> ${order.customer_info?.name || order.customerInfo?.name || 'No especificado'}</p>
          <p style="margin: 0.5rem 0;"><strong>Total:</strong> <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">$${(order.total || 0).toLocaleString('es-CO')}</span></p>
        </div>
        <div class="invoice-options-content" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="invoice-option-card" onclick="window.adminPanel.generatePDFInvoice('${order.id}'); console.log('Generando PDF');" style="
            display: flex !important;
            align-items: center !important;
            padding: 1rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            background: white !important;
          " onmouseover="this.style.borderColor='var(--primary-color)'; this.style.backgroundColor='#fef7ff';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.backgroundColor='white';">
            <div class="option-icon pdf" style="
              width: 50px !important;
              height: 50px !important;
              background: #dc2626 !important;
              border-radius: 8px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: white !important;
              font-size: 1.5rem !important;
              margin-right: 1rem !important;
            ">
              <i class="fas fa-file-pdf"></i>
            </div>
            <div class="option-info" style="flex: 1;">
              <h3 style="margin: 0 0 0.25rem 0; color: var(--text-dark); font-size: 1.1rem;">Descargar Factura PDF</h3>
              <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">Generar y descargar la factura en formato PDF</p>
            </div>
            <div class="option-arrow" style="color: var(--text-muted);">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div class="invoice-option-card" onclick="window.adminPanel.sendWhatsAppInvoice('${order.id}'); console.log('Enviando WhatsApp');" style="
            display: flex !important;
            align-items: center !important;
            padding: 1rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            background: white !important;
          " onmouseover="this.style.borderColor='var(--primary-color)'; this.style.backgroundColor='#fef7ff';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.backgroundColor='white';">
            <div class="option-icon whatsapp" style="
              width: 50px !important;
              height: 50px !important;
              background: #16a34a !important;
              border-radius: 8px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: white !important;
              font-size: 1.5rem !important;
              margin-right: 1rem !important;
            ">
              <i class="fab fa-whatsapp"></i>
            </div>
            <div class="option-info" style="flex: 1;">
              <h3 style="margin: 0 0 0.25rem 0; color: var(--text-dark); font-size: 1.1rem;">Enviar por WhatsApp</h3>
              <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">Enviar mensaje con confirmación al cliente</p>
            </div>
            <div class="option-arrow" style="color: var(--text-muted);">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div class="invoice-option-card" onclick="window.adminPanel.generatePDFInvoice('${order.id}'); setTimeout(() => window.adminPanel.sendWhatsAppInvoice('${order.id}'), 1000); console.log('PDF + WhatsApp');" style="
            display: flex !important;
            align-items: center !important;
            padding: 1rem !important;
            border: 2px solid var(--primary-color) !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%) !important;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(224, 108, 159, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
            <div class="option-icon both" style="
              width: 50px !important;
              height: 50px !important;
              background: var(--primary-color) !important;
              border-radius: 8px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: white !important;
              font-size: 1.5rem !important;
              margin-right: 1rem !important;
            ">
              <i class="fas fa-paper-plane"></i>
            </div>
            <div class="option-info" style="flex: 1;">
              <h3 style="margin: 0 0 0.25rem 0; color: var(--text-dark); font-size: 1.1rem; font-weight: 600;">PDF + WhatsApp (Recomendado)</h3>
              <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">Descargar PDF y enviar notificación por WhatsApp</p>
            </div>
            <div class="option-arrow" style="color: var(--primary-color);">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
        <div class="invoice-options-actions" style="margin-top: 2rem; text-align: center;">
          <button onclick="document.getElementById('invoice-modal-${orderId}').remove(); console.log('Modal factura cerrado');" class="btn btn-secondary" style="
            padding: 0.75rem 2rem !important;
            background: #6b7280 !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font-weight: 500 !important;
          ">
            <i class="fas fa-times"></i> Cerrar
          </button>
        </div>
      </div>
    `;
    
    console.log('📱 Modal de facturación creado, agregando al DOM...');
    document.body.appendChild(modal);
    console.log('✅ Modal de facturación agregado al DOM');
  }

  async generatePDFInvoice(orderId) {
    console.log('📄 Generando PDF para orden:', orderId);
    
    const order = this.getOrderById(orderId);
    if (!order) {
      alert('❌ Orden no encontrada');
      return;
    }

    console.log('✅ Orden encontrada para PDF:', {
      id: order.id,
      orderNumber: order.orderNumber || order.order_number,
      customer: order.customer_info?.name || order.customerInfo?.name,
      total: order.total
    });

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
        
        // Mostrar loading toast
        const loadingToast = document.createElement('div');
        loadingToast.style.cssText = `
          position: fixed; top: 20px; right: 20px; 
          background: var(--primary-color); color: white; 
          padding: 1rem 1.5rem; border-radius: 8px; 
          z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease;
        `;
        loadingToast.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando PDF...';
        document.body.appendChild(loadingToast);
        
        await window.invoiceGenerator.downloadPDFInvoice(normalizedOrder);
        
        // Remover loading
        if (document.body.contains(loadingToast)) {
          document.body.removeChild(loadingToast);
        }
        
        // Mostrar success toast
        const successToast = document.createElement('div');
        successToast.style.cssText = `
          position: fixed; top: 20px; right: 20px; 
          background: #059669; color: white; 
          padding: 1rem 1.5rem; border-radius: 8px; 
          z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease;
        `;
        successToast.innerHTML = '✅ Factura PDF descargada exitosamente';
        document.body.appendChild(successToast);
        
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast);
          }
        }, 3000);
        
        console.log('✅ PDF generado y descargado exitosamente');
      } else {
        throw new Error('InvoiceGenerator no está inicializado correctamente - Verifica que invoice.js esté cargado');
      }
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      
      const errorToast = document.createElement('div');
      errorToast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #dc2626; color: white; 
        padding: 1rem 1.5rem; border-radius: 8px; 
        z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      errorToast.innerHTML = '❌ Error generando PDF: ' + error.message;
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 5000);
    }
  }

  sendWhatsAppInvoice(orderId) {
    console.log('📱 Enviando WhatsApp para orden:', orderId);
    
    const order = this.getOrderById(orderId);
    if (!order) {
      alert('❌ Orden no encontrada');
      return;
    }

    console.log('✅ Orden encontrada para WhatsApp:', {
      id: order.id,
      customer: order.customer_info?.name || order.customerInfo?.name,
      phone: order.customer_info?.phone || order.customerInfo?.phone
    });

    const customerPhone = order.customer_info?.phone || order.customerInfo?.phone;
    if (!customerPhone) {
      const noPhoneToast = document.createElement('div');
      noPhoneToast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #f59e0b; color: white; 
        padding: 1rem 1.5rem; border-radius: 8px; 
        z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      noPhoneToast.innerHTML = '⚠️ No se encontró número de teléfono del cliente';
      document.body.appendChild(noPhoneToast);
      
      setTimeout(() => {
        if (document.body.contains(noPhoneToast)) {
          document.body.removeChild(noPhoneToast);
        }
      }, 4000);
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
    
    // Mostrar toast de éxito
    const successToast = document.createElement('div');
    successToast.style.cssText = `
      position: fixed; top: 20px; right: 20px; 
      background: #16a34a; color: white; 
      padding: 1rem 1.5rem; border-radius: 8px; 
      z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    successToast.innerHTML = '✅ Abriendo WhatsApp para enviar mensaje...';
    document.body.appendChild(successToast);
    
    setTimeout(() => {
      if (document.body.contains(successToast)) {
        document.body.removeChild(successToast);
      }
    }, 3000);
    
    window.open(whatsappURL, '_blank');
  }

  handleAddProduct(e) {
    e.preventDefault();
    
    // Obtener todos los campos del formulario
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const stock = parseInt(document.getElementById('product-stock').value) || 10;
    const color = document.getElementById('product-color').value.trim();
    const size = document.getElementById('product-size').value;
    const description = document.getElementById('product-description').value.trim();
    const available = document.getElementById('product-available').checked;
    const imageUrl = document.getElementById('product-image-url').value.trim();
    const imageFile = document.getElementById('product-image-input').files[0];

    // Validaciones
    if (!name || !price || !category) {
      this.showNotification('❌ Por favor completa todos los campos requeridos (Nombre, Precio, Categoría)', 'error');
      return;
    }

    if (price <= 0) {
      this.showNotification('❌ El precio debe ser mayor a 0', 'error');
      return;
    }

    // Crear objeto producto completo
    const product = {
      id: Date.now().toString(),
      name,
      price,
      category,
      stock,
      color: color || null,
      size: size || null, 
      description: description || null,
      available,
      image: imageUrl || (imageFile ? URL.createObjectURL(imageFile) : 'recursos/lunilogo.png'),
      created_at: new Date().toISOString()
    };

    console.log('🎆 Agregando producto:', product);

    if (productManager?.addProduct) {
      try {
        productManager.addProduct(product);
        this.showNotification('✅ Producto agregado exitosamente', 'success');
        e.target.reset();
        // Resetear preview de imagen
        document.getElementById('product-image-preview').src = 'recursos/lunilogo.png';
        document.getElementById('product-image-url').value = '';
      } catch (error) {
        console.error('❌ Error agregando producto:', error);
        this.showNotification('❌ Error al agregar producto: ' + error.message, 'error');
      }
    } else {
      this.showNotification('❌ Error: ProductManager no disponible', 'error');
    }
  }

  // Métodos para manejar imágenes adicionales
  addAdditionalImageField() {
    const container = document.getElementById('additional-images-container');
    const currentImages = container.querySelectorAll('.additional-image-field').length;
    
    if (currentImages >= 4) {
      alert('⚠️ Máximo 4 imágenes adicionales permitidas');
      return;
    }
    
    const imageField = document.createElement('div');
    imageField.className = 'additional-image-field';
    imageField.innerHTML = `
      <div class="image-field-content">
        <div class="image-preview-small">
          <img class="additional-preview" src="recursos/lunilogo.png" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
        </div>
        <div class="image-controls-small">
          <label class="btn btn-upload-small">
            <i class="fas fa-upload"></i> Subir
            <input type="file" accept="image/*" style="display: none;" onchange="adminPanel.handleAdditionalImageUpload(this)">
          </label>
          <button type="button" onclick="this.closest('.additional-image-field').remove()" class="btn btn-remove-small">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <input type="text" class="additional-image-url" placeholder="URL de imagen adicional" onchange="this.closest('.additional-image-field').querySelector('.additional-preview').src = this.value || 'recursos/lunilogo.png'">
      </div>
    `;
    
    container.appendChild(imageField);
  }

  handleAdditionalImageUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const preview = input.closest('.additional-image-field').querySelector('.additional-preview');
      const urlInput = input.closest('.additional-image-field').querySelector('.additional-image-url');
      
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        urlInput.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  showAddProductPreview() {
    console.log('👁️ Mostrando vista previa profesional del nuevo producto');
    
    // Recopilar datos del formulario de agregar producto
    const name = document.getElementById('product-name')?.value?.trim() || 'Producto Sin Nombre';
    const price = parseFloat(document.getElementById('product-price')?.value || 0);
    const description = document.getElementById('product-description')?.value?.trim() || 'Sin descripción';
    const color = document.getElementById('product-color')?.value?.trim() || '';
    const size = document.getElementById('product-size')?.value || '';
    
    // Recopilar todas las imágenes
    const mainImage = document.getElementById('product-image-url')?.value?.trim() || 
                     document.getElementById('product-image-preview')?.src || 'recursos/lunilogo.png';
    
    // Recopilar imágenes adicionales
    const additionalImageUrls = [];
    const additionalFields = document.querySelectorAll('.additional-image-field .additional-image-url');
    additionalFields.forEach(field => {
      const url = field.value?.trim();
      if (url && url !== 'recursos/lunilogo.png') {
        additionalImageUrls.push(url);
      }
    });
    
    // Combinar todas las imágenes (principal primero)
    const allImages = [mainImage, ...additionalImageUrls].filter(img => img && img.trim());
    
    // Agregar información de características si están disponibles
    let enhancedDescription = description;
    if (color || size) {
      enhancedDescription += '\n\nCaracterísticas:';
      if (color) enhancedDescription += `\n• Color: ${color}`;
      if (size) enhancedDescription += `\n• Tamaño: ${size}`;
    }
    
    // Llamar a la vista previa profesional
    this.showProfessionalPreview({
      name,
      price,
      description: enhancedDescription,
      images: allImages,
      isEdit: false,
      productId: null
    });
  }
}

// ===== FUNCIONES GLOBALES =====
function showAdminTab(tab) {
  // console.log('🔄 Cambiando a pestaña:', tab);
  
  // Remover clase active de todos los tabs
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.remove('active');
    // console.log('Removiendo active de:', t.dataset.tab);
  });
  
  document.querySelectorAll('.admin-tab-content').forEach(c => {
    c.classList.remove('active');
    // console.log('Ocultando contenido:', c.id);
  });
  
  // Activar tab seleccionado
  const selectedTab = document.querySelector(`.admin-tab[data-tab="${tab}"]`);
  const selectedContent = document.getElementById(`admin-${tab}-tab`);
  
  // console.log('Tab seleccionado:', selectedTab);
  // console.log('Contenido seleccionado:', selectedContent);
  
  if (selectedTab) {
    selectedTab.classList.add('active');
    // console.log('✅ Tab activado:', tab);
  } else {
    console.error('❌ No se encontró tab:', tab);
  }
  
  if (selectedContent) {
    selectedContent.classList.add('active');
    // console.log('✅ Contenido mostrado:', tab);
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
        setTimeout(() => {
          adminPanel.initialize().then(() => {
            adminPanel.loadDashboard();
          }).catch(error => {
            console.error('❌ Error inicializando dashboard:', error);
            adminPanel.loadDashboard();
          });
        }, 100);
        break;
      case 'orders':
        adminPanel.loadOrdersList('all', 1, 10);
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
          adminPanel.loadCategoriesInSelect('product-category');
        }
        break;
    }
  }
}

function filterOrders(status) {
  document.querySelectorAll('.filter-status').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.filter-status[data-status="${status}"]`)?.classList.add('active');
  
  if (adminPanel?.loadOrdersList) {
    adminPanel.loadOrdersList(status, 1, adminPanel.ordersPerPage || 10);
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
    
    const validOrders = effectiveOrders.filter(order => {
      const status = (order.status || '').toLowerCase();
      const excludedStatuses = ['cancelled', 'cancelado', 'canceled'];
      return !excludedStatuses.includes(status);
    });
    
    window.adminPanel.loadSalesChart(validOrders, period);
  }
}

// Exportar para uso global
window.adminPanel = adminPanel;
window.showAdminTab = showAdminTab;
window.filterOrders = filterOrders;
window.changePeriodChart = changePeriodChart;