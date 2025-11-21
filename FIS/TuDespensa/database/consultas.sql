-- ============================================
-- CONSULTAS SQL - TU DESPENSA
-- Inserción, Consulta, Actualización y Eliminación
-- ============================================


-- INSERTAR: Registrar nuevo usuario (HU-001)
INSERT INTO usuario (nombre, apellido, correo, contrasena_hash, telefono, direccion, token_verificacion)
VALUES (
    'Juan',
    'Pérez',
    'juan.perez@email.com',
    '$2y$10$hashedpassword...', -- Contraseña cifrada con password_hash()
    '3001234567',
    'Calle 123 #45-67, Bogotá',
    'token_verificacion_unico_123'
);

-- Consultar todos los usuarios
SELECT * FROM usuario;


-- Ver el ID del usuario creado
SELECT id_usuario, nombre, correo FROM usuario WHERE correo = 'juan.test@email.com';

-- CONSULTAR: Validar login 
SELECT id_usuario, nombre, apellido, correo, contrasena_hash, activo, email_verificado
FROM usuario
WHERE correo = 'juan.perez@email.com'
AND activo = TRUE;

-- ACTUALIZAR: Verificar email después del registro
UPDATE usuario
SET email_verificado = TRUE,
    token_verificacion = NULL
WHERE token_verificacion = 'token_verificacion_unico_123';

-- ACTUALIZAR: Registrar último acceso
UPDATE usuario
SET ultimo_acceso = CURRENT_TIMESTAMP
WHERE id_usuario = 1;

-- CONSULTAR: Obtener perfil del usuario
SELECT id_usuario, nombre, apellido, correo, telefono, direccion, 
       fecha_registro, email_verificado, activo
FROM usuario
WHERE id_usuario = 1;

-- ACTUALIZAR: Modificar datos del usuario
UPDATE usuario
SET nombre = 'Juan Carlos',
    telefono = '3009876543',
    direccion = 'Carrera 50 #30-20, Bogotá'
WHERE id_usuario = 1;

-- ELIMINAR: Desactivar usuario (no eliminar físicamente)
UPDATE usuario
SET activo = FALSE
WHERE id_usuario = 1;

-- ============================================
-- 2. GESTIÓN DE MÉTODOS DE PAGO
-- ============================================

-- INSERTAR: Registrar método de pago
INSERT INTO metodo_pago (id_usuario, tipo_pago, nombre_titular, numero_tarjeta_encriptado, 
                         ultimos_digitos, fecha_expiracion, es_preferido)
VALUES (
    1, -- ID del usuario
    'Tarjeta Crédito',
    'Juan Pérez',
    'encrypted_card_number_123', -- Número encriptado
    '4532', -- Últimos 4 dígitos
    '12/2027',
    TRUE -- Método preferido
);

-- CONSULTAR: Obtener métodos de pago de un usuario
SELECT id_metodo_pago, tipo_pago, nombre_titular, ultimos_digitos, 
       fecha_expiracion, es_preferido, activo
FROM metodo_pago
WHERE id_usuario = 1
AND activo = TRUE
ORDER BY es_preferido DESC, fecha_registro DESC;

-- ACTUALIZAR: Cambiar método preferido
-- Primero quitar la preferencia de todos
UPDATE metodo_pago
SET es_preferido = FALSE
WHERE id_usuario = 1;

-- Luego marcar el nuevo como preferido
UPDATE metodo_pago
SET es_preferido = TRUE
WHERE id_metodo_pago = 2;

-- ELIMINAR: Desactivar método de pago
UPDATE metodo_pago
SET activo = FALSE
WHERE id_metodo_pago = 1
AND id_usuario = 1;

-- ELIMINAR: Eliminar físicamente un método de pago
DELETE FROM metodo_pago
WHERE id_metodo_pago = 1
AND id_usuario = 1;

-- ============================================
-- 3. GESTIÓN DE CATEGORÍAS
-- ============================================

