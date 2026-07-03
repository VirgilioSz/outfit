from fastapi import UploadFile
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
import os, shutil, uuid

def guardar_imagen(imagen: UploadFile) -> str:
    # 1. Obtén la extensión y verifica que sea válida
    extension = imagen.filename.split(".")[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
            raise ValueError("Formato de imagen no válido. Solo se permiten JPG, JPEG, PNG y WEBP.")

            
    # 2. Genera nombre único con uuid y la extensión
    nombre_archivo = f"{uuid.uuid4()}.{extension}"

    # 3. Crea la carpeta uploads/ si no existe
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    ruta_completa = os.path.join(UPLOAD_FOLDER, nombre_archivo)
    with open(ruta_completa, "wb") as f:
        shutil.copyfileobj(imagen.file, f)
        
    # 4. Guarda el archivo y retorna la ruta completa
    return ruta_completa
    

def eliminar_imagen(imagen_url: str) -> None:
    # Elimina el archivo solo si existe en disco
    # usa os.path.exists() para verificar antes de os.remove()
    # así no explota si el archivo ya no está
    if os.path.exists(imagen_url):
        os.remove(imagen_url)