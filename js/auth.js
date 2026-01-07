// Sistema de autenticación profesional
class AuthSystem {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.getCurrentUser();
  }

  loadUsers() {
    const stored = localStorage.getItem('luni_users');
    if (stored) {
      return JSON.parse(stored);
    }
    // Usuario por defecto
    return [{
      id: 'admin-1',
      username: 'luniadmin',
      password: this.hashPassword('PauLuna2026'), // Contraseña por defecto: admin123
      role: 'admin',
      name: 'Administrador',
      createdAt: Date.now()
    }];
  }

  saveUsers() {
    localStorage.setItem('luni_users', JSON.stringify(this.users));
  }

  hashPassword(password) {
    // Hash simple (en producción usar bcrypt o similar)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  login(username, password) {
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

    return { success: true, user };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('luni_current_user');
    localStorage.removeItem('luni_admin_auth');
    // Actualizar UI antes de recargar
    if (adminPanel) {
      adminPanel.updateAuthUI();
    }
    window.location.reload();
  }

  getCurrentUser() {
    const stored = localStorage.getItem('luni_current_user');
    return stored ? JSON.parse(stored) : null;
  }

  isAuthenticated() {
    return this.currentUser !== null && localStorage.getItem('luni_admin_auth') === 'true';
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