-- CONSULTAR: Listar todas las categorías
SELECT id_categoria, nombre_categoria, descripcion
FROM categoria_producto
ORDER BY nombre_categoria;

-- CONSULTAR: Obtener una categoría específica
SELECT id_categoria, nombre_categoria, descripcion
FROM categoria_producto
WHERE id_categoria = 1;

-- ============================================
-- 4. GESTIÓN DE PRODUCTOS DEL USUARIO 
-- ============================================

-- INSERTAR: Registrar producto del usuario
INSERT INTO producto_usuario (id_usuario, id_categoria, nombre_producto, marca, 
                               unidad_medida, frecuencia_reposicion, notas)
VALUES (
    1, -- ID del usuario
    1, -- Alimentos
    'Arroz',
    'Diana',
    'kg',
    30, -- Notificar cada 30 días
    'Comprar el de 5kg'
);

-- CONSULTAR: Listar productos del usuario
SELECT pu.id_producto_usuario, pu.nombre_producto, pu.marca, 
       pu.unidad_medida, pu.frecuencia_reposicion, pu.activo, pu.notas,
       cp.nombre_categoria
FROM producto_usuario pu
JOIN categoria_producto cp ON pu.id_categoria = cp.id_categoria
WHERE pu.id_usuario = 1
AND pu.activo = TRUE
ORDER BY cp.nombre_categoria, pu.nombre_producto;

-- CONSULTAR: Buscar productos por categoría
SELECT pu.id_producto_usuario, pu.nombre_producto, pu.marca, pu.frecuencia_reposicion
FROM producto_usuario pu
WHERE pu.id_usuario = 1
AND pu.id_categoria = 1
AND pu.activo = TRUE;

-- CONSULTAR: Buscar productos por nombre
SELECT pu.id_producto_usuario, pu.nombre_producto, pu.marca, 
       cp.nombre_categoria, pu.frecuencia_reposicion
FROM producto_usuario pu
JOIN categoria_producto cp ON pu.id_categoria = cp.id_categoria
WHERE pu.id_usuario = 1
AND pu.nombre_producto ILIKE '%arroz%'
AND pu.activo = TRUE;

-- ACTUALIZAR: Modificar producto del usuario
UPDATE producto_usuario
SET nombre_producto = 'Arroz Integral',
    marca = 'Roa',
    frecuencia_reposicion = 15,
    notas = 'Comprar el de 1kg'
WHERE id_producto_usuario = 1
AND id_usuario = 1;

-- ELIMINAR: Desactivar producto
UPDATE producto_usuario
SET activo = FALSE
WHERE id_producto_usuario = 1
AND id_usuario = 1;

-- ELIMINAR: Eliminar físicamente un producto
DELETE FROM producto_usuario
WHERE id_producto_usuario = 1
AND id_usuario = 1;

-- CONSULTAR: Contar productos por categoría
SELECT cp.nombre_categoria, COUNT(pu.id_producto_usuario) as total_productos
FROM categoria_producto cp
LEFT JOIN producto_usuario pu ON cp.id_categoria = pu.id_categoria 
    AND pu.id_usuario = 1 AND pu.activo = TRUE
GROUP BY cp.id_categoria, cp.nombre_categoria
ORDER BY cp.nombre_categoria;

-- ============================================
-- 5. GESTIÓN DE NOTIFICACIONES 
-- ============================================

-- INSERTAR: Crear notificación
INSERT INTO historial_notificaciones (id_producto_usuario, tipo_notificacion, mensaje)
VALUES (
    1, -- ID del producto
    'Recordatorio',
    '¿Ya se terminó el Arroz Diana?'
);

-- CONSULTAR: Notificaciones pendientes (no leídas) del usuario
SELECT hn.id_notificacion, hn.fecha_envio, hn.tipo_notificacion, hn.mensaje, hn.leida,
       pu.nombre_producto, pu.marca
