# U-Planner: Sistema de Gestión de Horarios Académicos

U-Planner es una plataforma integral diseñada para optimizar la planificación y gestión de horarios universitarios. Con una estética premium basada en *Glassmorphism*, el sistema permite a los administradores y directores de carrera gestionar docentes, salas, asignaturas y horarios con validaciones inteligentes en tiempo real.

![Dashboard Preview](file:///Users/alexanderacosta/.gemini/antigravity/brain/8bb9bd85-c389-4dfe-bd1f-2fd4f204b14f/final_ui_check_1771359333890.png)

## 🚀 Características Principales

- **Validación Inteligente de Horarios:** Motor de reglas que previene choques de horarios, sobrecarga de salas, conflictos de docentes y asegura la compatibilidad de equipamiento.
- **Módulo de Reportes y Exportación:** Generación de reportes detallados por Facultad con capacidad de exportación a CSV.
- **Interfaz Multirrol:** Vistas especializadas para Registro Académico y Directores de Carrera.
- **Dashboard Premium:** Diseño moderno y responsivo con visualizaciones de carga académica y disponibilidad de laboratorios.
- **Gestión de Recursos:** Control detallado de tipos de salas, especialidades docentes y requerimientos de asignaturas.

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI:** Framework de alto rendimiento para la API.
- **SQLAlchemy:** ORM para la gestión de la base de datos SQLite.
- **Pydantic:** Validación de datos y esquemas.
- **Uvicorn:** Servidor ASGI para la ejecución de la aplicación.

### Frontend
- **React + Vite:** Core del frontend para una experiencia rápida y reactiva.
- **Framer Motion:** Micro-animaciones y transiciones fluidas.
- **Lucide React:** Set de iconos premium y minimalistas.
- **Axios:** Cliente HTTP para comunicación con el backend.
- **Vanilla CSS:** Sistema de diseño personalizado con estética *glassmorphism*.

## 📦 Instalación

### Requisitos Previos
- Python 3.9+
- Node.js 18+
- npm o yarn

### Configuración del Backend
1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Crea un entorno virtual e instálalo:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Configuración del Frontend
1. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📂 Estructura del Proyecto

```text
U-Planner/
├── backend/            # API FastAPI y lógica de negocio
│   ├── main.py         # Punto de entrada
│   ├── models.py       # Modelos SQLAlchemy
│   ├── schemas.py      # Esquemas Pydantic
│   └── crud.py         # Operaciones de base de datos
├── frontend/           # Aplicación React
│   ├── src/
│   │   ├── App.jsx     # Componente principal
│   │   ├── Reports.jsx # Módulo de reportes
│   │   └── DirectorDashboard.jsx # Vista de director
│   └── index.html
├── schema.sql          # Definición de la base de datos SQL
└── README.md
```

---
Desarrollado para la **Universidad Adventista de Chile**.
Alexander Acosta @ 2026
