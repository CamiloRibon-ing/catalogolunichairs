-- ============================================
-- Base de Datos para Luni Hair Clips
-- Sistema de Catálogo y E-commerce
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS luni_hairclips CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE luni_hairclips;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    rol ENUM('admin', 'vendedor', 'cliente') DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso DATETIME,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icono VARCHAR(10),
    descripcion TEXT,
    imagen_url VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    precio_anterior DECIMAL(10, 2),
    color VARCHAR(100),
    tamano ENUM('Pequeño', 'Mediano', 'Grande'),
    imagen_url VARCHAR(500),
    imagen_cloudinary_id VARCHAR(255),
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    disponible BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    mas_vendido BOOLEAN DEFAULT FALSE,
    tags JSON,
    metadata JSON,
    vistas INT DEFAULT 0,
    ventas INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    INDEX idx_categoria (categoria_id),
    INDEX idx_slug (slug),
    INDEX idx_disponible (disponible),
    INDEX idx_destacado (destacado),
    INDEX idx_precio (precio),
    FULLTEXT idx_busqueda (nombre, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    direccion TEXT,
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    codigo_postal VARCHAR(20),
    notas TEXT,
    total_compras DECIMAL(10, 2) DEFAULT 0,
    numero_pedidos INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_telefono (telefono),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT,
    nombre_cliente VARCHAR(200) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    email_cliente VARCHAR(100),
    direccion_envio TEXT NOT NULL,
    ciudad_envio VARCHAR(100) NOT NULL,
    estado ENUM('pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    metodo_pago ENUM('nequi', 'bancolombia', 'efectivo', 'otro'),
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    envio DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    notas TEXT,
    enviado_whatsapp BOOLEAN DEFAULT FALSE,
    fecha_whatsapp DATETIME,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    INDEX idx_numero_pedido (numero_pedido),
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado (estado),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: items_pedido
-- ============================================
CREATE TABLE IF NOT EXISTS items_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL,
    color VARCHAR(100),
    tamano VARCHAR(50),
    subtotal DECIMAL(10, 2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_pedido (pedido_id),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: carrito_temporal
-- ============================================
CREATE TABLE IF NOT EXISTS carrito_temporal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id VARCHAR(100) NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    color VARCHAR(100),
    tamano VARCHAR(50),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_sesion (sesion_id),
    INDEX idx_producto (producto_id),
    UNIQUE KEY unique_item (sesion_id, producto_id, color, tamano)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: configuracion
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50),
    descripcion TEXT,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Usuario administrador por defecto
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO usuarios (username, password_hash, nombre, email, rol) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@luni.com', 'admin')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Categorías iniciales
INSERT INTO categorias (nombre, slug, icono, descripcion, activa, orden) VALUES
('Ganchitos', 'ganchitos', '🎀', 'Ganchitos elegantes para el cabello', TRUE, 1),
('Fruticas', 'fruticas', '🍓', 'Pinzas con diseño de frutas', TRUE, 2),
('Animalitos', 'animalitos', '🐱', 'Accesorios con diseño de animales', TRUE, 3),
('Naturales', 'naturales', '🌿', 'Diseños inspirados en la naturaleza', TRUE, 4),
('Pinzas Clasicas', 'pinzasclasicas', '📎', 'Pinzas clásicas y elegantes', TRUE, 5),
('Flores Medianas', 'floresmedianas', '🌸', 'Flores de tamaño mediano', TRUE, 6),
('Flores Mini', 'floresmini', '🌺', 'Flores pequeñas y delicadas', TRUE, 7),
('Sets', 'sets', '🎁', 'Sets de accesorios combinados', TRUE, 8)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
('whatsapp_numero', '573044952240', 'text', 'Número de WhatsApp para pedidos'),
('whatsapp_mensaje_plantilla', '🛍️ *NUEVO PEDIDO - LUNI HAIR CLIPS*', 'text', 'Plantilla de mensaje para WhatsApp'),
('nequi_numero', '3044952240', 'text', 'Número de Nequi para pagos'),
('email_contacto', 'contacto@luni.com', 'text', 'Email de contacto'),
('envio_gratis_desde', '50000', 'number', 'Monto mínimo para envío gratis'),
('tiempo_entrega', '3-5 días hábiles', 'text', 'Tiempo estimado de entrega')
ON DUPLICATE KEY UPDATE valor=valor;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Productos con información de categoría
CREATE OR REPLACE VIEW vista_productos_completos AS
SELECT 
    p.id,
    p.nombre,
    p.slug,
    p.descripcion,
    p.precio,
    p.color,
    p.tamano,
    p.imagen_url,
    p.stock,
    p.disponible,
    p.destacado,
    p.mas_vendido,
    c.nombre AS categoria_nombre,
    c.slug AS categoria_slug,
    c.icono AS categoria_icono,
    p.creado_en,
    p.actualizado_en
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id
WHERE c.activa = TRUE;

-- Vista: Resumen de pedidos
CREATE OR REPLACE VIEW vista_resumen_pedidos AS
SELECT 
    p.id,
    p.numero_pedido,
    p.nombre_cliente,
    p.telefono_cliente,
    p.estado,
    p.total,
    COUNT(ip.id) AS cantidad_items,
    p.creado_en
FROM pedidos p
LEFT JOIN items_pedido ip ON p.id = ip.pedido_id
GROUP BY p.id;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

DELIMITER //

-- Procedimiento: Crear pedido desde carrito
CREATE PROCEDURE IF NOT EXISTS crear_pedido_desde_carrito(
    IN p_sesion_id VARCHAR(100),
    IN p_nombre_cliente VARCHAR(200),
    IN p_telefono_cliente VARCHAR(20),
    IN p_email_cliente VARCHAR(100),
    IN p_direccion TEXT,
    IN p_ciudad VARCHAR(100),
    OUT p_numero_pedido VARCHAR(20)
)
BEGIN
    DECLARE v_total DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_pedido_id INT;
    DECLARE v_numero VARCHAR(20);
    
    -- Calcular total del carrito
    SELECT COALESCE(SUM(pr.precio * ct.cantidad), 0) INTO v_total
    FROM carrito_temporal ct
    INNER JOIN productos pr ON ct.producto_id = pr.id
    WHERE ct.sesion_id = p_sesion_id;
    
    -- Generar número de pedido
    SET v_numero = CONCAT('ORD-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
    
    -- Crear pedido
    INSERT INTO pedidos (
        numero_pedido, nombre_cliente, telefono_cliente, email_cliente,
        direccion_envio, ciudad_envio, subtotal, total, estado
    ) VALUES (
        v_numero, p_nombre_cliente, p_telefono_cliente, p_email_cliente,
        p_direccion, p_ciudad, v_total, v_total, 'pendiente'
    );
    
    SET v_pedido_id = LAST_INSERT_ID();
    SET p_numero_pedido = v_numero;
    
    -- Mover items del carrito al pedido
    INSERT INTO items_pedido (pedido_id, producto_id, nombre_producto, precio_unitario, cantidad, color, tamano, subtotal)
    SELECT 
        v_pedido_id,
        pr.id,
        pr.nombre,
        pr.precio,
        ct.cantidad,
        ct.color,
        ct.tamano,
        pr.precio * ct.cantidad
    FROM carrito_temporal ct
    INNER JOIN productos pr ON ct.producto_id = pr.id
    WHERE ct.sesion_id = p_sesion_id;
    
    -- Actualizar stock
    UPDATE productos pr
    INNER JOIN carrito_temporal ct ON pr.id = ct.producto_id
    SET pr.stock = pr.stock - ct.cantidad
    WHERE ct.sesion_id = p_sesion_id;
    
    -- Limpiar carrito
    DELETE FROM carrito_temporal WHERE sesion_id = p_sesion_id;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger: Actualizar stock cuando se crea un item de pedido
CREATE TRIGGER IF NOT EXISTS actualizar_stock_after_pedido
AFTER INSERT ON items_pedido
FOR EACH ROW
BEGIN
    UPDATE productos
    SET stock = stock - NEW.cantidad,
        ventas = ventas + NEW.cantidad
    WHERE id = NEW.producto_id;
END //

-- Trigger: Generar slug automático para productos
CREATE TRIGGER IF NOT EXISTS generar_slug_producto
BEFORE INSERT ON productos
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.nombre, ' ', '-'), 'á', 'a'), 'é', 'e'));
    END IF;
END //

DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_productos_categoria_disponible ON productos(categoria_id, disponible);
CREATE INDEX idx_pedidos_estado_fecha ON pedidos(estado, creado_en);
CREATE INDEX idx_items_pedido_producto ON items_pedido(producto_id, pedido_id);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

