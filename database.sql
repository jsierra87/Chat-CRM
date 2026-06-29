-- CHATCRM PRO - Database Schema
-- Note: This is provided as a reference. The app uses a simulated JSON store for compatibility with this environment.

CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    color_marca VARCHAR(7) DEFAULT '#6C63FF',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'vendedor') NOT NULL,
    avatar_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE IF NOT EXISTS redes_sociales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendedor_id INT NOT NULL,
    tipo ENUM('whatsapp', 'instagram', 'facebook', 'messenger', 'tiktok', 'telegram') NOT NULL,
    usuario_red VARCHAR(100),
    password_red TEXT,
    token_acceso TEXT,
    estado ENUM('conectada', 'desconectada', 'error') DEFAULT 'desconectada',
    ultima_sync TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendedor_id INT NOT NULL,
    empresa_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    avatar_url VARCHAR(255),
    red_social ENUM('whatsapp', 'instagram', 'facebook', 'messenger', 'tiktok', 'telegram'),
    id_externo VARCHAR(100),
    notas TEXT,
    etiqueta ENUM('lead', 'cliente', 'prospecto', 'vip') DEFAULT 'prospecto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE IF NOT EXISTS conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contacto_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    red_social_id INT NOT NULL,
    estado ENUM('activa', 'respondida', 'pendiente', 'archivada') DEFAULT 'pendiente',
    ultimo_mensaje TEXT,
    ultimo_mensaje_fecha TIMESTAMP NULL,
    no_leidos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contacto_id) REFERENCES contactos(id),
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
    FOREIGN KEY (red_social_id) REFERENCES redes_sociales(id)
);

CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    remitente ENUM('contacto', 'vendedor', 'admin') NOT NULL,
    contenido TEXT,
    tipo ENUM('texto', 'imagen', 'audio', 'video', 'documento') DEFAULT 'texto',
    url_archivo VARCHAR(255),
    leido BOOLEAN DEFAULT FALSE,
    enviado_por_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id)
);

-- SEED DATA
INSERT INTO empresas (nombre, color_marca) VALUES 
('RACEPOINT', '#6C63FF'),
('WYLCO', '#00D4AA'),
('4PRO', '#FF4D6A'),
('FORNITURA', '#6C63FF'),
('VILLAS CORALIA', '#00D4AA'),
('VILLAS PEZ VELA', '#FF4D6A');

-- Admin (password: Admin2024!)
-- Hash for bcrypt: $2a$10$8v8K0vS.NqH5vU/zW8v.O.7G2vYh7vYh7vYh7vYh7vYh7vYh7vYh
-- Note: Real hash will be generated in server code for consistency.
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES 
('Admin', 'System', 'admin@chatcrm.com', '$2a$10$K7L1vJ3Xp8p7p7p7p7p7puq8p7p7p7p7p7p7p7p7p7p7p7p7p7', 'admin');

-- Vendedores de prueba
INSERT INTO usuarios (empresa_id, nombre, apellido, email, password_hash, rol) VALUES 
(1, 'Juan', 'Perez', 'juan@racepoint.com', '$2a$10$K7L1vJ3Xp8p7p7p7p7p7puq8p7p7p7p7p7p7p7p7p7p7p7p7p7', 'vendedor'),
(2, 'Maria', 'Garcia', 'maria@wylco.com', '$2a$10$K7L1vJ3Xp8p7p7p7p7p7puq8p7p7p7p7p7p7p7p7p7p7p7p7p7', 'vendedor');
