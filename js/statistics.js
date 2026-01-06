// Sistema de estadísticas y análisis de ventas
class StatisticsManager {
  constructor() {
    this.charts = {};
  }

  // Obtener estadísticas generales
  getGeneralStats() {
    const orders = orderManager.getAllOrders();
    const confirmedOrders = orders.filter(o => o.status === 'confirmado' || o.status === 'entregado');
    
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = confirmedOrders.length;
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrder,
      pendingOrders: orders.filter(o => o.status === 'pendiente').length,
      completedOrders: orders.filter(o => o.status === 'entregado').length
    };
  }

  // Productos más vendidos
  getTopProducts(limit = 10) {
    const orders = orderManager.getAllOrders();
    const confirmedOrders = orders.filter(o => 
      o.status === 'confirmado' || o.status === 'en_preparacion' || 
      o.status === 'enviado' || o.status === 'entregado'
    );

    const productSales = {};

    confirmedOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId;
        if (!productSales[key]) {
          productSales[key] = {
            productId: item.productId,
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.subtotal;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  // Ventas por período
  getSalesByPeriod(period = 'day') {
    const orders = orderManager.getAllOrders();
    const confirmedOrders = orders.filter(o => 
      o.status === 'confirmado' || o.status === 'en_preparacion' || 
      o.status === 'enviado' || o.status === 'entregado'
    );

    const sales = {};

    confirmedOrders.forEach(order => {
      const date = new Date(order.createdAt);
      let key;

      if (period === 'day') {
        key = date.toLocaleDateString('es-CO');
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `Semana ${weekStart.toLocaleDateString('es-CO')}`;
      } else if (period === 'month') {
        key = date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });
      }

      if (!sales[key]) {
        sales[key] = { date: key, count: 0, revenue: 0 };
      }
      sales[key].count += 1;
      sales[key].revenue += order.total;
    });

    return Object.values(sales).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  }

  // Productos con poco stock
  getLowStockProducts(threshold = 5) {
    return productManager.products
      .filter(p => p.stock <= threshold && p.available)
      .sort((a, b) => a.stock - b.stock);
  }

  // Ventas por estado
  getSalesByStatus() {
    const orders = orderManager.getAllOrders();
    const statusCount = {
      pendiente: 0,
      confirmado: 0,
      en_preparacion: 0,
      enviado: 0,
      entregado: 0,
      cancelado: 0
    };

    orders.forEach(order => {
      if (statusCount.hasOwnProperty(order.status)) {
        statusCount[order.status]++;
      }
    });

    return statusCount;
  }

  // Renderizar gráfica de productos más vendidos
  renderTopProductsChart(canvasId) {
    const topProducts = this.getTopProducts(5);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.name),
        datasets: [{
          label: 'Cantidad Vendida',
          data: topProducts.map(p => p.quantity),
          backgroundColor: '#e06c9f',
          borderColor: '#d15a8a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Top 5 Productos Más Vendidos',
            font: {
              size: 16,
              weight: 'bold'
            }
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

  // Renderizar gráfica de ventas por período
  renderSalesByPeriodChart(canvasId, period = 'day') {
    const sales = this.getSalesByPeriod(period);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sales.map(s => s.date),
        datasets: [{
          label: 'Ventas',
          data: sales.map(s => s.revenue),
          borderColor: '#e06c9f',
          backgroundColor: 'rgba(224, 108, 159, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Ventas por ${period === 'day' ? 'Día' : period === 'week' ? 'Semana' : 'Mes'}`,
            font: {
              size: 16,
              weight: 'bold'
            }
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

  // Renderizar gráfica de pastel por estado
  renderStatusPieChart(canvasId) {
    const statusData = this.getSalesByStatus();
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const labels = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      en_preparacion: 'En Preparación',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };

    const colors = {
      pendiente: '#ffc107',
      confirmado: '#17a2b8',
      en_preparacion: '#28a745',
      enviado: '#007bff',
      entregado: '#20c997',
      cancelado: '#dc3545'
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusData).map(key => labels[key]),
        datasets: [{
          data: Object.values(statusData),
          backgroundColor: Object.keys(statusData).map(key => colors[key]),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Pedidos por Estado',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    });
  }

  // Renderizar todas las gráficas
  renderAllCharts() {
    this.renderTopProductsChart('top-products-chart');
    this.renderSalesByPeriodChart('sales-day-chart', 'day');
    this.renderSalesByPeriodChart('sales-week-chart', 'week');
    this.renderSalesByPeriodChart('sales-month-chart', 'month');
    this.renderStatusPieChart('status-pie-chart');
  }

  // Destruir todas las gráficas
  destroyAllCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Instancia global
const statisticsManager = new StatisticsManager();

