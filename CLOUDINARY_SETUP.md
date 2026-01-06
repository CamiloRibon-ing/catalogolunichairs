# 📸 Configuración de Cloudinary

## Pasos para configurar Cloudinary

### 1. Crear un Upload Preset

1. Ve a tu [Dashboard de Cloudinary](https://cloudinary.com/console)
2. Navega a **Settings** → **Upload**
3. En la sección **Upload presets**, haz clic en **Add upload preset**
4. Configura el preset:
   - **Preset name:** `luni_products`
   - **Signing mode:** Selecciona **Unsigned** (para permitir subidas desde el frontend)
   - **Folder:** `luni_products` (opcional, para organizar)
   - **Upload manipulation:**
     - **Format:** `auto` (para optimización automática)
     - **Quality:** `auto:good` (para balance entre calidad y tamaño)
   - **Eager transformations:** (opcional) Puedes agregar transformaciones automáticas
5. Haz clic en **Save**

### 2. Verificar credenciales

Las credenciales ya están configuradas en `js/cloudinary.js`:
- **Cloud Name:** `dczdtij3q`
- **API Key:** `524963822198547`
- **API Secret:** `Oof6Dx6mNkHxIKMQPG2ZOR8ml7o` (solo para backend, no se usa en frontend)

### 3. Configuración de seguridad (Recomendado)

Para mayor seguridad, puedes:

1. **Restringir el preset:**
   - En la configuración del preset, puedes agregar restricciones de:
     - Tamaño máximo de archivo (5MB recomendado)
     - Formatos permitidos (jpg, png, webp)
     - Dimensiones máximas

2. **Usar signed uploads (más seguro):**
   - Requiere crear un endpoint en el backend
   - Genera firmas usando el API Secret
   - Más seguro pero requiere servidor

### 4. Probar la subida

Una vez configurado el preset `luni_products`, el sistema debería funcionar automáticamente. Al subir una imagen desde el panel de administración:

1. Se validará el archivo (tipo y tamaño)
2. Se mostrará un preview local
3. Se subirá a Cloudinary con progreso
4. Se guardará la URL en el campo de imagen

### 5. Transformaciones automáticas (Opcional)

Puedes configurar transformaciones automáticas en el preset para:
- Redimensionar imágenes
- Optimizar formato
- Aplicar efectos
- Recortar automáticamente

Ejemplo de transformación en el preset:
```
w_800,h_800,c_fill,q_auto,f_auto
```

Esto redimensiona a 800x800px, recorta centrado, optimiza calidad y formato.

---

## Solución de problemas

### Error: "Upload preset not found"
- Verifica que el preset se llame exactamente `luni_products`
- Asegúrate de que el preset esté en modo **Unsigned**

### Error: "Invalid API key"
- Verifica las credenciales en `js/cloudinary.js`
- Asegúrate de que el Cloud Name sea correcto

### Las imágenes no se suben
- Verifica la consola del navegador para errores
- Asegúrate de que el preset permita subidas unsigned
- Verifica que el tamaño del archivo no exceda los límites

---

## Notas de seguridad

⚠️ **Importante:** 
- El API Secret nunca debe estar en el código frontend
- Para producción, considera usar signed uploads con un backend
- El preset unsigned es conveniente pero menos seguro
- Limita el tamaño y formato de archivos en el preset

