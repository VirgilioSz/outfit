from fastapi import UploadFile
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
import shutil
import uuid
from pathlib import Path


def obtener_carpeta_uploads() -> Path:
    carpeta = Path(UPLOAD_FOLDER or "uploads")
    if not carpeta.is_absolute():
        carpeta = Path(__file__).resolve().parents[1] / carpeta
    return carpeta.resolve()


def obtener_ruta_imagen(imagen_url: str) -> Path:
    nombre_archivo = imagen_url.replace("\\", "/").rsplit("/", 1)[-1]
    if nombre_archivo in {"", ".", ".."}:
        raise ValueError("Ruta de imagen no válida")
    carpeta = obtener_carpeta_uploads()
    ruta = (carpeta / nombre_archivo).resolve()
    if ruta.parent != carpeta:
        raise ValueError("Ruta de imagen no válida")
    return ruta

def guardar_imagen(imagen: UploadFile) -> str:
    # 1. Obtén la extensión y verifica que sea válida
    extension = imagen.filename.split(".")[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
            raise ValueError("Formato de imagen no válido. Solo se permiten JPG, JPEG, PNG y WEBP.")

            
    # 2. Genera nombre único con uuid y la extensión
    nombre_archivo = f"{uuid.uuid4()}.{extension}"

    carpeta = obtener_carpeta_uploads()
    carpeta.mkdir(parents=True, exist_ok=True)
    ruta_completa = carpeta / nombre_archivo
    with open(ruta_completa, "wb") as f:
        shutil.copyfileobj(imagen.file, f)

    return f"/uploads/{nombre_archivo}"
    

def eliminar_imagen(imagen_url: str) -> None:
    ruta = obtener_ruta_imagen(imagen_url)
    ruta.unlink(missing_ok=True)