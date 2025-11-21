-- ============================================
-- BASE DE DATOS: TU DESPENSA
-- Sistema de gestión de productos del hogar
-- PostgreSQL
-- ============================================

-- Eliminar tablas si existen (para recrear)
DROP TABLE IF EXISTS detalle_factura CASCADE;
DROP TABLE IF EXISTS factura CASCADE;
DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS pedido CASCADE;
DROP TABLE IF EXISTS producto_supermercado CASCADE;
DROP TABLE IF EXISTS supermercado CASCADE;
DROP TABLE IF EXISTS historial_notificaciones CASCADE;
DROP TABLE IF EXISTS lista_compras CASCADE;
DROP TABLE IF EXISTS producto_usuario CASCADE;
DROP TABLE IF EXISTS categoria_producto CASCADE;
DROP TABLE IF EXISTS metodo_pago CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- ============================================
-- TABLA: USUARIO
-- Almacena información de los usuarios registrados
-- ============================================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    CONSTRAINT chk_correo_formato CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================
-- TABLA: METODO_PAGO
-- Almacena los métodos de pago del usuario
-- ============================================
CREATE TABLE metodo_pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo_pago VARCHAR(50) NOT NULL,
    nombre_titular VARCHAR(150),
    numero_tarjeta_encriptado VARCHAR(255),
    ultimos_digitos VARCHAR(4),
    fecha_expiracion VARCHAR(7),
    es_preferido BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_pago CHECK (tipo_pago IN ('Tarjeta Crédito', 'Tarjeta Débito', 'PSE', 'Efectivo', 'Nequi', 'Daviplata'))
);

-- ============================================
-- TABLA: CATEGORIA_PRODUCTO
-- Categorías de productos (Alimentos, Limpieza, Higiene)
-- ============================================
CREATE TABLE categoria_producto (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- ============================================
-- TABLA: PRODUCTO_USUARIO
-- Productos registrados por cada usuario
-- ============================================
CREATE TABLE producto_usuario (
    id_producto_usuario SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    marca VARCHAR(100),
    unidad_medida VARCHAR(20),
    frecuencia_reposicion INTEGER NOT NULL,
    notas TEXT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria_producto(id_categoria),
    CONSTRAINT chk_frecuencia CHECK (frecuencia_reposicion > 0),
    CONSTRAINT chk_unidad_medida CHECK (unidad_medida IN ('unidades', 'kg', 'litros', 'gramos', 'ml', 'paquetes'))
);

-- ============================================
-- TABLA: HISTORIAL_NOTIFICACIONES
-- Registro de notificaciones enviadas
-- ============================================
CREATE TABLE historial_notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_producto_usuario INTEGER NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_notificacion VARCHAR(50),
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    respuesta_usuario VARCHAR(50),
    fecha_respuesta TIMESTAMP,
    FOREIGN KEY (id_producto_usuario) REFERENCES producto_usuario(id_producto_usuario) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_notif CHECK (tipo_notificacion IN ('Recordatorio', 'Producto Agotado', 'Lista Disponible'))
);

-- ============================================
-- TABLA: LISTA_COMPRAS
-- Listas de compras generadas
-- ============================================
CREATE TABLE lista_compras (
    id_lista SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_programada DATE,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    tipo_lista VARCHAR(50),
    total_productos INTEGER DEFAULT 0,
    enviada_correo BOOLEAN DEFAULT FALSE,
    fecha_envio_correo TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT chk_estado_lista CHECK (estado IN ('Pendiente', 'Descargada', 'Pedido Realizado', 'Completada', 'Cancelada')),
    CONSTRAINT chk_tipo_lista CHECK (tipo_lista IN ('Manual', 'Automatica'))
);

-- ============================================
-- TABLA: SUPERMERCADO
-- Supermercados asociados al sistema
-- ============================================
CREATE TABLE supermercado (
    id_supermercado SERIAL PRIMARY KEY,
    nombre_supermercado VARCHAR(150) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    correo VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: PRODUCTO_SUPERMERCADO
-- Catálogo de productos disponibles en supermercados
-- ============================================
CREATE TABLE producto_supermercado (
    id_producto_supermercado SERIAL PRIMARY KEY,
    id_supermercado INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    marca VARCHAR(100),
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20),
    cantidad_disponible INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_supermercado) REFERENCES supermercado(id_supermercado) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria_producto(id_categoria),
    CONSTRAINT chk_precio CHECK (precio >= 0)
);

