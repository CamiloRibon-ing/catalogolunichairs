// Sistema de gestión de categorías
class CategoryManager {
  constructor() {
    this.categories = this.loadCategories();
  }

  loadCategories() {
    const stored = localStorage.getItem('luni_categories');
    if (stored) {
      return JSON.parse(stored);
    }
    // Categorías iniciales
    return [
      { id: 'cat-1', name: 'Ganchitos', slug: 'ganchitos', icon: '🎀', active: true, createdAt: Date.now() },
      { id: 'cat-2', name: 'Fruticas', slug: 'fruticas', icon: '🍓', active: true, createdAt: Date.now() },
      { id: 'cat-3', name: 'Animalitos', slug: 'animalitos', icon: '🐱', active: true, createdAt: Date.now() },
      { id: 'cat-4', name: 'Naturales', slug: 'naturales', icon: '🌿', active: true, createdAt: Date.now() },
      { id: 'cat-5', name: 'Pinzas Clasicas', slug: 'pinzasclasicas', icon: '📎', active: true, createdAt: Date.now() },
      { id: 'cat-6', name: 'Flores Medianas', slug: 'floresmedianas', icon: '🌸', active: true, createdAt: Date.now() },
      { id: 'cat-7', name: 'Flores Mini', slug: 'floresmini', icon: '🌺', active: true, createdAt: Date.now() },
      { id: 'cat-8', name: 'Sets', slug: 'sets', icon: '🎁', active: true, createdAt: Date.now() }
    ];
  }

  saveCategories() {
    localStorage.setItem('luni_categories', JSON.stringify(this.categories));
  }

  addCategory(categoryData) {
    const newCategory = {
      id: 'cat-' + Date.now(),
      ...categoryData,
      active: categoryData.active !== undefined ? categoryData.active : true,
      createdAt: Date.now()
    };
    this.categories.push(newCategory);
    this.saveCategories();
    return newCategory;
  }

  updateCategory(id, updates) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories[index] = { ...this.categories[index], ...updates };
      this.saveCategories();
      return this.categories[index];
    }
    return null;
  }

  deleteCategory(id) {
    // Verificar si hay productos usando esta categoría
    const products = productManager.products.filter(p => p.category === this.getCategoryById(id)?.slug);
    if (products.length > 0) {
      return { success: false, message: `No se puede eliminar. Hay ${products.length} producto(s) usando esta categoría` };
    }
    this.categories = this.categories.filter(c => c.id !== id);
    this.saveCategories();
    return { success: true };
  }

  getCategoryById(id) {
    return this.categories.find(c => c.id === id);
  }

  getCategoryBySlug(slug) {
    return this.categories.find(c => c.slug === slug);
  }

  getActiveCategories() {
    return this.categories.filter(c => c.active);
  }

  getAllCategories() {
    return this.categories;
  }
}

// Instancia global
const categoryManager = new CategoryManager();

