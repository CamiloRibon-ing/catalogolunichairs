// Panel de administración mejorado
class AdminPanel {
  constructor() {
    this.currentTab = 'products';
    this.init();
  }

  init() {
    this.updateAuthUI();
    this.setupEventListeners(); // Siempre configurar event listeners
    if (authSystem.isAuthenticated()) {
      this.showAdminButton();
    }
  }

  updateAuthUI() {
    const loginBtn = document.getElementById('header-login-btn');
    const userMenu = document.getElementById('user-menu');
    const currentUser = authSystem.getCurrentUser();

    if (authSystem.isAuthenticated() && currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) {
        userMenu.style.display = 'flex';
        const usernameSpan = document.getElementById('current-username');
        if (usernameSpan) usernameSpan.textContent = currentUser.name || currentUser.username;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
    }
  }

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
          <div class="login-logo-wrapper">
            <img src="recursos/lunilogo.png" alt="Luni Logo" class="login-logo">
            <div class="logo-glow"></div>
          </div>
          <h2>🌸 Panel de Administración 🌸</h2>
          <p>Ingresa tus credenciales para acceder</p>
        </div>
        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="login-username">
              <i class="fas fa-user"></i> Usuario
            </label>
            <input type="text" id="login-username" required autocomplete="username" placeholder="Ingresa tu usuario">
          </div>
          <div class="form-group">
            <label for="login-password">
              <i class="fas fa-lock"></i> Contraseña
            </label>
            <input type="password" id="login-password" required autocomplete="current-password" placeholder="Ingresa tu contraseña">
          </div>
          <div id="login-error" class="error-message" style="display: none;"></div>
          <button type="submit" class="btn btn-login">
            <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
          </button>
        </form>
        <div class="login-footer">
          <p><small>💡 Usuario: <strong>admin</strong> / Contraseña: <strong>admin123</strong></small></p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Event listeners
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    const result = authSystem.login(username, password);
    