-- ============================================
-- TABLA: PEDIDO
-- Pedidos en línea para recoger en supermercado
-- ============================================
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_lista INTEGER,
    id_supermercado INTEGER NOT NULL,
    id_metodo_pago INTEGER,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_recogida_programada TIMESTAMP,
    subtotal DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado_pedido VARCHAR(50) DEFAULT 'Pendiente',
    notas TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_lista) REFERENCES lista_compras(id_lista),
    FOREIGN KEY (id_supermercado) REFERENCES supermercado(id_supermercado),
    FOREIGN KEY (id_metodo_pago) REFERENCES metodo_pago(id_metodo_pago),
    CONSTRAINT chk_total CHECK (total >= 0),
    CONSTRAINT chk_estado_pedido CHECK (estado_pedido IN ('Pendiente', 'Pagado', 'En Preparación', 'Listo para Recoger', 'Completado', 'Cancelado'))
);

-- ============================================
-- TABLA: DETALLE_PEDIDO
-- Productos incluidos en cada pedido
-- ============================================
CREATE TABLE detalle_pedido (
    id_detalle_pedido SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_producto_supermercado INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto_supermercado) REFERENCES producto_supermercado(id_producto_supermercado),
    CONSTRAINT chk_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_precio_unitario CHECK (precio_unitario >= 0)
);

-- ============================================
-- TABLA: FACTURA
-- Facturas generadas por pedidos
-- ============================================
CREATE TABLE factura (
    id_factura SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado_factura VARCHAR(50) DEFAULT 'Generada',
    ruta_pdf VARCHAR(500),
    enviada_correo BOOLEAN DEFAULT FALSE,
    fecha_envio_correo TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    CONSTRAINT chk_total_factura CHECK (total >= 0),
    CONSTRAINT chk_estado_factura CHECK (estado_factura IN ('Generada', 'Enviada', 'Pagada', 'Anulada'))
);

-- ============================================
-- TABLA: DETALLE_FACTURA
-- Detalle de productos en la factura
-- ============================================
CREATE TABLE detalle_factura (
    id_detalle_factura SERIAL PRIMARY KEY,
    id_factura INTEGER NOT NULL,
    descripcion_producto VARCHAR(300) NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_factura) REFERENCES factura(id_factura) ON DELETE CASCADE,
    CONSTRAINT chk_cantidad_factura CHECK (cantidad > 0)
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX idx_usuario_correo ON usuario(correo);
CREATE INDEX idx_usuario_activo ON usuario(activo);
CREATE INDEX idx_producto_usuario_usuario ON producto_usuario(id_usuario);
CREATE INDEX idx_lista_usuario ON lista_compras(id_usuario);
CREATE INDEX idx_lista_estado ON lista_compras(estado);
CREATE INDEX idx_pedido_usuario ON pedido(id_usuario);
CREATE INDEX idx_pedido_estado ON pedido(estado_pedido);
CREATE INDEX idx_pedido_fecha ON pedido(fecha_pedido);
CREATE INDEX idx_notificacion_producto ON historial_notificaciones(id_producto_usuario);
CREATE INDEX idx_notificacion_fecha ON historial_notificaciones(fecha_envio);

-- ============================================
-- DATOS INICIALES: CATEGORÍAS
-- ============================================
INSERT INTO categoria_producto (nombre_categoria, descripcion) VALUES
('Alimentos', 'Productos alimenticios y bebidas'),
('Limpieza', 'Productos de aseo y limpieza del hogar'),
('Higiene Personal', 'Productos de cuidado e higiene personal'),
('Bebidas', 'Bebidas no alcohólicas'),
('Lácteos', 'Productos lácteos y derivados'),
('Carnes y Pescados', 'Proteínas animales'),
('Panadería', 'Productos de panadería y pastelería'),
('Snacks', 'Aperitivos y golosinas');

