// Sistema de gestión de categorías conectado a Supabase
class CategoryManager {
  constructor() {
    this.categories = [];
    this.initialized = false;
  }

  // Inicializar y cargar categorías desde Supabase
  async initialize() {
    if (!this.initialized) {
      await this.loadCategories();
      this.initialized = true;
    }
  }

  // Cargar categorías desde Supabase
  async loadCategories() {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error cargando categorías:', error);
        this.categories = this.getDefaultCategories();
        return false;
      }

      // Mapear los datos de Supabase al formato local
      this.categories = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        active: cat.active,
        createdAt: new Date(cat.created_at).getTime()
      }));

      return true;

    } catch (error) {
      console.error('Error conectando a Supabase:', error);
      this.categories = this.getDefaultCategories();
      return false;
    }
  }

  // Categorías por defecto si no se puede conectar a Supabase
  getDefaultCategories() {
    return [
      { id: '1', name: 'Ganchitos', slug: 'ganchitos', icon: '🎀', active: true, createdAt: Date.now() },
      { id: '2', name: 'Fruticas', slug: 'fruticas', icon: '🍓', active: true, createdAt: Date.now() },
      { id: '3', name: 'Animalitos', slug: 'animalitos', icon: '🐱', active: true, createdAt: Date.now() },
      { id: '4', name: 'Naturales', slug: 'naturales', icon: '🌿', active: true, createdAt: Date.now() },
      { id: '5', name: 'Pinzas Clasicas', slug: 'pinzasclasicas', icon: '📎', active: true, createdAt: Date.now() },
      { id: '6', name: 'Flores Medianas', slug: 'floresmedianas', icon: '🌸', active: true, createdAt: Date.now() },
      { id: '7', name: 'Flores Mini', slug: 'floresmini', icon: '🌺', active: true, createdAt: Date.now() },
      { id: '8', name: 'Sets', slug: 'sets', icon: '🎁', active: true, createdAt: Date.now() }
    ];
  }

  // Agregar nueva categoría
  async addCategory(categoryData) {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .insert({
          name: categoryData.name,
          slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''),
          icon: categoryData.icon || '📁',
          active: categoryData.active !== undefined ? categoryData.active : true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando categoría:', error);
        return null;
      }

      // Agregar a la lista local
      const newCategory = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        active: data.active,
        createdAt: new Date(data.created_at).getTime()
      };

      this.categories.push(newCategory);
      return newCategory;

    } catch (error) {
      console.error('Error conectando a Supabase:', error);
      return null;
    }
  }

  // Actualizar categoría existente
  async updateCategory(id, updates) {
    try {
      const updateData = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.slug !== undefined) updateData.slug = updates.slug;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.active !== undefined) updateData.active = updates.active;

      const { data, error } = await supabaseClient
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando categoría:', error);
        return null;
      }

      // Actualizar en la lista local
      const updatedCategory = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        active: data.active,
        createdAt: new Date(data.created_at).getTime()
      };

      const index = this.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        this.categories[index] = updatedCategory;
      }

      return updatedCategory;

    } catch (error) {
      console.error('Error conectando a Supabase:', error);
      return null;
    }
  }

  // Eliminar categoría
  async deleteCategory(id) {
    try {
      // Verificar si hay productos usando esta categoría
      const category = this.getCategoryById(id);
      if (!category) {
        return { success: false, message: 'Categoría no encontrada' };
      }

      const { count } = await supabaseClient
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', category.slug);

      if (count > 0) {
        return { 
          success: false, 
          message: `No se puede eliminar. Hay ${count} producto(s) usando esta categoría` 
        };
      }

      // Eliminar de Supabase
      const { error } = await supabaseClient
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando categoría:', error);
        return { success: false, message: 'Error eliminando la categoría' };
      }

      // Eliminar de la lista local
      this.categories = this.categories.filter(c => c.id !== id);
      return { success: true };

    } catch (error) {
      console.error('Error conectando a Supabase:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Obtener categoría por ID
  getCategoryById(id) {
    return this.categories.find(c => c.id === id);
  }

  // Obtener categoría por slug
  getCategoryBySlug(slug) {
    return this.categories.find(c => c.slug === slug);
  }

  // Obtener categorías activas
  getActiveCategories() {
    return this.categories.filter(c => c.active).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Obtener todas las categorías
  getAllCategories() {
    return this.categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Alias para compatibilidad
  getCategories() {
    return this.getAllCategories();
  }
}

// Instancia global del CategoryManager
const categoryManager = new CategoryManager();

// Inicializar categorías cuando se cargue la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await categoryManager.initialize();
    console.log('CategoryManager inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando CategoryManager:', error);
  }
});

// Función auxiliar para esperar a que CategoryManager esté listo
async function waitForCategories() {
  if (!categoryManager.initialized) {
    await categoryManager.initialize();
  }
  return categoryManager;
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CategoryManager, categoryManager };
}
