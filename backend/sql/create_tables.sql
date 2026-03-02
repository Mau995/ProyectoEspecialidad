CREATE DATABASE fefo_app;
USE fefo_app;

-- =========================================
-- TABLA: ROLES
-- =========================================
CREATE TABLE roles (
    rol_id INT AUTO_INCREMENT PRIMARY KEY,
    rol_nombre VARCHAR(50) NOT NULL,
    rol_descripcion VARCHAR(100),

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT
);

-- =========================================
-- TABLA: USUARIOS
-- =========================================
CREATE TABLE usuarios (
    usu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_nombre VARCHAR(80) NOT NULL,
    usu_apellido_paterno VARCHAR(80),
    usu_apellido_materno VARCHAR(80),
    usu_correo VARCHAR(120) UNIQUE NOT NULL,
    usu_password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT,

    FOREIGN KEY (rol_id) REFERENCES roles(rol_id)
);

-- =========================================
-- TABLA: ALMACENES
-- =========================================
CREATE TABLE almacenes (
    alm_id INT AUTO_INCREMENT PRIMARY KEY,
    alm_nombre VARCHAR(100) NOT NULL,
    alm_ubicacion VARCHAR(150),
    alm_descripcion VARCHAR(150),

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT
);

-- =========================================
-- TABLA: CATEGORIAS
-- =========================================
CREATE TABLE categorias (
    cat_id INT AUTO_INCREMENT PRIMARY KEY,
    cat_nombre VARCHAR(100),
    cat_descripcion VARCHAR(150),

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT
);

-- =========================================
-- TABLA: PRODUCTOS
-- STOCK TOTAL GLOBAL
-- =========================================
CREATE TABLE productos (
    prod_id INT AUTO_INCREMENT PRIMARY KEY,
    prod_nombre VARCHAR(120) NOT NULL,
    prod_descripcion VARCHAR(200),
    prod_unidad_medida VARCHAR(50),
    prod_stock_total DECIMAL(12,2) DEFAULT 0,
    cat_id INT,

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT,

    FOREIGN KEY (cat_id) REFERENCES categorias(cat_id)
);

-- =========================================
-- TABLA: LOTES (FEFO)
-- STOCK POR LOTE + POR ALMACÉN
-- =========================================
CREATE TABLE lotes (
    lot_id INT AUTO_INCREMENT PRIMARY KEY,
    prod_id INT NOT NULL,
    alm_id INT NOT NULL,
    lot_fecha_ingreso DATE,
    lot_fecha_vencimiento DATE NOT NULL,
    lot_cantidad DECIMAL(12,2),

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT,

    FOREIGN KEY (prod_id) REFERENCES productos(prod_id),
    FOREIGN KEY (alm_id) REFERENCES almacenes(alm_id)
);

-- =========================================
-- TABLA: MOVIMIENTOS
-- ENTRADAS, SALIDAS Y TRASPASOS
-- =========================================
CREATE TABLE movimientos (
    mov_id INT AUTO_INCREMENT PRIMARY KEY,
    mov_tipo ENUM('ENTRADA','SALIDA','TRASPASO'),
    mov_fecha DATETIME,
    mov_observacion VARCHAR(200),

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT,

    FOREIGN KEY (usu_id) REFERENCES usuarios(usu_id)
);

-- =========================================
-- TABLA: DETALLE MOVIMIENTO
-- FEFO aplicado por lote
-- =========================================
CREATE TABLE detalle_movimiento (
    dmov_id INT AUTO_INCREMENT PRIMARY KEY,
    mov_id INT,
    lot_id INT,
    dmov_cantidad DECIMAL(12,2),

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT,

    FOREIGN KEY (mov_id) REFERENCES movimientos(mov_id),
    FOREIGN KEY (lot_id) REFERENCES lotes(lot_id)
);

-- =========================================
-- TABLA: TRASPASOS ENTRE ALMACENES
-- =========================================
CREATE TABLE traspasos (
    tra_id INT AUTO_INCREMENT PRIMARY KEY,
    mov_id INT,
    alm_origen_id INT,
    alm_destino_id INT,

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT,

    FOREIGN KEY (mov_id) REFERENCES movimientos(mov_id),
    FOREIGN KEY (alm_origen_id) REFERENCES almacenes(alm_id),
    FOREIGN KEY (alm_destino_id) REFERENCES almacenes(alm_id)
);

-- =========================================
-- TABLA: ALERTAS FEFO
-- =========================================
CREATE TABLE alertas_vencimiento (
    ale_id INT AUTO_INCREMENT PRIMARY KEY,
    lot_id INT,
    ale_dias_restantes INT,
    ale_fecha_alerta DATE,

    Fx_Creacion DATE,
    Fx_Modif DATE,
    Usu_Creacion INT,
    Usu_Modif INT,
    Estado INT,

    FOREIGN KEY (lot_id) REFERENCES lotes(lot_id)
);