-- ============================================
-- DATOS INICIALES: SUPERMERCADOS (Ejemplo)
-- ============================================
INSERT INTO supermercado (nombre_supermercado, direccion, telefono) VALUES
('Éxito', 'Calle 100 #10-20, Bogotá', '3001234567'),
('Carulla', 'Carrera 15 #93-50, Bogotá', '3007654321'),
('Jumbo', 'Avenida 68 #75-50, Bogotá', '3009876543'),
('Olímpica', 'Calle 80 #69-70, Bogotá', '3005551234');

-- ============================================
-- DATOS INICIALES: PRODUCTOS EN SUPERMERCADOS
-- ============================================

-- Productos en ÉXITO (id_supermercado = 1)
INSERT INTO producto_supermercado (id_supermercado, id_categoria, nombre_producto, marca, descripcion, precio, unidad_medida, cantidad_disponible) VALUES
-- Alimentos
(1, 1, 'Arroz Diana', 'Diana', 'Arroz blanco de grano largo 500g', 3500.00, 'gramos', 100),
(1, 1, 'Pasta Doria', 'Doria', 'Pasta espagueti 250g', 2800.00, 'gramos', 80),
(1, 1, 'Aceite Gourmet', 'Gourmet', 'Aceite de girasol 1L', 12500.00, 'litros', 50),
(1, 1, 'Sal Refisal', 'Refisal', 'Sal de cocina 500g', 1200.00, 'gramos', 120),
(1, 1, 'Azúcar Manuelita', 'Manuelita', 'Azúcar blanca 1kg', 3800.00, 'kg', 90),
(1, 1, 'Frijol Roa', 'Roa', 'Frijol rojo 500g', 4200.00, 'gramos', 60),
(1, 1, 'Lentejas Diana', 'Diana', 'Lentejas 500g', 3900.00, 'gramos', 70),
(1, 1, 'Avena Quaker', 'Quaker', 'Hojuelas de avena 500g', 5600.00, 'gramos', 85),
-- Bebidas
(1, 4, 'Gaseosa Coca Cola', 'Coca Cola', 'Gaseosa 2L', 6500.00, 'litros', 100),
(1, 4, 'Jugo Hit', 'Hit', 'Jugo de naranja 1L', 4200.00, 'litros', 75),
(1, 4, 'Agua Brisa', 'Brisa', 'Agua sin gas 600ml', 1800.00, 'ml', 150),
-- Lácteos
(1, 5, 'Leche Alquería', 'Alquería', 'Leche entera 1L', 4800.00, 'litros', 60),
(1, 5, 'Yogurt Alpina', 'Alpina', 'Yogurt griego 150g', 3200.00, 'gramos', 80),
(1, 5, 'Queso Colanta', 'Colanta', 'Queso doble crema 250g', 8500.00, 'gramos', 40),
(1, 5, 'Mantequilla Alpina', 'Alpina', 'Mantequilla 250g', 6200.00, 'gramos', 50),
-- Limpieza
(1, 2, 'Jabón Axion', 'Axion', 'Jabón para loza 900ml', 8500.00, 'ml', 70),
(1, 2, 'Detergente Ariel', 'Ariel', 'Detergente en polvo 1kg', 15800.00, 'kg', 60),
(1, 2, 'Limpiador Fabuloso', 'Fabuloso', 'Limpiador multiusos 1L', 7200.00, 'litros', 80),
(1, 2, 'Papel higiénico Familia', 'Familia', 'Papel higiénico x12', 24500.00, 'unidades', 100),
(1, 2, 'Cloro Clorox', 'Clorox', 'Blanqueador 1L', 5800.00, 'litros', 90),
-- Higiene Personal
(1, 3, 'Shampoo Sedal', 'Sedal', 'Shampoo hidratación 400ml', 12500.00, 'ml', 65),
(1, 3, 'Jabón Dove', 'Dove', 'Jabón de tocador x3', 9800.00, 'unidades', 75),
(1, 3, 'Crema dental Colgate', 'Colgate', 'Crema dental 100ml', 5200.00, 'ml', 100),
(1, 3, 'Desodorante Rexona', 'Rexona', 'Desodorante en barra 50g', 8900.00, 'gramos', 80),
-- Panadería
(1, 7, 'Pan Bimbo', 'Bimbo', 'Pan tajado integral', 5500.00, 'unidades', 50),
(1, 7, 'Galletas Ducales', 'Ducales', 'Galletas de soda 300g', 3800.00, 'gramos', 90),
-- Snacks
(1, 8, 'Papas Margarita', 'Margarita', 'Papas fritas 150g', 4200.00, 'gramos', 120);