FROM historial_notificaciones hn
JOIN producto_usuario pu ON hn.id_producto_usuario = pu.id_producto_usuario
WHERE pu.id_usuario = 1
AND hn.leida = FALSE
ORDER BY hn.fecha_envio DESC;

-- CONSULTAR: Historial de notificaciones
SELECT hn.id_notificacion, hn.fecha_envio, hn.tipo_notificacion, hn.mensaje, 
       hn.leida, hn.respuesta_usuario, hn.fecha_respuesta,
       pu.nombre_producto, pu.marca
FROM historial_notificaciones hn
JOIN producto_usuario pu ON hn.id_producto_usuario = pu.id_producto_usuario
WHERE pu.id_usuario = 1
ORDER BY hn.fecha_envio DESC
LIMIT 50;

-- ACTUALIZAR: Marcar notificación como leída
UPDATE historial_notificaciones
SET leida = TRUE
WHERE id_notificacion = 1;

-- ACTUALIZAR: Registrar respuesta del usuario a la notificación
UPDATE historial_notificaciones
SET respuesta_usuario = 'Agotado',
    fecha_respuesta = CURRENT_TIMESTAMP,
    leida = TRUE
WHERE id_notificacion = 1;

-- CONSULTAR: Productos que requieren notificación (cada X días)
SELECT pu.id_producto_usuario, pu.nombre_producto, pu.marca, 
       pu.frecuencia_reposicion,
       MAX(hn.fecha_envio) as ultima_notificacion,
       COALESCE(MAX(hn.fecha_envio), CURRENT_TIMESTAMP - (pu.frecuencia_reposicion || ' days')::INTERVAL) + 
       (pu.frecuencia_reposicion || ' days')::INTERVAL as proxima_notificacion
FROM producto_usuario pu
LEFT JOIN historial_notificaciones hn ON pu.id_producto_usuario = hn.id_producto_usuario
WHERE pu.id_usuario = 1
AND pu.activo = TRUE
GROUP BY pu.id_producto_usuario, pu.nombre_producto, pu.marca, pu.frecuencia_reposicion
HAVING COALESCE(MAX(hn.fecha_envio), CURRENT_TIMESTAMP - (pu.frecuencia_reposicion || ' days')::INTERVAL) + 
       (pu.frecuencia_reposicion || ' days')::INTERVAL <= CURRENT_TIMESTAMP
ORDER BY proxima_notificacion;

-- ============================================
-- 6. GESTIÓN DE LISTAS DE COMPRAS 
-- ============================================

-- INSERTAR: Crear lista de compras automática
INSERT INTO lista_compras (id_usuario, fecha_programada, tipo_lista, estado)
VALUES (
    1,
    '2025-11-30', -- Fecha programada
    'Automatica',
    'Pendiente'
);

-- INSERTAR: Crear lista de compras manual
INSERT INTO lista_compras (id_usuario, tipo_lista, estado)
VALUES (1, 'Manual', 'Pendiente');

-- CONSULTAR: Listas de compras del usuario
SELECT id_lista, fecha_creacion, fecha_programada, estado, tipo_lista, 
       total_productos, enviada_correo, fecha_envio_correo
FROM lista_compras
WHERE id_usuario = 1
ORDER BY fecha_creacion DESC;

-- CONSULTAR: Lista activa/pendiente del usuario
SELECT id_lista, fecha_creacion, fecha_programada, tipo_lista, total_productos
FROM lista_compras
WHERE id_usuario = 1
AND estado = 'Pendiente'
ORDER BY fecha_creacion DESC
LIMIT 1;

-- ACTUALIZAR: Actualizar total de productos en la lista
UPDATE lista_compras
SET total_productos = (
    SELECT COUNT(*)
    FROM producto_usuario
    WHERE id_usuario = 1 AND activo = TRUE
)
WHERE id_lista = 1;

-- ACTUALIZAR: Marcar lista como descargada
UPDATE lista_compras
SET estado = 'Descargada'
WHERE id_lista = 1;

