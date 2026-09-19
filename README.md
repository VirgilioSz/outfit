# Outfit AI

Aplicación web personal para gestionar un closet digital y generar outfits con inteligencia artificial. El usuario sube fotos de sus prendas, CLIP las analiza automáticamente (tipo, color, estilo), y Gemini genera combinaciones de outfits según la ocasión elegida.

## Stack Tecnológico

### Backend
- **Lenguaje:** Python 3.10+
- **Framework:** FastAPI
- **Base de datos:** SQLite con SQLAlchemy ORM
- **IA local:** CLIP (openai/clip-vit-base-patch32) via Hugging Face transformers
- **Remoción de fondo:** rembg
- **LLM:** Google Gemini (gemini-3.5-flash) via google-generativeai SDK
- **Servidor:** uvicorn

### Frontend
- **Lenguaje:** HTML + CSS + JavaScript vanilla (sin frameworks)
- **Fuente:** Inter (Google Fonts)
- **Tema:** Dark mode
- **Animaciones:** Anime.js
- **Iconos:** Lucide

---

## Estructura del Proyecto

```
outfit/
├── AGENTS.md
├── .env                          # Variables secretas (no versionar)
├── .gitignore
├── backend/
│   ├── main.py                   # Punto de entrada FastAPI
│   ├── config.py                 # Configuración y variables de entorno
│   ├── database.py               # Conexión SQLite y sesiones
│   ├── requirements.txt          # Dependencias Python
│   ├── models/
│   │   ├── clothing.py           # Tabla prendas
│   │   └── outfit_history.py     # Tabla historial de outfits
│   ├── routers/
│   │   ├── clothes.py            # Endpoints CRUD prendas
│   │   └── outfits.py            # Endpoints generación e historial
│   ├── services/
│   │   ├── image_service.py      # Guardar/eliminar imágenes en disco
│   │   └── clothing_service.py   # Orquesta flujo subida prendas
│   └── ai/
│       ├── background_remover.py # rembg - quita fondo fotos
│       ├── clip_analyzer.py      # CLIP - detecta tipo, color, estilo
│       └── outfit_generator.py   # Gemini - genera outfits
└── frontend/
    ├── index.html                # Closet - lista de prendas
    ├── upload.html               # Subir nueva prenda
    ├── generate.html             # Generar outfit por ocasión
    ├── history.html              # Historial de outfits generados
    ├── css/
    │   └── styles.css            # Estilos globales dark mode
    └── js/
        ├── api.js                # Funciones fetch al backend
        ├── ui.js                 # Helpers Anime.js compartidos
        ├── closet.js             # Lógica index.html
        ├── upload.js             # Lógica upload.html
        ├── generate.js           # Lógica generate.html
        └── history.js            # Lógica history.html
```

---

## Requisitos Previos

- Python 3.10+
- Node.js (opcional, solo para desarrollo frontend)
- Cuenta Google Cloud con API Gemini habilitada

---

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-repositorio>
cd outfit
```

### 2. Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=sqlite:///./outfit.db

# Autenticación JWT (opcional, no usado actualmente)
SECRET_KEY=tu-clave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=168

# Gemini API
GEMINI_API_KEY=tu-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash

# Almacenamiento imágenes
UPLOAD_FOLDER=uploads
MAX_IMAGE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp

# CORS
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

> **Nota:** Obtén tu `GEMINI_API_KEY` en [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Ejecutar Backend
```bash
cd backend
uvicorn main:app --reload
```
Servidor disponible en: http://localhost:8000
Documentación API: http://localhost:8000/docs

### 5. Frontend
Abrir carpeta `frontend/` con **Live Server** (extensión VS Code) o cualquier servidor estático:
```bash
# Opción 1: VS Code Live Server (recomendado)
# Click derecho en frontend/index.html > "Open with Live Server"

