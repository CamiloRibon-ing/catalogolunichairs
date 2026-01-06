// Sistema de generación de facturas
class InvoiceGenerator {
  generateInvoiceHTML(order) {
    const date = new Date(order.createdAt);
    const formattedDate = date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${order.orderNumber} - Luni Hair Clips</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #fff8f9;
      padding: 20px;
      color: #333;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #e06c9f 0%, #ff84b6 100%);
      padding: 30px;
      color: white;
      text-align: center;
    }
    .invoice-header h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    .invoice-header p {
      font-size: 1rem;
      opacity: 0.9;
    }
    .invoice-body {
      padding: 30px;
    }
    .invoice-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e06c9f;
    }
    .info-section h3 {
      color: #e06c9f;
      margin-bottom: 15px;
      font-size: 1.1rem;
    }
    .info-section p {
      margin: 5px 0;
      color: #666;
    }
    .order-number {
      background: #fff5f8;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 20px;
    }
    .order-number h2 {
      color: #e06c9f;
      font-size: 1.5rem;
    }
    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .products-table thead {
      background: #e06c9f;
      color: white;
    }
    .products-table th,
    .products-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .products-table th {
      font-weight: 600;
    }
    .products-table tbody tr:hover {
      background: #fff5f8;
    }
    .total-section {
      background: #fff5f8;
      padding: 20px;
      border-radius: 10px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 1.1rem;
    }
    .total-final {
      font-size: 1.5rem;
      font-weight: bold;
      color: #e06c9f;
      border-top: 2px solid #e06c9f;
      padding-top: 10px;
      margin-top: 10px;
    }
    .invoice-footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 0.9rem;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .status-pendiente { background: #fff3cd; color: #856404; }
    .status-confirmado { background: #d1ecf1; color: #0c5460; }
    .status-en_preparacion { background: #d4edda; color: #155724; }
    .status-enviado { background: #cce5ff; color: #004085; }
    .status-entregado { background: #d4edda; color: #155724; }
    .status-cancelado { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <h1>🌸 Luni Hair Clips 🌸</h1>
      <p>Factura de Compra</p>
    </div>
    <div class="invoice-body">
      <div class="order-number">
        <h2>📋 ${order.orderNumber}</h2>
        <p>Fecha: ${formattedDate}</p>
        <span class="status-badge status-${order.status}">${this.getStatusLabel(order.status)}</span>
      </div>
      
      <div class="invoice-info">
        <div class="info-section">
          <h3>💝 Información del Cliente</h3>
          <p><strong>Nombre:</strong> ${order.customerInfo.name}</p>
          <p><strong>Teléfono:</strong> ${order.customerInfo.phone}</p>
          ${order.customerInfo.email ? `<p><strong>Email:</strong> ${order.customerInfo.email}</p>` : ''}
        </div>
        <div class="info-section">
          <h3>📍 Dirección de Envío</h3>
          <p>${order.customerInfo.address}</p>
          <p>${order.customerInfo.city}</p>
        </div>
      </div>

      <h3 style="color: #e06c9f; margin: 20px 0 10px 0;">🛍️ Productos</h3>
      <table class="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>
                <strong>${item.productName}</strong>
                ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
                ${item.size ? `<br><small>Tamaño: ${item.size}</small>` : ''}
              </td>
              <td>${item.quantity}</td>
              <td>$${item.price.toLocaleString('es-CO')}</td>
              <td>$${item.subtotal.toLocaleString('es-CO')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${order.subtotal.toLocaleString('es-CO')}</span>
        </div>
        ${order.discount > 0 ? `
        <div class="total-row">
          <span>Descuento:</span>
          <span>-$${order.discount.toLocaleString('es-CO')}</span>
        </div>
        ` : ''}
        ${order.shipping > 0 ? `
        <div class="total-row">
          <span>Envío:</span>
          <span>$${order.shipping.toLocaleString('es-CO')}</span>
        </div>
        ` : ''}
        <div class="total-row total-final">
          <span>Total:</span>
          <span>$${order.total.toLocaleString('es-CO')}</span>
        </div>
      </div>
    </div>
    <div class="invoice-footer">
      <p>✨ Gracias por tu compra ✨</p>
      <p>Luni Hair Clips - Accesorios únicos para tu cabello</p>
      <p>WhatsApp: 304 495 2240 | Instagram: @luni_hairclips</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  generateInvoiceText(order) {
    const date = new Date(order.createdAt);
    const formattedDate = date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let text = `🌸 *FACTURA - LUNI HAIR CLIPS* 🌸\n\n`;
    text += `📋 *Número de Pedido:* ${order.orderNumber}\n`;
    text += `📅 *Fecha:* ${formattedDate}\n`;
    text += `📊 *Estado:* ${this.getStatusLabel(order.status)}\n\n`;
    
    text += `💝 *INFORMACIÓN DEL CLIENTE*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Nombre: ${order.customerInfo.name}\n`;
    text += `Teléfono: ${order.customerInfo.phone}\n`;
    if (order.customerInfo.email) {
      text += `Email: ${order.customerInfo.email}\n`;
    }
    text += `Dirección: ${order.customerInfo.address}\n`;
    text += `Ciudad: ${order.customerInfo.city}\n\n`;

    text += `🛍️ *PRODUCTOS*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    order.items.forEach((item, index) => {
      text += `${index + 1}. *${item.productName}*\n`;
      if (item.color) text += `   💗 Color: ${item.color}\n`;
      if (item.size) text += `   📏 Tamaño: ${item.size}\n`;
      text += `   🔢 Cantidad: ${item.quantity}\n`;
      text += `   💰 Precio: $${item.price.toLocaleString('es-CO')}\n`;
      text += `   💵 Subtotal: $${item.subtotal.toLocaleString('es-CO')}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *RESUMEN*\n`;
    text += `Subtotal: $${order.subtotal.toLocaleString('es-CO')}\n`;
    if (order.discount > 0) {
      text += `Descuento: -$${order.discount.toLocaleString('es-CO')}\n`;
    }
    if (order.shipping > 0) {
      text += `Envío: $${order.shipping.toLocaleString('es-CO')}\n`;
    }
    text += `\n💎 *TOTAL: $${order.total.toLocaleString('es-CO')}*\n\n`;
    text += `✨ Gracias por tu compra ✨\n`;
    text += `Luni Hair Clips - Accesorios únicos para tu cabello\n`;
    text += `WhatsApp: 304 495 2240\n`;
    text += `Instagram: @luni_hairclips`;

    return text;
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

  async sendInvoiceByWhatsApp(order) {
    const invoiceText = this.generateInvoiceText(order);
    const phoneNumber = order.customerInfo.phone;
    const encodedMessage = encodeURIComponent(invoiceText);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    return whatsappUrl;
  }

  async sendInvoiceByEmail(order) {
    // En producción, esto se haría desde el backend
    // Por ahora, generamos el HTML que se puede enviar
    const invoiceHTML = this.generateInvoiceHTML(order);
    return invoiceHTML;
  }
}

// Instancia global
const invoiceGenerator = new InvoiceGenerator();

