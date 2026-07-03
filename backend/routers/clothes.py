from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models.clothing import Clothing
import os, shutil, uuid

router = APIRouter()

# ── POST / — subir prenda ──────────────────────────────────────
@router.post("/")
async def crear_prenda(
    imagen: UploadFile = File(...),
    tipo: str = Form(...),
    color: str = Form(...),
    estilo: str = Form(...),
    temporada: str = Form(default="todas"),
    notas: str = Form(default=None),
    db: Session = Depends(get_db)
):
    # 1. Verifica que la extensión de la imagen sea válida
    extension = imagen.filename.split(".")[-1].lower()

    if extension not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(
            status_code=400,
            detail="Formato de imagen no válido. Solo se permiten JPG, JPEG, PNG y WEBP."
        )

    # 2. Genera un nombre único para el archivo con uuid
    nombre_archivo = f"{uuid.uuid4()}.{extension}"

    # 3. Guarda la imagen en la carpeta uploads/
    os.makedirs("uploads", exist_ok=True)
    ruta_completa = os.path.join("uploads", nombre_archivo)
    with open(ruta_completa, "wb") as f:
        shutil.copyfileobj(imagen.file, f)

    # 4. Crea el objeto Clothing con los datos y la ruta de la imagen
    prenda = Clothing(
        imagen_url=ruta_completa,
        tipo=tipo,
        color=color,
        estilo=estilo,
        temporada=temporada,
        notas=notas
    )
    
    # 5. db.add(), db.commit(), db.refresh()
    db.add(prenda)
    db.commit()
    db.refresh(prenda)
    
    # 6. Retorna la prenda creada
    return prenda

# ── GET / — listar todas las prendas ──────────────────────────
@router.get("/")
def listar_prendas(db: Session = Depends(get_db)):
    return db.query(Clothing).all()

# ── GET /{id} — obtener una prenda ────────────────────────────
@router.get("/{prenda_id}")
def obtener_prenda(prenda_id: int, db: Session = Depends(get_db)):
    # busca por id, si no existe lanza HTTPException 404
    prenda = db.query(Clothing).filter(Clothing.id == prenda_id).first()
    if not prenda:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    return prenda

# ── DELETE /{id} — eliminar prenda ────────────────────────────
@router.delete("/{prenda_id}")
def eliminar_prenda(prenda_id: int, db: Session = Depends(get_db)):
    prenda = db.query(Clothing).filter(Clothing.id == prenda_id).first()
    if not prenda:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    os.remove(prenda.imagen_url)
    db.delete(prenda)
    db.commit()
    return {"message": "Prenda eliminada"}