# Opción 2: Python http.server
cd frontend
python -m http.server 5500
```
Frontend disponible en: http://localhost:5500

---

## Uso de la Aplicación

### 1. Subir Prendas (`upload.html`)
- Seleccionar foto de la prenda (JPG, PNG, WebP)
- Campos opcionales: Tipo, Color, Estilo (CLIP los detecta automáticamente)
- Temporada: Todas / Primavera / Verano / Otoño / Invierno
- Notas: Texto libre
- Click "Subir prenda" → La imagen se procesa (quita fondo + análisis CLIP) y aparece en el closet

### 2. Ver Closet (`index.html`)
- Grid de todas las prendas con imagen y tipo
- Click en una prenda → Lightbox con detalle completo (imagen grande, tipo, color, estilo, temporada, notas)
- En lightbox: **Editar** (modifica metadatos), **Eliminar**, **Cancelar**

### 3. Generar Outfit (`generate.html`)
- Seleccionar ocasión: Trabajo, Casual, Cita, Deporte, Evento Formal
- Click "Generar outfit" → Gemini analiza el closet y sugiere combinación
- Resultado: Descripción + grid de prendas seleccionadas con animación escalonada

### 4. Historial (`history.html`)
- Lista de outfits generados ordenados por fecha (más reciente primero)
- Click en outfit → Lightbox con ocasión, fecha, descripción y prendas que lo componen
- Botón "Eliminar outfit" en el lightbox

---

## API Endpoints

### Prendas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/clothes/` | Lista todas las prendas |
| POST | `/clothes/` | Sube prenda (multipart/form-data con imagen) |
| PUT | `/clothes/{id}` | Actualiza metadatos (tipo, color, estilo, temporada, notas) |
| DELETE | `/clothes/{id}` | Elimina prenda e imagen del disco |

### Outfits
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/outfits/generate` | Genera outfit `{ "ocasion": "trabajo" }` |
| GET | `/outfits/history` | Historial ordenado por fecha descendente |
| GET | `/outfits/history/{id}` | Detalle de outfit con prendas completas |
| DELETE | `/outfits/history/{id}` | Elimina outfit del historial |

### Utilidades
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Verifica servidor funcionando |
| GET | `/uploads/{filename}` | Sirve imágenes estáticas |

---

## Flujo de Subida de Prenda

```
imagen recibida
    → guardar en uploads/ con nombre uuid
    → abrir bytes desde disco
    → remover fondo con rembg
    → analizar con CLIP (tipo, color, estilo)
    → si el usuario no llenó el campo, usar resultado de CLIP
    → guardar en base de datos (imagen sin fondo como PNG)
```

## Flujo de Generación de Outfit

```
ocasion recibida
    → obtener todas las prendas de la DB
    → armar prompt con lista de prendas + ocasión
    → llamar a Gemini
    → parsear JSON de respuesta
    → guardar en outfit_history
    → retornar prendas completas al frontend
```

---

## Convenciones de Código

### Python (Backend)
- Variables/funciones: **snake_case** en español (`crear_prenda`, `obtener_prendas`)
- Clases: **PascalCase** en inglés (`Clothing`, `OutfitHistory`)
- Capas: routers → services → ai/
- Routers sin lógica de negocio

### JavaScript (Frontend)
- Funciones: **camelCase** en español (`cargarPrendas`, `crearCard`)
- `api.js` único archivo con fetch al backend
- Try/catch en funciones async

### CSS
- Variables en `:root` (nunca hardcodear colores/tamaños)
- Dark mode: fondo `#111111`, superficie `#1C1C1C`, acento `#E8E0D5`
- Animaciones con Anime.js, respetando `prefers-reduced-motion`

---

## Scripts Útiles

```bash
# Backend - Desarrollo
cd backend && uvicorn main:app --reload

# Backend - Verificar sintaxis
cd backend && python -m py_compile routers/*.py services/*.py

# Frontend - Verificar sintaxis JS
node --check frontend/js/*.js

# Frontend - Live Server (VS Code)
# Click derecho en frontend/index.html > "Open with Live Server"
```

---

## Características Implementadas

- ✅ CRUD completo de prendas (crear, listar, ver detalle, editar, eliminar)
- ✅ Análisis automático con CLIP (tipo, color, estilo)
- ✅ Remoción de fondo automática (rembg)
- ✅ Generación de outfits con Gemini por ocasión
- ✅ Historial de outfits con detalle de prendas
- ✅ Lightboxes animados con focus trap y accesibilidad
- ✅ Toast notifications para feedback
- ✅ Empty states ilustrados con acciones
- ✅ Animaciones fluidas (stagger, fade, slide)
- ✅ Tema dark mode consistente
- ✅ Responsive design (mobile-first)
- ✅ Accesibilidad básica (ARIA, focus visible, contrastes)

---

## Roadmap / Pendientes

- [ ] Tests automatizados (backend + frontend)
- [ ] CI/CD pipeline
- [ ] Deployment (Docker, VPS, etc.)
- [ ] Filtros por tipo/color/estilo/temporada en closet
- [ ] Favoritos / "Me gustó" en historial outfits
- [ ] Estadísticas de uso del closet
- [ ] Exportar/importar datos (JSON)
- [ ] PWA para uso offline

---

## Licencia

Proyecto personal - Uso privado