    if (result.success) {
      this.closeLoginModal();
      this.showAdminButton();
      this.setupEventListeners();
      this.updateAuthUI();
      showNotification('✨ Sesión iniciada correctamente ✨', 'success');
    } else {
      errorDiv.textContent = result.message;
      errorDiv.style.display = 'block';
    }
  }

  closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  showAdminButton() {
    if (document.getElementById('admin-btn')) return;

    const adminBtn = document.createElement('div');
    adminBtn.id = 'admin-btn';
    adminBtn.className = 'admin-btn';
    adminBtn.innerHTML = '<i class="fas fa-cog"></i>';
    adminBtn.title = 'Panel de Administración';
    adminBtn.addEventListener('click', () => this.openAdminPanel());
    document.body.appendChild(adminBtn);
  }

  openAdminPanel() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Cargar dashboard por defecto
      this.loadDashboard();
      this.loadOrdersList();
      this.loadCategoriesList();
      this.loadProductsList();
      this.updateOrdersStats();
    }
  }

  // ===== DASHBOARD/ESTADÍSTICAS =====
  loadDashboard() {
    // Actualizar estadísticas generales
    const stats = statisticsManager.getGeneralStats();
    
    const totalRevenueEl = document.getElementById('stat-total-revenue');
    const totalOrdersEl = document.getElementById('stat-total-orders');
    const averageOrderEl = document.getElementById('stat-average-order');
    const pendingEl = document.getElementById('stat-pending');

    if (totalRevenueEl) totalRevenueEl.textContent = `$${stats.totalRevenue.toLocaleString('es-CO')}`;
    if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders;
    if (averageOrderEl) averageOrderEl.textContent = `$${Math.round(stats.averageOrder).toLocaleString('es-CO')}`;
    if (pendingEl) pendingEl.textContent = stats.pendingOrders;

    // Cargar productos con poco stock
    this.loadLowStockProducts();

    // Renderizar gráficas (con delay para asegurar que el DOM esté listo)
    setTimeout(() => {
      statisticsManager.renderAllCharts();
    }, 100);
  }

  loadLowStockProducts() {
    const list = document.getElementById('low-stock-list');
    if (!list) return;

    const lowStockProducts = statisticsManager.getLowStockProducts(5);
    list.innerHTML = '';

    if (lowStockProducts.length === 0) {
      list.innerHTML = '<p class="empty-state">✅ Todos los productos tienen stock suficiente</p>';
      return;
    }

    lowStockProducts.forEach(product => {
      const item = document.createElement('div');
      item.className = 'low-stock-item';
      const stockClass = product.stock === 0 ? 'out-of-stock' : product.stock <= 2 ? 'critical' : 'low';
      item.innerHTML = `
        <div class="low-stock-info">
          <h5>${product.name}</h5>
          <p>${product.category} | $${product.price.toLocaleString('es-CO')}</p>
        </div>
        <div class="low-stock-stock ${stockClass}">
          <span class="stock-label">Stock:</span>
          <span class="stock-value">${product.stock}</span>
        </div>
        <button onclick="adminPanel.editProduct('${product.id}')" class="btn-edit-small">
          <i class="fas fa-edit"></i> Actualizar
        </button>
      `;
      list.appendChild(item);
    });
  }

  closeAdminPanel() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Configurar listeners básicos inmediatamente
    this.setupBasicEventListeners();
    
    // Configurar listeners del admin si el DOM está listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initEventListeners());
    } else {
      this.initEventListeners();
    }
  }

  setupBasicEventListeners() {
    // Configurar botón de login del header (siempre disponible)
    const headerLoginBtn = document.getElementById('header-login-btn');
    if (headerLoginBtn && !headerLoginBtn.hasAttribute('data-listener')) {
      headerLoginBtn.setAttribute('data-listener', 'true');
      headerLoginBtn.addEventListener('click', () => {
        this.showLoginModal();
      });
    }
  }

  initEventListeners() {
    const closeBtn = document.getElementById('admin-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeAdminPanel());
    }

    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('¿Deseas cerrar sesión?')) {
          authSystem.logout();
        }
      });
    }

    const headerLogoutBtn = document.getElementById('header-logout-btn');
    if (headerLogoutBtn) {
      headerLogoutBtn.addEventListener('click', () => {
        if (confirm('¿Deseas cerrar sesión?')) {
          authSystem.logout();
        }
      });
    }

    const headerLoginBtn = document.getElementById('header-login-btn');
    if (headerLoginBtn) {
      headerLoginBtn.addEventListener('click', () => {
        this.showLoginModal();
      });
    }

    const addCategoryBtn = document.getElementById('admin-add-category');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.showAddCategoryForm());
    }

    const saveCategoryBtn = document.getElementById('save-category-btn');
    if (saveCategoryBtn) {
      saveCategoryBtn.addEventListener('click', () => this.saveCategory());
    }

    const addProductBtn = document.getElementById('admin-add-product');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.showAddProductForm());
    }

    const saveProductBtn = document.getElementById('save-product-btn');
    if (saveProductBtn) {
      saveProductBtn.addEventListener('click', () => this.saveProduct());
    }

    // Upload de imagen
    const imageInput = document.getElementById('product-image-input');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }
  }

  // ===== GESTIÓN DE CATEGORÍAS =====
  loadCategoriesList() {
    const list = document.getElementById('admin-categories-list');
    if (!list) return;

    const categories = categoryManager.getAllCategories();
    list.innerHTML = '';

    if (categories.length === 0) {
      list.innerHTML = '<p class="empty-state">No hay categorías registradas</p>';
      return;
    }

    categories.forEach((category) => {
      const item = document.createElement('div');
      item.className = `admin-category-item ${!category.active ? 'inactive' : ''}`;
      item.innerHTML = `
        <div class="admin-category-info">
          <span class="category-icon">${category.icon || '📁'}</span>
          <div>
            <h4>${category.name}</h4>
            <p>Slug: ${category.slug} | ${category.active ? 'Activa' : 'Inactiva'}</p>
          </div>
        </div>
        <div class="admin-category-actions">
          <button onclick="adminPanel.editCategory('${category.id}')" class="btn-edit">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="adminPanel.deleteCategory('${category.id}')" class="btn-delete">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  showAddCategoryForm(category = null) {
    const form = document.getElementById('category-form');
    if (!form) return;

    if (category) {
      document.getElementById('category-id').value = category.id;
      document.getElementById('category-name').value = category.name;
      document.getElementById('category-slug').value = category.slug;
      document.getElementById('category-icon').value = category.icon || '';
      document.getElementById('category-active').checked = category.active !== false;
      document.getElementById('category-form-title').textContent = 'Editar Categoría';
    } else {
      form.reset();
      document.getElementById('category-id').value = '';
      document.getElementById('category-form-title').textContent = 'Agregar Nueva Categoría';
    }

    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
  }

  saveCategory() {
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const slug = document.getElementById('category-slug').value.toLowerCase().replace(/\s+/g, '');
    const icon = document.getElementById('category-icon').value;
    const active = document.getElementById('category-active').checked;

    if (!name || !slug) {
      showNotification('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    // Verificar slug único
    const existing = categoryManager.getCategoryBySlug(slug);
    if (existing && existing.id !== id) {
      showNotification('Ya existe una categoría con ese slug', 'error');
      return;
    }

    const categoryData = { name, slug, icon, active };

    if (id) {
      categoryManager.updateCategory(id, categoryData);
      showNotification('Categoría actualizada exitosamente', 'success');
    } else {
      categoryManager.addCategory(categoryData);
      showNotification('Categoría agregada exitosamente', 'success');
    }

    document.getElementById('category-form').style.display = 'none';
    this.loadCategoriesList();
    this.updateCategorySelect();
  }

  editCategory(id) {
    const category = categoryManager.getCategoryById(id);
    if (category) {
      this.showAddCategoryForm(category);
    }
  }

  deleteCategory(id) {
    const result = categoryManager.deleteCategory(id);
    if (result.success) {
      this.loadCategoriesList();
      this.updateCategorySelect();
      showNotification('Categoría eliminada', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  }

  updateCategorySelect() {
    const select = document.getElementById('product-category');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Seleccione una categoría</option>';
    
    categoryManager.getActiveCategories().forEach(category => {
      const option = document.createElement('option');
      option.value = category.slug;
      option.textContent = `${category.icon || ''} ${category.name}`;
      select.appendChild(option);
    });

    if (currentValue) {
      select.value = currentValue;
    }
  }

  // ===== GESTIÓN DE PRODUCTOS =====
  loadProductsList() {
    const list = document.getElementById('admin-products-list');
    if (!list) return;

    const products = productManager.products;
    list.innerHTML = '';

    if (products.length === 0) {
      list.innerHTML = '<p class="empty-state">No hay productos registrados. Agrega categorías primero.</p>';
      return;
    }

    products.forEach((product) => {
      const category = categoryManager.getCategoryBySlug(product.category);
      const item = document.createElement('div');
      item.className = `admin-product-item ${!product.available ? 'unavailable' : ''}`;
      item.innerHTML = `
        <div class="admin-product-info">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='recursos/lunilogo.png'">
          <div>
            <h4>${product.name}</h4>
            <p><span class="category-badge">${category ? category.icon + ' ' + category.name : product.category}</span></p>
            <p>$${product.price.toLocaleString('es-CO')} | Stock: ${product.stock} | ${product.available ? '✅ Disponible' : '❌ No disponible'}</p>
          </div>
        </div>
        <div class="admin-product-actions">
          <button onclick="adminPanel.editProduct('${product.id}')" class="btn-edit">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="adminPanel.deleteProduct('${product.id}')" class="btn-delete">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  showAddProductForm(product = null) {
    // Verificar que haya categorías
    if (categoryManager.getActiveCategories().length === 0) {
      showNotification('Debes crear al menos una categoría antes de agregar productos', 'error');
      showAdminTab('categories');
      return;
    }

    const form = document.getElementById('product-form');
    if (!form) return;

    this.updateCategorySelect();

    if (product) {
      document.getElementById('product-id').value = product.id;
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-color').value = product.color || '';
      document.getElementById('product-size').value = product.size || '';
      document.getElementById('product-stock').value = product.stock || 0;
      document.getElementById('product-available').checked = product.available !== false;
      document.getElementById('product-description').value = product.description || '';
      document.getElementById('product-image-url').value = product.image || '';
      document.getElementById('product-image-preview').src = product.image || 'recursos/lunilogo.png';
      document.getElementById('form-title').textContent = 'Editar Producto';
    } else {
      form.reset();
      document.getElementById('product-id').value = '';
      document.getElementById('product-image-preview').src = 'recursos/lunilogo.png';
      document.getElementById('form-title').textContent = 'Agregar Nuevo Producto';
    }

    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = cloudinaryUploader.validateFile(file);
    if (!validation.valid) {
      showNotification(validation.message, 'error');
      return;
    }

    const preview = document.getElementById('product-image-preview');
    const progressBar = document.getElementById('upload-progress');
    const uploadBtn = document.getElementById('upload-image-btn');

    // Mostrar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    if (uploadBtn) uploadBtn.disabled = true;
    if (progressBar) progressBar.style.display = 'block';

    try {
      const result = await cloudinaryUploader.uploadImageWithProgress(file, (progress) => {
        if (progressBar) {
          progressBar.style.width = progress + '%';
        }
      });

      if (result.success) {
        document.getElementById('product-image-url').value = result.url;
        preview.src = result.url;
        showNotification('Imagen subida exitosamente', 'success');
      }
    } catch (error) {
      showNotification(error.message || 'Error al subir la imagen', 'error');
    } finally {
      if (uploadBtn) uploadBtn.disabled = false;
      if (progressBar) {
        progressBar.style.display = 'none';
        progressBar.style.width = '0%';
      }
    }
  }

  saveProduct() {
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const color = document.getElementById('product-color').value;
    const size = document.getElementById('product-size').value;
    const stock = parseInt(document.getElementById('product-stock').value) || 0;
    const available = document.getElementById('product-available').checked;
    const description = document.getElementById('product-description').value;
    const image = document.getElementById('product-image-url').value;

    if (!name || !category || !price || price <= 0) {
      showNotification('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    // Verificar que la categoría existe
    const categoryObj = categoryManager.getCategoryBySlug(category);
    if (!categoryObj) {
      showNotification('La categoría seleccionada no existe', 'error');
      return;
    }

    const productData = {
      name,
      category,
      price,
      color,
      size,
      stock,
      available,
      description,
      image: image || 'recursos/lunilogo.png'
    };

    if (id) {
      productManager.updateProduct(id, productData);
      showNotification('Producto actualizado exitosamente', 'success');
    } else {
      productManager.addProduct(productData);
      showNotification('Producto agregado exitosamente', 'success');
    }

    document.getElementById('product-form').style.display = 'none';
    this.loadProductsList();
    if (window.renderProductCatalog) {
      window.renderProductCatalog();
    }
  }

  editProduct(id) {
    const product = productManager.getProduct(id);
    if (product) {
      this.showAddProductForm(product);
    }
  }

  deleteProduct(id) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      productManager.deleteProduct(id);
      this.loadProductsList();
      if (window.renderProductCatalog) {
        window.renderProductCatalog();
      }
      showNotification('Producto eliminado', 'success');
    }
  }

  // ===== GESTIÓN DE PEDIDOS =====
  loadOrdersList(status = 'all') {
    const list = document.getElementById('admin-orders-list');
    if (!list) return;

    const orders = orderManager.getOrdersByStatus(status);
    list.innerHTML = '';

    if (orders.length === 0) {
      list.innerHTML = '<p class="empty-state">No hay pedidos registrados</p>';
      return;
    }

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const formattedDate = date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const item = document.createElement('div');
      item.className = `admin-order-item status-${order.status}`;
      item.innerHTML = `
        <div class="order-header-info">
          <div class="order-main-info">
            <h4>${order.orderNumber}</h4>
            <p class="order-customer">👤 ${order.customerInfo.name}</p>
            <p class="order-date">📅 ${formattedDate}</p>
          </div>
          <div class="order-status-badge status-${order.status}">
            ${this.getStatusLabel(order.status)}
          </div>
        </div>
        <div class="order-details">
          <div class="order-items-summary">
            <p><strong>${order.items.length}</strong> producto(s) | Total: <strong>$${order.total.toLocaleString('es-CO')}</strong></p>
          </div>
          <div class="order-actions">
            <button onclick="adminPanel.viewOrder('${order.id}')" class="btn-view">
              <i class="fas fa-eye"></i> Ver Detalles
            </button>
            <select onchange="adminPanel.changeOrderStatus('${order.id}', this.value)" class="status-select">
              <option value="pendiente" ${order.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="confirmado" ${order.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
              <option value="en_preparacion" ${order.status === 'en_preparacion' ? 'selected' : ''}>En Preparación</option>
              <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
              <option value="entregado" ${order.status === 'entregado' ? 'selected' : ''}>Entregado</option>
              <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
            ${order.status === 'confirmado' || order.status === 'en_preparacion' ? `
            <button onclick="adminPanel.sendInvoice('${order.id}')" class="btn-invoice" ${order.invoiceSent ? 'disabled' : ''}>
              <i class="fas fa-file-invoice"></i> ${order.invoiceSent ? 'Factura Enviada' : 'Enviar Factura'}
            </button>
            ` : ''}
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  }

  updateOrdersStats() {
    const stats = orderManager.getOrdersStats();
    const totalEl = document.getElementById('orders-total');
    const revenueEl = document.getElementById('orders-revenue');
    
    if (totalEl) totalEl.textContent = stats.total;
    if (revenueEl) revenueEl.textContent = `$${stats.totalRevenue.toLocaleString('es-CO')}`;
  }

  getStatusLabel(status) {
    const labels = {
      'pendiente': '⏳ Pendiente',
      'confirmado': '✅ Confirmado',
      'en_preparacion': '📦 En Preparación',
      'enviado': '🚚 Enviado',
      'entregado': '🎉 Entregado',
      'cancelado': '❌ Cancelado'
    };
    return labels[status] || status;
  }

  changeOrderStatus(orderId, newStatus) {
    const order = orderManager.updateOrderStatus(orderId, newStatus);
    if (order) {
      this.loadOrdersList();
      this.updateOrdersStats();
      
      // Actualizar dashboard si está activo
      const dashboardTab = document.getElementById('admin-dashboard-tab');
      if (dashboardTab && dashboardTab.classList.contains('active')) {
        this.loadDashboard();
      }
      
      showNotification(`Estado actualizado a: ${this.getStatusLabel(newStatus)}`, 'success');
    }
  }

  viewOrder(orderId) {
    const order = orderManager.getOrder(orderId);
    if (!order) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'order-detail-modal';
    modal.innerHTML = `
      <div class="modal-content order-detail-content">
        <button class="modal-close-btn" onclick="this.closest('.modal').remove()">
          <i class="fas fa-times"></i>
        </button>
        <h2>Detalles del Pedido: ${order.orderNumber}</h2>
        <div class="order-detail-info">
          <div class="detail-section">
            <h3>💝 Cliente</h3>
            <p><strong>Nombre:</strong> ${order.customerInfo.name}</p>
            <p><strong>Teléfono:</strong> ${order.customerInfo.phone}</p>
            ${order.customerInfo.email ? `<p><strong>Email:</strong> ${order.customerInfo.email}</p>` : ''}
            <p><strong>Dirección:</strong> ${order.customerInfo.address}</p>
            <p><strong>Ciudad:</strong> ${order.customerInfo.city}</p>
          </div>
          <div class="detail-section">
            <h3>🛍️ Productos</h3>
            ${order.items.map(item => `
              <div class="detail-item">
                <p><strong>${item.productName}</strong></p>
                ${item.color ? `<p>Color: ${item.color}</p>` : ''}
                ${item.size ? `<p>Tamaño: ${item.size}</p>` : ''}
                <p>Cantidad: ${item.quantity} x $${item.price.toLocaleString('es-CO')} = $${item.subtotal.toLocaleString('es-CO')}</p>
              </div>
            `).join('')}
          </div>
          <div class="detail-section">
            <h3>💰 Total</h3>
            <p class="total-amount">$${order.total.toLocaleString('es-CO')}</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  async sendInvoice(orderId) {
    const order = orderManager.getOrder(orderId);
    if (!order) return;

    if (confirm('¿Deseas enviar la factura por WhatsApp al cliente?')) {
      const invoiceUrl = await invoiceGenerator.sendInvoiceByWhatsApp(order);
      window.open(invoiceUrl, '_blank');
      
      orderManager.markInvoiceSent(orderId);
      this.loadOrdersList();
      
      // Actualizar dashboard si está activo
      const dashboardTab = document.getElementById('admin-dashboard-tab');
      if (dashboardTab && dashboardTab.classList.contains('active')) {
        this.loadDashboard();
      }
      
      showNotification('✨ Factura enviada exitosamente ✨', 'success');
    }
  }
}

// Instancia global
const adminPanel = new AdminPanel();

// Función global para cambiar tabs
function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  
  if (tab === 'dashboard') {
    document.querySelector('.admin-tab[data-tab="dashboard"]')?.classList.add('active');
    document.getElementById('admin-dashboard-tab')?.classList.add('active');
    adminPanel.loadDashboard();
  } else if (tab === 'products') {
    document.querySelector('.admin-tab[data-tab="products"]')?.classList.add('active');
    document.getElementById('admin-products-tab')?.classList.add('active');
    adminPanel.loadProductsList();
  } else if (tab === 'categories') {
    document.querySelector('.admin-tab[data-tab="categories"]')?.classList.add('active');
    document.getElementById('admin-categories-tab')?.classList.add('active');
    adminPanel.loadCategoriesList();
  } else if (tab === 'add-product') {
    document.querySelector('.admin-tab[data-tab="add-product"]')?.classList.add('active');
    document.getElementById('admin-add-tab')?.classList.add('active');
  }
}
