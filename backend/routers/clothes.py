from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models.clothing import Clothing
from services.image_service import guardar_imagen, eliminar_imagen

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
    try:
        imagen_url = guardar_imagen(imagen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    prenda = Clothing(
        imagen_url=imagen_url,
        tipo=tipo,
        color=color,
        estilo=estilo,
        temporada=temporada,
        notas=notas
    )
    
    db.add(prenda)
    db.commit()
    db.refresh(prenda)
    
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
    eliminar_imagen(prenda.imagen_url)
    db.delete(prenda)
    db.commit()
    return {"message": "Prenda eliminada"}