-- ACTUALIZAR: Marcar lista como enviada por correo
UPDATE lista_compras
SET enviada_correo = TRUE,
    fecha_envio_correo = CURRENT_TIMESTAMP
WHERE id_lista = 1;

-- CONSULTAR: Productos para agregar a la lista (basado en notificaciones "Agotado")
SELECT DISTINCT pu.id_producto_usuario, pu.nombre_producto, pu.marca, 
       cp.nombre_categoria
FROM producto_usuario pu
JOIN categoria_producto cp ON pu.id_categoria = cp.id_categoria
JOIN historial_notificaciones hn ON pu.id_producto_usuario = hn.id_producto_usuario
WHERE pu.id_usuario = 1
AND pu.activo = TRUE
AND hn.respuesta_usuario = 'Agotado'
AND hn.fecha_respuesta >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY cp.nombre_categoria, pu.nombre_producto;

-- ============================================
-- 7. GESTIÓN DE SUPERMERCADOS
-- ============================================

-- CONSULTAR: Listar supermercados activos
SELECT id_supermercado, nombre_supermercado, direccion, telefono, correo
FROM supermercado
WHERE activo = TRUE
ORDER BY nombre_supermercado;

-- CONSULTAR: Obtener información de un supermercado
SELECT id_supermercado, nombre_supermercado, direccion, telefono, correo
FROM supermercado
WHERE id_supermercado = 1;

-- ============================================
-- 8. GESTIÓN DE PRODUCTOS DEL SUPERMERCADO
-- ============================================

-- CONSULTAR: Productos disponibles en un supermercado
SELECT ps.id_producto_supermercado, ps.nombre_producto, ps.marca, ps.descripcion,
       ps.precio, ps.unidad_medida, ps.cantidad_disponible,
       cp.nombre_categoria
FROM producto_supermercado ps
JOIN categoria_producto cp ON ps.id_categoria = cp.id_categoria
WHERE ps.id_supermercado = 1
AND ps.activo = TRUE
AND ps.cantidad_disponible > 0
ORDER BY cp.nombre_categoria, ps.nombre_producto;

-- CONSULTAR: Buscar productos por nombre en supermercado
SELECT ps.id_producto_supermercado, ps.nombre_producto, ps.marca, ps.precio,
       cp.nombre_categoria
FROM producto_supermercado ps
JOIN categoria_producto cp ON ps.id_categoria = cp.id_categoria
WHERE ps.id_supermercado = 1
AND ps.nombre_producto ILIKE '%arroz%'
AND ps.activo = TRUE
ORDER BY ps.precio;

-- CONSULTAR: Productos por categoría en supermercado
SELECT ps.id_producto_supermercado, ps.nombre_producto, ps.marca, 
       ps.precio, ps.cantidad_disponible
FROM producto_supermercado ps
WHERE ps.id_supermercado = 1
AND ps.id_categoria = 1
AND ps.activo = TRUE
ORDER BY ps.nombre_producto;

-- ============================================
-- 9. GESTIÓN DE PEDIDOS 
-- ============================================

-- INSERTAR: Crear pedido
INSERT INTO pedido (id_usuario, id_lista, id_supermercado, id_metodo_pago, 
                    fecha_recogida_programada, subtotal, impuestos, total, estado_pedido, notas)
VALUES (
    1,
    1, -- ID de la lista de compras
    1, -- ID del supermercado
    1, -- ID del método de pago
    '2025-10-31 10:00:00',
    50000.00,
    9500.00,
    59500.00,
    'Pendiente',
    'Recoger en la mañana'
);

-- INSERTAR: Agregar productos al pedido (detalle)
INSERT INTO detalle_pedido (id_pedido, id_producto_supermercado, cantidad, precio_unitario, subtotal)
VALUES
(1, 5, 2, 3500.00, 7000.00),  -- 2 Arroz a $3,500
(1, 12, 1, 8500.00, 8500.00),  -- 1 Aceite a $8,500
(1, 20, 3, 2000.00, 6000.00);  -- 3 Pan a $2,000

