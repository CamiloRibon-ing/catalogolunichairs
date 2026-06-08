class AuthSystem {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.getCurrentUser();
    this.restoreSupabaseSession();
  }

  loadUsers() {
    const stored = localStorage.getItem('luni_users');
    if (stored) {
      return JSON.parse(stored);
    }
    return [{
      id: 'admin-1',
      username: 'luniadmin',
      password: this.hashPassword('PauLuna2026'),
      role: 'admin',
      name: 'Administrador',
      createdAt: Date.now()
    }];
  }

  saveUsers() {
    localStorage.setItem('luni_users', JSON.stringify(this.users));
  }

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async login(username, password) {
    const supabaseResult = await this.loginWithSupabase(username, password);
    if (supabaseResult.success) {
      return supabaseResult;
    }

    if (username.includes('@')) {
      return {
        success: false,
        message: supabaseResult.message || 'No se pudo iniciar sesiÃ³n con Supabase'
      };
    }

    const user = this.users.find(u => u.username === username);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Guardar sesión
    this.currentUser = user;
    localStorage.setItem('luni_current_user', JSON.stringify(user));
    localStorage.setItem('luni_admin_auth', 'true');
    window.dispatchEvent(new CustomEvent('luni-auth-changed'));

    return { success: true, user };
  }

  async loginWithSupabase(username, password) {
    if (!username.includes('@') || typeof window.supabaseClient === 'undefined' || !window.supabaseClient?.auth) {
      return { success: false, message: 'Supabase Auth no disponible' };
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: username,
        password
      });

      if (error || !data?.user) {
        return { success: false, message: error?.message || 'Credenciales incorrectas' };
      }

      const user = {
        id: data.user.id,
        username: data.user.email,
        email: data.user.email,
        role: 'admin',
        name: data.user.user_metadata?.name || data.user.email,
        provider: 'supabase'
      };

      this.currentUser = user;
      localStorage.setItem('luni_current_user', JSON.stringify(user));
      localStorage.setItem('luni_admin_auth', 'true');
      localStorage.setItem('luni_auth_provider', 'supabase');
      window.dispatchEvent(new CustomEvent('luni-auth-changed'));

      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message || 'Error iniciando sesiÃ³n' };
    }
  }

  logout() {
    if (localStorage.getItem('luni_auth_provider') === 'supabase' && window.supabaseClient?.auth) {
      window.supabaseClient.auth.signOut();
    }

    this.currentUser = null;
    localStorage.removeItem('luni_current_user');
    localStorage.removeItem('luni_admin_auth');
    localStorage.removeItem('luni_auth_provider');
    window.dispatchEvent(new CustomEvent('luni-auth-changed'));
    if (window.adminPanel) {
      window.adminPanel.updateAuthUI();
    }
    window.location.reload();
  }

  getCurrentUser() {
    const stored = localStorage.getItem('luni_current_user');
    return stored ? JSON.parse(stored) : null;
  }

  async restoreSupabaseSession() {
    if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient?.auth) {
      return;
    }

    try {
      const { data } = await window.supabaseClient.auth.getUser();
      if (!data?.user) return;

      const user = {
        id: data.user.id,
        username: data.user.email,
        email: data.user.email,
        role: 'admin',
        name: data.user.user_metadata?.name || data.user.email,
        provider: 'supabase'
      };

      this.currentUser = user;
      localStorage.setItem('luni_current_user', JSON.stringify(user));
      localStorage.setItem('luni_admin_auth', 'true');
      localStorage.setItem('luni_auth_provider', 'supabase');
      window.dispatchEvent(new CustomEvent('luni-auth-changed'));

      if (window.adminPanel) {
        window.adminPanel.updateAuthUI();
      }
    } catch (error) {
      // Mantener fallback local si la sesiÃ³n remota no estÃ¡ disponible.
    }
  }

  isAuthenticated() {
    const storedUser = this.getCurrentUser();
    return Boolean(this.currentUser || storedUser || localStorage.getItem('luni_admin_auth') === 'true');
  }

  changePassword(username, oldPassword, newPassword) {
    const user = this.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'Usuario no encontrado' };

    if (user.password !== this.hashPassword(oldPassword)) {
      return { success: false, message: 'Contraseña actual incorrecta' };
    }

    user.password = this.hashPassword(newPassword);
    this.saveUsers();
    return { success: true, message: 'Contraseña actualizada' };
  }
}

// Instancia global
const authSystem = new AuthSystem();
window.authSystem = authSystem;

