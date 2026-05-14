
CREATE TABLE especialidades (
    id_especialidad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla de doctores
CREATE TABLE doctores (
    id_doctor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(120) ,
    id_especialidad INT NOT NULL,
    FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad)
);

CREATE TABLE pacientes (
    id_paciente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,  
    telefono VARCHAR(20),
    correo VARCHAR(120) UNIQUE,
    direccion VARCHAR(100)
);

CREATE TABLE consultorios (
    id_consultorio SERIAL PRIMARY KEY,
    numero_consultorio VARCHAR(20) NOT NULL UNIQUE,
    disponible BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla de citas
CREATE TABLE citas (
    id_cita SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',

    id_paciente INT NOT NULL,
    id_doctor INT NOT NULL,
    id_consultorio INT NOT NULL,

    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),

    FOREIGN KEY (id_doctor) REFERENCES doctores(id_doctor),

    FOREIGN KEY (id_consultorio) REFERENCES consultorios(id_consultorio)
);


-- Inserts para especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES
('Cardiología', 'Enfermedades del corazón'),
('Dermatología', 'Tratamiento de la piel'),
('Pediatría', 'Atención médica infantil'),
('Neurología', 'Trastornos del sistema nervioso'),
('Ginecología', 'Salud reproductiva femenina');

-- Inserts para doctores
INSERT INTO doctores (nombre, apellido, telefono, correo, id_especialidad) VALUES
('Juan', 'Pérez', '8888-1111', 'juan.perez@hospital.com', 1),
('María', 'Gómez', '8888-2222', 'maria.gomez@hospital.com', 2),
('Carlos', 'Ramírez', '8888-3333', 'carlos.ramirez@hospital.com', 3),
('Ana', 'Fernández', '8888-4444', 'ana.fernandez@hospital.com', 4),
('Luis', 'Castro', '8888-5555', 'luis.castro@hospital.com', 5);

-- Inserts para pacientes
INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, telefono, correo, direccion) VALUES
('Pedro', 'López', '1990-05-12', '7000-1111', 'pedro.lopez@email.com', 'San José'),
('Laura', 'Martínez', '1985-08-23', '7000-2222', 'laura.martinez@email.com', 'Heredia'),
('Diego', 'Sánchez', '2000-01-15', '7000-3333', 'diego.sanchez@email.com', 'Alajuela'),
('Sofía', 'Hernández', '1995-03-30', '7000-4444', 'sofia.hernandez@email.com', 'Cartago'),
('Andrés', 'Torres', '1988-11-09', '7000-5555', 'andres.torres@email.com', 'Puntarenas');

-- Inserts para consultorios
INSERT INTO consultorios (numero_consultorio, disponible) VALUES
('C-101', TRUE),
('C-102', TRUE),
('C-103', FALSE),
('C-104', TRUE),
('C-105', FALSE);

-- Inserts para citas
INSERT INTO citas (fecha, hora, motivo, estado, id_paciente, id_doctor, id_consultorio) VALUES
('2026-05-01', '08:00:00', 'Chequeo general', 'pendiente', 1, 1, 1),
('2026-05-02', '09:30:00', 'Consulta dermatológica', 'pendiente', 2, 2, 2),
('2026-05-03', '10:15:00', 'Control pediátrico', 'confirmada', 3, 3, 3),
('2026-05-04', '11:00:00', 'Dolor de cabeza', 'cancelada', 4, 4, 4),
('2026-05-05', '14:45:00', 'Revisión ginecológica', 'pendiente', 5, 5, 5);
