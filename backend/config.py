from dotenv import load_dotenv
import os

# Carga las variables del archivo .env que está en la raíz del proyecto
load_dotenv()


# ── Base de datos ──────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")


# ── Autenticación JWT ──────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "168"))


# ── Gemini (generación de outfits) ────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.5-flash"  # modelo gratuito con límite generoso


# ── Almacenamiento de imágenes ────────────────────────────────────────────────
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "")
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", str(10 * 1024 * 1024)))
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


# ── CORS (qué orígenes pueden llamar a la API) ────────────────────────────────
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")


# ── Validación al arrancar ────────────────────────────────────────────────────
def validate_config():
    """
    Llama esta función al iniciar el servidor para detectar
    configuración faltante antes de que explote en producción.
    """
    warnings = []

    if SECRET_KEY == "":
        warnings.append("⚠️  SECRET_KEY no configurada — usa una clave real en .env")

    if not GEMINI_API_KEY:
        warnings.append("⚠️  GEMINI_API_KEY vacía — la generación de outfits no funcionará")

    if warnings:
        print("\n" + "\n".join(warnings) + "\n")

    return len(warnings) == 0