-- CONSULTAR: Pedidos del usuario
SELECT p.id_pedido, p.fecha_pedido, p.fecha_recogida_programada, p.total, 
       p.estado_pedido, s.nombre_supermercado
FROM pedido p
JOIN supermercado s ON p.id_supermercado = s.id_supermercado
WHERE p.id_usuario = 1
ORDER BY p.fecha_pedido DESC;

-- CONSULTAR: Detalle completo de un pedido
SELECT p.id_pedido, p.fecha_pedido, p.fecha_recogida_programada, 
       p.subtotal, p.impuestos, p.total, p.estado_pedido, p.notas,
       s.nombre_supermercado, s.direccion, s.telefono,
       mp.tipo_pago, mp.ultimos_digitos
FROM pedido p
JOIN supermercado s ON p.id_supermercado = s.id_supermercado
LEFT JOIN metodo_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
WHERE p.id_pedido = 1;

-- CONSULTAR: Productos de un pedido
SELECT dp.id_detalle_pedido, dp.cantidad, dp.precio_unitario, dp.subtotal,
       ps.nombre_producto, ps.marca, ps.unidad_medida
FROM detalle_pedido dp
JOIN producto_supermercado ps ON dp.id_producto_supermercado = ps.id_producto_supermercado
WHERE dp.id_pedido = 1
ORDER BY ps.nombre_producto;

-- ACTUALIZAR: Cambiar estado del pedido
UPDATE pedido
SET estado_pedido = 'Pagado'
WHERE id_pedido = 1;

UPDATE pedido
SET estado_pedido = 'En Preparación'
WHERE id_pedido = 1;

UPDATE pedido
SET estado_pedido = 'Listo para Recoger'
WHERE id_pedido = 1;

UPDATE pedido
SET estado_pedido = 'Completado'
WHERE id_pedido = 1;

-- ACTUALIZAR: Cancelar pedido
UPDATE pedido
SET estado_pedido = 'Cancelado'
WHERE id_pedido = 1;

-- CONSULTAR: Historial de pedidos con filtro de fechas (HU-009)
SELECT p.id_pedido, p.fecha_pedido, p.total, p.estado_pedido,
       s.nombre_supermercado
FROM pedido p
JOIN supermercado s ON p.id_supermercado = s.id_supermercado
WHERE p.id_usuario = 1
AND p.fecha_pedido BETWEEN '2025-10-01' AND '2025-10-31'
ORDER BY p.fecha_pedido DESC;

-- ============================================
-- 10. GESTIÓN DE FACTURAS
-- ============================================

-- INSERTAR: Generar factura para un pedido
INSERT INTO factura (id_pedido, numero_factura, subtotal, impuestos, total, estado_factura)
VALUES (
    1,
    'FACT-2025-000001',
    50000.00,
    9500.00,
    59500.00,
    'Generada'
);

-- INSERTAR: Agregar detalles a la factura
INSERT INTO detalle_factura (id_factura, descripcion_producto, cantidad, precio_unitario, subtotal)
SELECT 
    1, -- ID de la factura
    ps.nombre_producto || ' - ' || ps.marca,
    dp.cantidad,
    dp.precio_unitario,
    dp.subtotal
FROM detalle_pedido dp
JOIN producto_supermercado ps ON dp.id_producto_supermercado = ps.id_producto_supermercado
WHERE dp.id_pedido = 1;

-- CONSULTAR: Facturas del usuario
SELECT f.id_factura, f.numero_factura, f.fecha_emision, f.total, 
       f.estado_factura, f.enviada_correo,
       p.id_pedido
FROM factura f
JOIN pedido p ON f.id_pedido = p.id_pedido
WHERE p.id_usuario = 1
ORDER BY f.fecha_emision DESC;

