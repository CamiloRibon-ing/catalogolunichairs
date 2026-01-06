# 🎀 Instrucciones de Uso - Luni Hair Clips

## 📋 Características Implementadas

### ✅ Panel de Administración
- Gestión completa de productos
- Subida de imágenes, precios, categorías, colores y tamaños
- Control de stock y disponibilidad

### ✅ Carrito de Compras
- Agregar productos al carrito
- Modificar cantidades
- Ver total de la compra

### ✅ Validaciones
- Verificación de disponibilidad de productos
- Control de stock en tiempo real
- Validación de formularios

### ✅ Checkout y WhatsApp
- Formulario de información del cliente
- Envío automático de pedidos por WhatsApp
- Información completa del pedido

---

## 🔐 Acceso al Panel de Administración

Para acceder al panel de administración:

1. **Presiona las teclas:** `Ctrl + Shift + A` simultáneamente
2. **Ingresa la contraseña:** `luni2024` (puedes cambiarla en `js/admin.js`)
3. **Aparecerá un botón de engranaje** en la parte inferior derecha de la pantalla
4. **Haz clic en el botón** para abrir el panel de administración

> ⚠️ **Importante:** En producción, cambia la contraseña por una más segura.

---

## 📦 Gestión de Productos

### Agregar un Nuevo Producto

1. Accede al panel de administración
2. Haz clic en la pestaña **"Agregar Producto"**
3. Haz clic en **"+ Agregar Nuevo Producto"**
4. Completa el formulario:
   - **Nombre del Producto** (requerido)
   - **Categoría** (requerido)
   - **Precio** (requerido)
   - **Color** (opcional)
   - **Tamaño** (opcional)
   - **Stock Disponible** (número de unidades)
   - **Producto Disponible** (checkbox)
   - **URL de Imagen** (ruta relativa, ej: `recursos/nombre-imagen.png`)
   - **Descripción** (opcional)
5. Haz clic en **"Guardar Producto"**

### Editar un Producto

1. En el panel de administración, pestaña **"Productos"**
2. Haz clic en **"Editar"** en el producto que deseas modificar
3. Modifica los campos necesarios
4. Haz clic en **"Guardar Producto"**

### Eliminar un Producto

1. En el panel de administración, pestaña **"Productos"**
2. Haz clic en **"Eliminar"** en el producto que deseas eliminar
3. Confirma la eliminación

---

## 🛒 Uso del Carrito de Comras

### Agregar Productos al Carrito

1. Navega por el catálogo
2. Haz clic en **"Agregar al Carrito"** en el producto deseado
3. Si el producto tiene opciones (color/tamaño), se abrirá un modal para seleccionarlas
4. El contador del carrito se actualizará automáticamente

### Ver el Carrito

1. Haz clic en el **botón flotante del carrito** (ícono de carrito en la parte inferior derecha)
2. Verás todos los productos agregados
3. Puedes modificar cantidades o eliminar productos

### Proceder al Checkout

1. Abre el carrito
2. Verifica que todos los productos sean correctos
3. Haz clic en **"Proceder al Checkout"**

---

## 📝 Proceso de Checkout

### Completar Información del Cliente

1. Se abrirá un formulario con los siguientes campos:
   - **Nombre Completo** (requerido)
   - **Teléfono** (requerido, mínimo 10 dígitos)
   - **Email** (opcional)
   - **Dirección** (requerido)
   - **Ciudad** (requerido)

2. Completa todos los campos requeridos
3. Haz clic en **"Enviar Pedido por WhatsApp"**

### Envío por WhatsApp

1. Se abrirá WhatsApp automáticamente con un mensaje pre-formateado que incluye:
   - Número de pedido
   - Información del cliente
   - Lista completa de productos con cantidades y precios
   - Total del pedido

2. El stock se actualizará automáticamente
3. El carrito se limpiará

---

## 🔧 Configuración Técnica

### Cambiar Número de WhatsApp

Para cambiar el número de WhatsApp donde se envían los pedidos:

1. Abre el archivo `js/checkout.js`
2. Busca la línea: `const phoneNumber = '573044952240';`
3. Reemplaza con tu número (formato internacional sin +)

### Cambiar Contraseña de Admin

1. Abre el archivo `js/admin.js`
2. Busca la línea: `if (password === 'luni2024')`
3. Reemplaza `'luni2024'` con tu contraseña deseada

### Almacenamiento de Datos

- Los productos se almacenan en `localStorage` del navegador
- El carrito también se guarda en `localStorage`
- Los datos persisten entre sesiones

---

## 🎨 Personalización

### Categorías Disponibles

- Ganchitos
- Fruticas
- Animalitos
- Naturales
- Pinzas Clasicas
- Flores Medianas
- Flores Mini
- Sets

### Tamaños Disponibles

- Pequeño
- Mediano
- Grande

---

## 📱 Características Responsive

El sitio está completamente optimizado para:
- 📱 Dispositivos móviles
- 💻 Tablets
- 🖥️ Escritorio

---

## ⚠️ Notas Importantes

1. **Imágenes:** Asegúrate de que las imágenes estén en la carpeta `recursos/` y usa rutas relativas
2. **Stock:** El sistema valida automáticamente el stock antes de permitir agregar productos al carrito
3. **Disponibilidad:** Los productos marcados como "no disponibles" no aparecerán en el catálogo público
4. **Backup:** Considera hacer respaldos periódicos del `localStorage` si tienes muchos productos

---

## 🆘 Solución de Problemas

### El panel de administración no aparece
- Verifica que hayas presionado `Ctrl + Shift + A`
- Asegúrate de haber ingresado la contraseña correcta
- Recarga la página e intenta nuevamente

### Los productos no se muestran
- Verifica que los productos estén marcados como "disponibles"
- Asegúrate de que tengan stock mayor a 0
- Revisa la consola del navegador para errores

### El carrito no funciona
- Limpia el `localStorage` del navegador
- Recarga la página
- Verifica que los scripts estén cargando correctamente

---

## 📞 Soporte

Para más información o ayuda, contacta a través de:
- WhatsApp: 304 495 2240
- Instagram: @luni_hairclips

---

✨ **¡Disfruta gestionando tu catálogo de Luni Hair Clips!** ✨