-- Productos en CARULLA (id_supermercado = 2)
INSERT INTO producto_supermercado (id_supermercado, id_categoria, nombre_producto, marca, descripcion, precio, unidad_medida, cantidad_disponible) VALUES
-- Alimentos
(2, 1, 'Arroz Roa', 'Roa', 'Arroz premium 1kg', 6800.00, 'kg', 80),
(2, 1, 'Pasta La Muñeca', 'La Muñeca', 'Pasta penne 500g', 4500.00, 'gramos', 70),
(2, 1, 'Aceite Primor', 'Primor', 'Aceite vegetal 900ml', 13200.00, 'ml', 45),
(2, 1, 'Atún Van Camps', 'Van Camps', 'Atún en agua 180g', 7800.00, 'gramos', 100),
(2, 1, 'Café Sello Rojo', 'Sello Rojo', 'Café molido 250g', 8900.00, 'gramos', 60),
-- Bebidas
(2, 4, 'Gaseosa Postobón', 'Postobón', 'Gaseosa manzana 1.5L', 5800.00, 'litros', 90),
(2, 4, 'Jugo Del Valle', 'Del Valle', 'Jugo de mango 1L', 5200.00, 'litros', 65),
-- Lácteos
(2, 5, 'Leche Colanta', 'Colanta', 'Leche deslactosada 1L', 5200.00, 'litros', 55),
(2, 5, 'Yogurt Yogo Yogo', 'Yogo Yogo', 'Yogurt fresa 200g', 2800.00, 'gramos', 90),
(2, 5, 'Queso Alpina', 'Alpina', 'Queso mozarella 200g', 9200.00, 'gramos', 35),
-- Limpieza
(2, 2, 'Jabón Vel Rosita', 'Vel Rosita', 'Jabón para loza 750ml', 7800.00, 'ml', 75),
(2, 2, 'Detergente Fab', 'Fab', 'Detergente líquido 1L', 14500.00, 'litros', 50),
(2, 2, 'Suavizante Suavitel', 'Suavitel', 'Suavizante de ropa 900ml', 9800.00, 'ml', 60),
-- Higiene Personal
(2, 3, 'Shampoo Pantene', 'Pantene', 'Shampoo restauración 400ml', 15200.00, 'ml', 55),
(2, 3, 'Jabón Protex', 'Protex', 'Jabón antibacterial x4', 11500.00, 'unidades', 70),
-- Panadería
(2, 7, 'Pan Santa Rita', 'Santa Rita', 'Pan tajado blanco', 4800.00, 'unidades', 45),
-- Snacks
(2, 8, 'Chocolatina Jet', 'Jet', 'Chocolate con leche 50g', 2500.00, 'gramos', 150);

-- Productos en JUMBO (id_supermercado = 3)
INSERT INTO producto_supermercado (id_supermercado, id_categoria, nombre_producto, marca, descripcion, precio, unidad_medida, cantidad_disponible) VALUES
-- Alimentos
(3, 1, 'Arroz Supremo', 'Supremo', 'Arroz blanco 5kg', 16500.00, 'kg', 40),
(3, 1, 'Pasta Doria Premium', 'Doria', 'Pasta tornillo 500g', 4200.00, 'gramos', 65),
(3, 1, 'Aceite Oliva Carbonell', 'Carbonell', 'Aceite de oliva 500ml', 28900.00, 'ml', 30),
(3, 1, 'Harina Haz de Oros', 'Haz de Oros', 'Harina de trigo 1kg', 4500.00, 'kg', 70),
-- Bebidas
(3, 4, 'Gaseosa Pepsi', 'Pepsi', 'Gaseosa 2.5L', 7200.00, 'litros', 85),
(3, 4, 'Agua Crystal', 'Crystal', 'Agua con gas 1.5L', 3500.00, 'litros', 100),
-- Lácteos
(3, 5, 'Leche Alpina', 'Alpina', 'Leche entera x6 unidades 1L', 26500.00, 'litros', 45),
(3, 5, 'Yogurt Alpina Regeneris', 'Alpina', 'Yogurt probiótico 180g', 4200.00, 'gramos', 75),
-- Limpieza
(3, 2, 'Jabón Lava', 'Lava', 'Jabón en barra multiusos 800g', 6500.00, 'gramos', 80),
(3, 2, 'Detergente Ace', 'Ace', 'Detergente en polvo 2kg', 24800.00, 'kg', 45),
-- Higiene Personal
(3, 3, 'Shampoo Head & Shoulders', 'Head & Shoulders', 'Shampoo anticaspa 375ml', 18500.00, 'ml', 50),
(3, 3, 'Crema dental Oral-B', 'Oral-B', 'Crema dental 150ml', 8200.00, 'ml', 90),
-- Panadería
(3, 7, 'Pan integral Oroweat', 'Oroweat', 'Pan tajado integral premium', 8200.00, 'unidades', 35),
-- Snacks
(3, 8, 'Papas Lays', 'Lays', 'Papas fritas 180g', 5800.00, 'gramos', 110);

