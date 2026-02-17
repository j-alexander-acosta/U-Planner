-- Database Schema for U-Planner
-- Universidad Adventista de Chile

-- 1. Roles and Users
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE -- Superusuario, Registro Académico, Director de Carrera
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 2. Teachers and Specializations
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    specialization VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Time Blocks (Master Data)
CREATE TABLE time_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week VARCHAR(15) NOT NULL, -- Lunes, Martes, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 4. Teacher Availability (Bloques)
CREATE TABLE teacher_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    time_block_id INTEGER NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (time_block_id) REFERENCES time_blocks(id),
    UNIQUE(teacher_id, time_block_id)
);

-- 5. Rooms and Categories
CREATE TABLE room_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE -- Teórica, Computación, Ciencias Básicas, Salud/Simulación, Talleres
);

CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    room_type_id INTEGER NOT NULL,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
);

-- 6. Subjects (Asignaturas)
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    enrolled_students INTEGER DEFAULT 0,
    required_room_type_id INTEGER NOT NULL, -- Crucial for equipment constraint
    FOREIGN KEY (required_room_type_id) REFERENCES room_types(id)
);

-- 7. Schedules (Horarios - Central Pivot)
CREATE TABLE schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    time_block_id INTEGER NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (time_block_id) REFERENCES time_blocks(id),
    
    -- basic redundancy checks (can be enhanced with triggers/application logic)
    UNIQUE(room_id, time_block_id), -- Room can't be in two places at once
    UNIQUE(teacher_id, time_block_id) -- Teacher can't be in two places at once
);

-- Initial Data (Sample)
INSERT INTO roles (name) VALUES ('Superusuario'), ('Registro Académico'), ('Director de Carrera');
INSERT INTO room_types (name) VALUES ('Teórica'), ('Computación'), ('Ciencias Básicas'), ('Salud/Simulación'), ('Talleres');
