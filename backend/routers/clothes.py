from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from services.clothing_service import crear_prenda, obtener_prendas, obtener_prenda_por_id, borrar_prenda

router = APIRouter()

# ── POST / — subir prenda ──────────────────────────────────────
@router.post("/")
async def crear_prenda_endpoint(
    imagen: UploadFile = File(...),
    tipo: str = Form(default=None),
    color: str = Form(default=None),
    estilo: str = Form(default=None),
    temporada: str = Form(default="todas"),
    notas: str = Form(default=None),
    db: Session = Depends(get_db)
):
    return crear_prenda(db, imagen, tipo, color, estilo, temporada, notas)

# ── GET / — listar todas las prendas ──────────────────────────
@router.get("/")
def listar_prendas(db: Session = Depends(get_db)):
    return obtener_prendas(db)

# ── GET /{id} — obtener una prenda ────────────────────────────
@router.get("/{prenda_id}")
def obtener_prenda(prenda_id: int, db: Session = Depends(get_db)):
    return obtener_prenda_por_id(db, prenda_id)

# ── DELETE /{id} — eliminar prenda ────────────────────────────
@router.delete("/{prenda_id}")
def eliminar_prenda(prenda_id: int, db: Session = Depends(get_db)):
    return borrar_prenda(db, prenda_id)