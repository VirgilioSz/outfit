from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from config import CORS_ORIGINS, validate_config

# 1. Crea la instancia de FastAPI
app = FastAPI(title="Outfit", version="1.0")

# 2. Valida la configuración y crea las tablas de la base de datos al arrancar el servidor
validate_config()
create_tables()

# 3. Configura el middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Ruta de prueba GET /health
@app.get('/health')
async def health_status():
    return{"status": "ok", "message": "servidor funcionando"}

# 5. Aquí irán los routers cuando los crees, así:
#    app.include_router(users.router, prefix="/api/users", tags=["users"])
#    (por ahora déjalos comentados)