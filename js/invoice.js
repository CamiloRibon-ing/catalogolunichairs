// Sistema de generación de facturas
class InvoiceGenerator {
    constructor() {
        // console.log('📋 Inicializando InvoiceGenerator...');
        this.isReady = false;
        this.initializeWhenReady();
    }

    async initializeWhenReady() {
        // Esperar hasta que jsPDF esté disponible
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        while (attempts < maxAttempts) {
            if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
                this.isReady = true;
                // console.log('✅ InvoiceGenerator listo - jsPDF disponible');
                return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.error('❌ jsPDF no se cargó después de 5 segundos');
        // console.error('❌ jsPDF no se cargó después de 5 segundos');
    }

    // Esperar a que jsPDF esté disponible
    async waitForJsPDF() {
        if (!this.isReady) {
            await this.initializeWhenReady();
        }
        
        console.log('🔍 Verificando disponibilidad de jsPDF...');
            // console.log('🔍 Verificando disponibilidad de jsPDF...');
        console.log('   - window.jspdf:', typeof window.jspdf);
            // console.log('   - window.jspdf:', typeof window.jspdf);
        console.log('   - window.jspdf.jsPDF:', typeof window.jspdf?.jsPDF);
            // console.log('   - window.jspdf.jsPDF:', typeof window.jspdf?.jsPDF);
        
        if (!window.jspdf || !window.jspdf.jsPDF) {
            // console.error('❌ jsPDF no está disponible');
            // console.error('   - window.jspdf:', window.jspdf);
            throw new Error('jsPDF no está disponible. Verifique que la librería esté cargada correctamente.');
        }
        
        console.log('✅ jsPDF verificado y disponible');
        // console.log('✅ jsPDF verificado y disponible');
    }

    // Generar PDF de la factura
    async generatePDFInvoice(order) {
        try {
            await this.waitForJsPDF();
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Colores y configuración
            const primaryColor = [224, 108, 159]; // Rosa de Luni
            const secondaryColor = [240, 240, 240]; // Gris claro
            const textDarkColor = [33, 33, 33]; // Gris oscuro
            
            // ===== ENCABEZADO =====
            // Fondo del encabezado
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 45, 'F');
            
            // Logo y título
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Luni Hair Clips', 105, 20, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('Factura de Compra', 105, 30, { align: 'center' });
            
            // Información de contacto en el encabezado
            doc.setFontSize(9);
            doc.text('WhatsApp: +57 300 123 4567', 105, 38, { align: 'center' });
            
            // ===== INFORMACIÓN DE LA FACTURA =====
            doc.setTextColor(...textDarkColor);
            let yPos = 55;
            
            // Número de orden y fecha
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            const orderNumber = order.orderNumber || order.order_number || order.id;
            const createdAt = order.createdAt || order.created_at || order.date || new Date();
            
            doc.text(`Factura N°: ${orderNumber}`, 20, yPos);
            doc.text(`Fecha: ${new Date(createdAt).toLocaleDateString('es-CO')}`, 140, yPos);
            yPos += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Estado: ${this.getStatusLabel(order.status)}`, 20, yPos);
            yPos += 15;
            
            // ===== INFORMACIÓN DEL CLIENTE =====
            // Caja para información del cliente
            doc.setFillColor(...secondaryColor);
            doc.rect(20, yPos - 5, 170, 35, 'F');
            doc.setDrawColor(...primaryColor);
            doc.rect(20, yPos - 5, 170, 35, 'S');
            
            const customerInfo = order.customerInfo || order.customer_info || {};
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('INFORMACIÓN DEL CLIENTE', 25, yPos + 5);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            yPos += 12;
            
            doc.text(`Cliente: ${customerInfo.name || 'No especificado'}`, 25, yPos);
            doc.text(`Teléfono: ${customerInfo.phone || 'No especificado'}`, 120, yPos);
            yPos += 6;
            
            if (customerInfo.email) {
                doc.text(`Email: ${customerInfo.email}`, 25, yPos);
                yPos += 6;
            }
            
            doc.text(`Dirección: ${customerInfo.address || 'No especificada'}`, 25, yPos);
            yPos += 6;
            doc.text(`Ciudad: ${customerInfo.city || 'Colombia'}`, 25, yPos);
            
            yPos += 20;
            
            // ===== TABLA DE PRODUCTOS =====
            // Encabezado de la tabla
            doc.setFillColor(...primaryColor);
            doc.rect(20, yPos, 170, 10, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('PRODUCTO', 25, yPos + 7);
            doc.text('CANT.', 125, yPos + 7, { align: 'center' });
            doc.text('PRECIO UNIT.', 165, yPos + 7, { align: 'right' });
            doc.text('TOTAL', 185, yPos + 7, { align: 'right' });
            
            yPos += 12;
            
            // Productos
            doc.setTextColor(...textDarkColor);
            doc.setFont('helvetica', 'normal');
            let total = 0;
            let rowIndex = 0;
            
            order.items.forEach(item => {
                const itemTotal = item.quantity * item.price;
                total += itemTotal;
                
                // Fondo alternado para las filas
                if (rowIndex % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(20, yPos - 3, 170, 8, 'F');
                }
                
                // Texto del producto
                const productName = item.name || 
                                   item.productName || 
                                   item.title || 
                                   item.product_name || 
                                   item.productTitle || 
                                   item.itemName ||
                                   item.description ||
                                   'Producto sin nombre';
                const productText = `${productName}${item.variant ? ` - ${item.variant}` : ''}`;
                const maxProductWidth = 90;
                const wrappedProduct = doc.splitTextToSize(productText, maxProductWidth);
                
                doc.text(wrappedProduct, 25, yPos + 2);
                doc.text(item.quantity.toString(), 125, yPos + 2, { align: 'center' });
                doc.text(`$${item.price.toLocaleString()}`, 165, yPos + 2, { align: 'right' });
                doc.text(`$${itemTotal.toLocaleString()}`, 185, yPos + 2, { align: 'right' });
                
                const lineHeight = Math.max(6, wrappedProduct.length * 4);
                yPos += lineHeight;
                rowIndex++;
                
                // Verificar si necesitamos nueva página
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 30;
                }
            });
            
            // Línea separadora antes del total
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(1);
            doc.line(20, yPos + 2, 190, yPos + 2);
            yPos += 8;
            
            // ===== TOTAL =====
            doc.setFillColor(...primaryColor);
            doc.rect(120, yPos, 70, 12, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL:', 125, yPos + 8);
            doc.text(`$${total.toLocaleString()}`, 185, yPos + 8, { align: 'right' });
            
            yPos += 20;
            
            // ===== INFORMACIÓN ADICIONAL =====
            doc.setTextColor(...textDarkColor);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            if (order.paymentMethod) {
                doc.text(`Método de pago: ${order.paymentMethod}`, 20, yPos);
                yPos += 6;
            }
            
            if (order.notes) {
                yPos += 5;
                doc.setFont('helvetica', 'bold');
                doc.text('Notas:', 20, yPos);
                yPos += 5;
                doc.setFont('helvetica', 'normal');
                const notesText = doc.splitTextToSize(order.notes, 170);
                doc.text(notesText, 20, yPos);
                yPos += notesText.length * 4;
            }
            
            // ===== PIE DE PÁGINA =====
            yPos = 280;
            
            // Línea decorativa
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.line(20, yPos - 10, 190, yPos - 10);
            
            // Agradecimiento y contacto
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('¡Gracias por elegir Luni Hair Clips!', 105, yPos, { align: 'center' });
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Síguenos en Instagram: @lunihairclips', 105, yPos + 5, { align: 'center' });
            
            return doc;
            
        } catch (error) {
            // console.error('❌ Error generando PDF de factura:', error);
            throw error;
        }
    }

    // Obtener etiqueta del estado
    getStatusLabel(status) {
        const statusLabels = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_preparacion': 'En Preparación',
            'enviado': 'Enviado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return statusLabels[status] || status;
    }

    // Descargar PDF de factura
    async downloadPDFInvoice(order) {
        try {
            // console.log('📥 Iniciando descarga de PDF de factura...');
            // console.log('📋 Datos de orden recibidos:', order);
            
            const doc = await this.generatePDFInvoice(order);
            if (!doc) {
                throw new Error('No se pudo generar el documento PDF');
            }
            
            const orderNumber = order.orderNumber || order.order_number || order.id || 'SIN-NUMERO';
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const filename = `Factura-Luni-${orderNumber}-${timestamp}.pdf`;
            
            // console.log('💾 Guardando archivo:', filename);
            
            // Intentar guardar el archivo
            try {
                doc.save(filename);
                // console.log('✅ PDF de factura guardado exitosamente:', filename);
                
                // Verificación adicional - intentar mostrar una alerta después de un momento
                setTimeout(() => {
                    // console.log('🔍 Verificando descarga...');
                    // console.log('📁 El archivo debería aparecer en la carpeta de Descargas como:', filename);
                }, 500);
                
                return filename;
            } catch (saveError) {
                // console.error('❌ Error específico al guardar:', saveError);
                throw new Error(`Error al guardar PDF: ${saveError.message}`);
            }
            
        } catch (error) {
            // console.error('❌ Error descargando PDF de factura:', error);
            // console.error('🔍 Stack trace:', error.stack);
            throw error;
        }
    }

    // Enviar factura por WhatsApp
    async sendInvoiceByWhatsApp(order) {
        try {
            // console.log('📱 Preparando envío por WhatsApp...');
            
            const customerInfo = order.customerInfo || order.customer_info;
            const orderNumber = order.orderNumber || order.order_number;
            
            // Calcular total
            let total = 0;
            order.items.forEach(item => {
                total += item.quantity * item.price;
            });
            
            // Generar mensaje
            let message = `*Luni Hair Clips*%0A%0A`;
            message += `📋 *Factura N°:* ${orderNumber}%0A`;
            message += `📅 *Fecha:* ${new Date(order.createdAt || order.created_at).toLocaleDateString('es-CO')}%0A`;
            message += `👤 *Cliente:* ${customerInfo.name}%0A%0A`;
            
            message += `🛍️ *Productos pedidos:*%0A`;
            order.items.forEach(item => {
                const itemTotal = item.quantity * item.price;
                const productName = item.name || 
                                   item.productName || 
                                   item.title || 
                                   item.product_name || 
                                   item.productTitle || 
                                   item.itemName ||
                                   item.description ||
                                   'Producto sin nombre';
                message += `• ${productName}${item.variant ? ` - ${item.variant}` : ''}%0A`;
                message += `  Cantidad: ${item.quantity} - Precio: $${item.price.toLocaleString()} = $${itemTotal.toLocaleString()}%0A`;
            });
            
            message += `%0A💰 *TOTAL: $${total.toLocaleString()}*%0A%0A`;
            message += `📍 *Dirección de entrega:* ${customerInfo.address}, ${customerInfo.city}%0A%0A`;
            message += `¡Gracias por tu compra! 💕`;
            
            // Crear URL de WhatsApp
            const whatsappNumber = customerInfo.phone.replace(/\D/g, '');
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
            
            // Abrir WhatsApp
            window.open(whatsappURL, '_blank');
            
            console.log('✅ WhatsApp abierto con mensaje de factura');
                        // console.log('✅ WhatsApp abierto con mensaje de factura');
            return whatsappURL;
            
        } catch (error) {
            // console.error('❌ Error enviando por WhatsApp:', error);
            throw error;
        }
    }

    // Enviar PDF por WhatsApp (descargar primero)
    async sendPDFByWhatsApp(order) {
        try {
            // Primero descargar el PDF
            await this.downloadPDFInvoice(order);
            
            // Luego enviar mensaje explicativo por WhatsApp
            const customerInfo = order.customerInfo || order.customer_info;
            let message = `*Luni Hair Clips*%0A%0A`;
            message += `Hola ${customerInfo.name}! 😊%0A%0A`;
            message += `Tu factura PDF ha sido generada exitosamente 📄%0A`;
            message += `La descarga comenzará automáticamente.%0A%0A`;
            message += `Si tienes alguna pregunta sobre tu pedido, ¡no dudes en contactarnos! 💕`;
            
            const whatsappNumber = customerInfo.phone.replace(/\D/g, '');
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
            
            // Abrir WhatsApp después de un momento para que se descargue el PDF
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 1000);
            
            return whatsappURL;
            
        } catch (error) {
            console.error('❌ Error enviando PDF por WhatsApp:', error);
            throw error;
        }
    }
}

// Inicialización global con manejo de errores robusto
function initializeInvoiceGeneratorSafely() {
    try {
        if (typeof window.invoiceGenerator === 'undefined') {
            window.invoiceGenerator = new InvoiceGenerator();
            console.log('✅ InvoiceGenerator inicializado globalmente');
        }
        return window.invoiceGenerator;
    } catch (error) {
        console.error('❌ Error inicializando InvoiceGenerator:', error);
        return null;
    }
}

// Función de inicialización que se puede llamar múltiples veces
window.initializeInvoiceGenerator = function() {
    return initializeInvoiceGeneratorSafely();
};

// Inicialización automática cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInvoiceGeneratorSafely);
} else {
    // DOM ya está listo
    initializeInvoiceGeneratorSafely();
}

// También inicializar cuando la ventana esté completamente cargada
window.addEventListener('load', initializeInvoiceGeneratorSafely);

console.log('📋 Sistema de facturación cargado - invoice.js');