-- Productos en OLÍMPICA (id_supermercado = 4)
INSERT INTO producto_supermercado (id_supermercado, id_categoria, nombre_producto, marca, descripcion, precio, unidad_medida, cantidad_disponible) VALUES
-- Alimentos
(4, 1, 'Arroz Florhuila', 'Florhuila', 'Arroz blanco 1kg', 4200.00, 'kg', 90),
(4, 1, 'Pasta Primavera', 'Primavera', 'Pasta espagueti 500g', 3500.00, 'gramos', 75),
(4, 1, 'Aceite de Soya', 'La Favorita', 'Aceite de soya 1L', 11800.00, 'litros', 55),
(4, 1, 'Sal Marina', 'Marina', 'Sal marina 1kg', 2800.00, 'kg', 100),
-- Bebidas
(4, 4, 'Gaseosa Colombiana', 'Colombiana', 'Gaseosa 1.5L', 5200.00, 'litros', 95),
(4, 4, 'Jugo Tutti Frutti', 'Tutti Frutti', 'Jugo surtido 200ml', 1500.00, 'ml', 120),
-- Lácteos
(4, 5, 'Leche Coolechera', 'Coolechera', 'Leche entera 1L', 4500.00, 'litros', 70),
(4, 5, 'Kumis Alpina', 'Alpina', 'Kumis natural 1L', 5800.00, 'litros', 50),
-- Limpieza
(4, 2, 'Jabón Rey', 'Rey', 'Jabón para loza 500ml', 6200.00, 'ml', 85),
(4, 2, 'Detergente Dersa', 'Dersa', 'Detergente en polvo 500g', 8500.00, 'gramos', 70),
-- Higiene Personal
(4, 3, 'Shampoo Ego', 'Ego', 'Shampoo herbal 350ml', 9800.00, 'ml', 60),
(4, 3, 'Jabón Palmolive', 'Palmolive', 'Jabón de tocador x4', 8500.00, 'unidades', 80),
-- Panadería
(4, 7, 'Pan Súper Ricas', 'Súper Ricas', 'Pan tajado blanco', 4200.00, 'unidades', 55),
-- Snacks
(4, 8, 'Galletas Festival', 'Festival', 'Galletas dulces 180g', 3200.00, 'gramos', 100);


-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================
COMMENT ON TABLE usuario IS 'Usuarios registrados en la aplicación';
COMMENT ON TABLE metodo_pago IS 'Métodos de pago asociados a usuarios';
COMMENT ON TABLE categoria_producto IS 'Categorías de productos del hogar';
COMMENT ON TABLE producto_usuario IS 'Productos registrados por cada usuario para gestión de inventario';
COMMENT ON TABLE historial_notificaciones IS 'Historial de notificaciones enviadas a usuarios';
COMMENT ON TABLE lista_compras IS 'Listas de compras generadas automática o manualmente';
COMMENT ON TABLE supermercado IS 'Supermercados asociados al sistema';
COMMENT ON TABLE producto_supermercado IS 'Catálogo de productos disponibles en supermercados';
COMMENT ON TABLE pedido IS 'Pedidos en línea para recoger en supermercado';
COMMENT ON TABLE detalle_pedido IS 'Detalle de productos en cada pedido';
COMMENT ON TABLE factura IS 'Facturas generadas por pedidos';
COMMENT ON TABLE detalle_factura IS 'Detalle de productos en facturas';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================