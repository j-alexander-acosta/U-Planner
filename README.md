# U-Planner: Sistema de Gestión de Horarios Académicos

U-Planner es una plataforma integral diseñada para optimizar la planificación y gestión de horarios universitarios. Con una estética premium basada en *Glassmorphism*, el sistema permite a los administradores y directores de carrera gestionar docentes, salas, asignaturas y horarios con validaciones inteligentes en tiempo real.

![Módulo de Horas](file:///Users/alexanderacosta/.gemini/antigravity/brain/b73ad9c7-4e19-4de1-8150-d4720f7720a1/horas_module_data_1771530366343.png)

## 🚀 Características Principales

- **Sincronización con Google Sheets:** Integración directa con hojas de cálculo maestras para la gestión centralizada de Docentes, Salas, Días y Módulos Horarios.
- **Validación Inteligente de Horarios:** Motor de reglas que previene choques de horarios, sobrecarga de salas, conflictos de docentes y asegura la compatibilidad de equipamiento.
- **Filtrado Avanzado:** Sistema de filtros por columna en tiempo real para todas las tablas del sistema (Docentes, Salas, Asignaturas, Horas).
- **Módulo de Reportes y Exportación:** Generación de reportes detallados por Facultad con capacidad de exportación a CSV.
- **Interfaz Multirrol:** Vistas especializadas para Registro Académico y Directores de Carrera.
- **Dashboard Premium:** Diseño moderno y responsivo con visualizaciones de carga académica y disponibilidad de recursos.

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI:** Framework de alto rendimiento para la API.
- **SQLAlchemy:** ORM para la gestión de la base de datos SQLite.
- **GSpread:** Integración con la API de Google Sheets para sincronización de datos.
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
- Credenciales de Google Cloud (`service_account.json`) para la sincronización.

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
3. Configura el archivo `service_account.json` con tus credenciales de Google.
4. Inicia el servidor de desarrollo:
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
│   ├── main.py         # Punto de entrada y endpoints
│   ├── models.py       # Modelos SQLAlchemy (Docentes, Salas, Días, Horas)
│   ├── schemas.py      # Esquemas Pydantic
│   ├── google_sheets.py # Lógica de sincronización con Google Sheets
│   └── crud.py         # Operaciones de base de datos
├── frontend/           # Aplicación React
│   ├── src/
│   │   ├── App.jsx     # Componente principal y gestión de estado
│   │   ├── Reports.jsx # Módulo de reportes
│   │   └── DirectorDashboard.jsx # Vista de director
│   └── index.html
├── schema.sql          # Definición de la base de datos SQL
└── README.md
```

---
Desarrollado para la **Universidad Adventista de Chile**.
Alexander Acosta @ 2026