-- CONSULTAR: Detalle completo de una factura
SELECT f.id_factura, f.numero_factura, f.fecha_emision,
       f.subtotal, f.impuestos, f.total, f.estado_factura,
       p.id_pedido, s.nombre_supermercado,
       u.nombre, u.apellido, u.correo, u.direccion
FROM factura f
JOIN pedido p ON f.id_pedido = p.id_pedido
JOIN supermercado s ON p.id_supermercado = s.id_supermercado
JOIN usuario u ON p.id_usuario = u.id_usuario
WHERE f.id_factura = 1;

-- CONSULTAR: Productos de una factura
SELECT df.descripcion_producto, df.cantidad, df.precio_unitario, df.subtotal
FROM detalle_factura df
WHERE df.id_factura = 1
ORDER BY df.descripcion_producto;

-- ACTUALIZAR: Marcar factura como enviada por correo
UPDATE factura
SET enviada_correo = TRUE,
    fecha_envio_correo = CURRENT_TIMESTAMP,
    estado_factura = 'Enviada'
WHERE id_factura = 1;

-- CONSULTAR: Historial de facturas por rango de fechas
SELECT f.id_factura, f.numero_factura, f.fecha_emision, f.total
FROM factura f
JOIN pedido p ON f.id_pedido = p.id_pedido
WHERE p.id_usuario = 1
AND f.fecha_emision BETWEEN '2025-10-01' AND '2025-10-31'
ORDER BY f.fecha_emision DESC;

-- ============================================
-- 11. CONSULTAS AVANZADAS Y REPORTES
-- ============================================

-- REPORTE: Total gastado por mes
SELECT 
    DATE_TRUNC('month', p.fecha_pedido) as mes,
    COUNT(p.id_pedido) as total_pedidos,
    SUM(p.total) as total_gastado
FROM pedido p
WHERE p.id_usuario = 1
AND p.estado_pedido IN ('Pagado', 'Completado')
GROUP BY DATE_TRUNC('month', p.fecha_pedido)
ORDER BY mes DESC;

-- REPORTE: Productos más comprados
SELECT 
    ps.nombre_producto,
    ps.marca,
    COUNT(dp.id_detalle_pedido) as veces_comprado,
    SUM(dp.cantidad) as cantidad_total
FROM detalle_pedido dp
JOIN producto_supermercado ps ON dp.id_producto_supermercado = ps.id_producto_supermercado
JOIN pedido p ON dp.id_pedido = p.id_pedido
WHERE p.id_usuario = 1
GROUP BY ps.id_producto_supermercado, ps.nombre_producto, ps.marca
ORDER BY veces_comprado DESC
LIMIT 10;

-- REPORTE: Supermercado más utilizado
SELECT 
    s.nombre_supermercado,
    COUNT(p.id_pedido) as total_pedidos,
    SUM(p.total) as total_gastado
FROM pedido p
JOIN supermercado s ON p.id_supermercado = s.id_supermercado
WHERE p.id_usuario = 1
AND p.estado_pedido IN ('Pagado', 'Completado')
GROUP BY s.id_supermercado, s.nombre_supermercado
ORDER BY total_pedidos DESC;

-- CONSULTA: Dashboard - Resumen del usuario
SELECT 
    (SELECT COUNT(*) FROM producto_usuario WHERE id_usuario = 1 AND activo = TRUE) as total_productos,
    (SELECT COUNT(*) FROM lista_compras WHERE id_usuario = 1 AND estado = 'Pendiente') as listas_pendientes,
    (SELECT COUNT(*) FROM pedido WHERE id_usuario = 1 AND estado_pedido = 'Pendiente') as pedidos_pendientes,
    (SELECT COUNT(*) FROM historial_notificaciones hn 
     JOIN producto_usuario pu ON hn.id_producto_usuario = pu.id_producto_usuario
     WHERE pu.id_usuario = 1 AND hn.leida = FALSE) as notificaciones_pendientes;

