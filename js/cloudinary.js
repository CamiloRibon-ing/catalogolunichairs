// Integración con Cloudinary
class CloudinaryUploader {
  constructor() {
    this.cloudName = 'dczdtij3q';
    this.apiKey = '524963822198547';
    this.apiSecret = 'Oof6Dx6mNkHxIKMQPG2ZOR8mI7o'; // Solo para referencia, no se usa en frontend
    this.uploadPreset = 'luni_products';
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  }

  async uploadImage(file) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'luni_products');
      // No se necesita api_key para uploads unsigned con preset

      // Usar unsigned upload con preset
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.uploadUrl, true);

      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.secure_url,
            publicId: response.public_id,
            width: response.width,
            height: response.height
          });
        } else {
          reject({
            success: false,
            message: 'Error al subir la imagen'
          });
        }
      };

      xhr.onerror = function() {
        reject({
          success: false,
          message: 'Error de conexión al subir la imagen'
        });
      };

      xhr.send(formData);
    });
  }

  async uploadImageWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'luni_products');

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.secure_url,
            publicId: response.public_id
          });
        } else {
          reject({
            success: false,
            message: 'Error al subir la imagen'
          });
        }
      };

      xhr.onerror = function() {
        reject({
          success: false,
          message: 'Error de conexión'
        });
      };

      xhr.open('POST', this.uploadUrl, true);
      xhr.send(formData);
    });
  }

  validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Tipo de archivo no permitido. Use JPG, PNG o WEBP' };
    }

    if (file.size > maxSize) {
      return { valid: false, message: 'El archivo es demasiado grande. Máximo 5MB' };
    }

    return { valid: true };
  }
}

// Instancia global
const cloudinaryUploader = new CloudinaryUploader();

