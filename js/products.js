// Sistema de gestión de productos
class ProductManager {
  constructor() {
    this.products = this.loadProducts();
    this.categories = ['ganchitos', 'fruticas', 'animalitos', 'naturales', 'pinzasclasicas', 'floresmedianas', 'floresmini', 'sets'];
    this.sizes = ['Pequeño', 'Mediano', 'Grande'];
  }

  loadProducts() {
    const stored = localStorage.getItem('luni_products');
    if (stored) {
      return JSON.parse(stored);
    }
    // Productos iniciales basados en el HTML actual
    return this.getInitialProducts();
  }

  getInitialProducts() {
    // Productos iniciales basados en el catálogo original
    return [
      {
        id: 'prod-1',
        name: 'Orquidea',
        category: 'ganchitos',
        price: 6000,
        color: 'Rosa y crema',
        size: 'Mediano',
        image: 'recursos/orquidea.png',
        available: true,
        stock: 10,
        description: 'Ganchito elegante con diseño de orquídea'
      },
      {
        id: 'prod-2',
        name: 'Flor perlada',
        category: 'ganchitos',
        price: 7000,
        color: 'blanco perla',
        size: 'Grande',
        image: 'recursos/florperlada.png',
        available: true,
        stock: 8,
        description: 'Flor perlada elegante'
      },
      {
        id: 'prod-3',
        name: 'Flor pastel',
        category: 'ganchitos',
        price: 5000,
        color: 'Azul pastel',
        size: 'Grande',
        image: 'recursos/florpastel.png',
        available: true,
        stock: 12,
        description: 'Flor pastel en azul'
      },
      {
        id: 'prod-4',
        name: 'Flor cataleya',
        category: 'ganchitos',
        price: 5000,
        color: 'Lila',
        size: 'Grande',
        image: 'recursos/cataleya.png',
        available: true,
        stock: 9,
        description: 'Flor cataleya en lila'
      },
      {
        id: 'prod-5',
        name: 'Flor Ginebra',
        category: 'ganchitos',
        price: 6500,
        color: 'Amarillo perlado',
        size: 'Grande',
        image: 'recursos/florginebra.png',
        available: true,
        stock: 7,
        description: 'Flor Ginebra en amarillo perlado'
      },
      {
        id: 'prod-6',
        name: 'Flor Amatista',
        category: 'ganchitos',
        price: 6500,
        color: 'Rosa Tornasol',
        size: 'Grande',
        image: 'recursos/floramatatista.png',
        available: true,
        stock: 8,
        description: 'Flor Amatista en rosa tornasol'
      },
      {
        id: 'prod-7',
        name: 'Flor Aloha',
        category: 'ganchitos',
        price: 6000,
        color: 'Salmon y fucsia',
        size: 'Grande',
        image: 'recursos/floraloha.png',
        available: true,
        stock: 10,
        description: 'Flor Aloha en salmon y fucsia'
      },
      {
        id: 'prod-8',
        name: 'Flor Mahina',
        category: 'ganchitos',
        price: 6000,
        color: 'Rosa y Lila Translucidos',
        size: 'Grande',
        image: 'recursos/flormahina.png',
        available: true,
        stock: 11,
        description: 'Flor Mahina translúcida'
      },
      {
        id: 'prod-9',
        name: 'Piñita',
        category: 'fruticas',
        price: 15000,
        color: 'Amarillo y verde',
        size: 'Mediano',
        image: 'recursos/piñita.png',
        available: true,
        stock: 5,
        description: 'Pinza con diseño de piña'
      },
      {
        id: 'prod-10',
        name: 'Fresita',
        category: 'fruticas',
        price: 15000,
        color: 'Rojo, Verde y Amarillo',
        size: 'Mediano',
        image: 'recursos/fresita.png',
        available: true,
        stock: 6,
        description: 'Pinza con diseño de fresa'
      },
      {
        id: 'prod-11',
        name: 'Sandia',
        category: 'fruticas',
        price: 15000,
        color: 'Rojo',
        size: 'Mediano',
        image: 'recursos/sandia.png',
        available: true,
        stock: 4,
        description: 'Pinza con diseño de sandía'
      },
      {
        id: 'prod-12',
        name: 'Potatsio',
        category: 'fruticas',
        price: 21500,
        color: 'Verde y Café',
        size: 'Mediano',
        image: 'recursos/potatsio.png',
        available: true,
        stock: 3,
        description: 'Pinza con diseño de aguacate'
      },
      {
        id: 'prod-13',
        name: 'Banana',
        category: 'fruticas',
        price: 21500,
        color: 'Amarillo y Negro',
        size: 'Grande',
        image: 'recursos/banana.png',
        available: true,
        stock: 5,
        description: 'Pinza con diseño de banana'
      },
      {
        id: 'prod-14',
        name: 'Cerezita',
        category: 'fruticas',
        price: 18500,
        color: 'Rojo y Verde',
        size: 'Mediano',
        image: 'recursos/cerecita.png',
        available: true,
        stock: 7,
        description: 'Pinza con diseño de cereza'
      },
      {
        id: 'prod-15',
        name: 'Fresita mini',
        category: 'fruticas',
        price: 13000,
        color: 'Rojo y Verde',
        size: 'Pequeño',
        image: 'recursos/fresitamini.png',
        available: true,
        stock: 8,
        description: 'Pinza mini con diseño de fresa'
      },
      {
        id: 'prod-16',
        name: 'Gatico Negro',
        category: 'animalitos',
        price: 23500,
        color: 'Negro y blanco',
        size: 'Grande',
        image: 'recursos/gaticonegro.png',
        available: true,
        stock: 4,
        description: 'Pinza con diseño de gato'
      },
      {
        id: 'prod-17',
        name: 'Tucanita',
        category: 'animalitos',
        price: 18000,
        color: 'Combinado',
        size: 'Grande',
        image: 'recursos/tucanita.png',
        available: true,
        stock: 6,
        description: 'Pinza con diseño de tucán'
      },
      {
        id: 'prod-18',
        name: 'Abejita Mini',
        category: 'animalitos',
        price: 7000,
        color: 'Amarillo y Negro',
        size: 'Pequeño',
        image: 'recursos/abejitamini.png',
        available: true,
        stock: 10,
        description: 'Pinza mini con diseño de abeja'
      },
      {
        id: 'prod-19',
        name: 'Abejita',
        category: 'animalitos',
        price: 20000,
        color: 'Blanco, Amarillo y Negro',
        size: 'Mediano',
        image: 'recursos/abejita.png',
        available: true,
        stock: 8,
        description: 'Pinza con diseño de abeja'
      },
      {
        id: 'prod-20',
        name: 'Arco-Iris',
        category: 'naturales',
        price: 23200,
        color: 'Combinado',
        size: 'Mediano',
        image: 'recursos/arcoiris.png',
        available: true,
        stock: 5,
        description: 'Pinza con diseño de arcoíris'
      },
      {
        id: 'prod-21',
        name: 'Cubito Print',
        category: 'pinzasclasicas',
        price: 7000,
        color: 'Negro y Gris',
        size: 'Grande',
        image: 'recursos/cubitoprint.png',
        available: true,
        stock: 12,
        description: 'Pinza clásica con print'
      },
      {
        id: 'prod-22',
        name: 'Cubito Tierno',
        category: 'pinzasclasicas',
        price: 7000,
        color: 'Crema',
        size: 'Grande',
        image: 'recursos/cubitotierno.png',
        available: true,
        stock: 10,
        description: 'Pinza clásica en crema'
      },
      {
        id: 'prod-23',
        name: 'Cubitos Mini',
        category: 'pinzasclasicas',
        price: 1500,
        color: 'Marmolados en dorado',
        size: 'Pequeño',
        image: 'recursos/cubitosmini.png',
        available: true,
        stock: 20,
        description: 'Pinzas mini marmoladas'
      },
      {
        id: 'prod-24',
        name: 'Florecita Bora',
        category: 'floresmedianas',
        price: 3000,
        color: 'Todos los de la imagen',
        size: 'Mediano',
        image: 'recursos/florecitabora.png',
        available: true,
        stock: 15,
        description: 'Florecita mediana Bora'
      },
      {
        id: 'prod-25',
        name: 'Lirios',
        category: 'floresmedianas',
        price: 3000,
        color: 'Tornasol Todos',
        size: 'Mediano',
        image: 'recursos/lirios.png',
        available: true,
        stock: 18,
        description: 'Lirios en tornasol'
      },
      {
        id: 'prod-26',
        name: 'Hawaiano',
        category: 'floresmedianas',
        price: 3000,
        color: 'Todos',
        size: 'Mediano',
        image: 'recursos/hawaiano.png',
        available: true,
        stock: 16,
        description: 'Flores hawaianas medianas'
      },
      {
        id: 'prod-27',
        name: 'Translucida',
        category: 'floresmedianas',
        price: 3000,
        color: 'Lila, Naranja, Rosa, Amarillo translucidos',
        size: 'Mediano',
        image: 'recursos/translucida.png',
        available: true,
        stock: 14,
        description: 'Flores translúcidas'
      },
      {
        id: 'prod-28',
        name: 'Mini Perlada',
        category: 'floresmedianas',
        price: 3000,
        color: 'Blanco Perlado',
        size: 'Mediano',
        image: 'recursos/miniperlada.png',
        available: true,
        stock: 12,
        description: 'Flor mediana perlada'
      },
      {
        id: 'prod-29',
        name: 'Mini Rosas',
        category: 'floresmini',
        price: 1500,
        color: 'Todos los de la foto',
        size: 'Pequeño',
        image: 'recursos/minirosas.png',
        available: true,
        stock: 25,
        description: 'Rosas mini'
      },
      {
        id: 'prod-30',
        name: 'Mini Hamaica',
        category: 'floresmini',
        price: 2000,
        color: 'Todos los de la foto',
        size: 'Pequeño',
        image: 'recursos/minihamaica.png',
        available: true,
        stock: 20,
        description: 'Flores mini hamaica'
      },
      {
        id: 'prod-31',
        name: 'Mini Margarita',
        category: 'floresmini',
        price: 2000,
        color: 'Rosa y Blanco',
        size: 'Pequeño',
        image: 'recursos/minimargarita.png',
        available: true,
        stock: 22,
        description: 'Margaritas mini'
      },
      {
        id: 'prod-32',
        name: 'Mini Metal',
        category: 'floresmini',
        price: 4000,
        color: 'Dorado y Plateado',
        size: 'Pequeño',
        image: 'recursos/minimetal.png',
        available: true,
        stock: 15,
        description: 'Flores mini en metal'
      },
      {
        id: 'prod-33',
        name: 'Set Solana X3',
        category: 'sets',
        price: 10000,
        color: 'Rosa y tornasol',
        size: 'Grande y mini',
        image: 'recursos/setsolanax3.png',
        available: true,
        stock: 6,
        description: 'Set de 3 pinzas Solana'
      },
      {
        id: 'prod-34',
        name: 'Set Coral',
        category: 'sets',
        price: 8000,
        color: 'Blanco',
        size: 'Mediano y mini',
        image: 'recursos/setcoral.png',
        available: true,
        stock: 8,
        description: 'Set Coral'
      },
      {
        id: 'prod-35',
        name: 'Set Blue',
        category: 'sets',
        price: 7000,
        color: 'Azul',
        size: 'Grande y Mediano',
        image: 'recursos/setblue.png',
        available: true,
        stock: 7,
        description: 'Set Blue'
      }
    ];
  }

  saveProducts() {
    localStorage.setItem('luni_products', JSON.stringify(this.products));
  }

  addProduct(product) {
    const newProduct = {
      id: 'prod-' + Date.now(),
      ...product,
      available: product.available !== undefined ? product.available : true,
      stock: product.stock || 0
    };
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id, updates) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      this.saveProducts();
      return this.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveProducts();
  }

  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  getProductsByCategory(category) {
    if (category === 'all') return this.products;
    return this.products.filter(p => p.category === category);
  }

  checkAvailability(id, quantity = 1) {
    const product = this.getProduct(id);
    if (!product) return false;
    if (!product.available) return false;
    if (product.stock !== undefined && product.stock < quantity) return false;
    return true;
  }

  decreaseStock(id, quantity = 1) {
    const product = this.getProduct(id);
    if (product && product.stock !== undefined) {
      product.stock = Math.max(0, product.stock - quantity);
      if (product.stock === 0) {
        product.available = false;
      }
      this.saveProducts();
    }
  }
}

// Instancia global
const productManager = new ProductManager();

