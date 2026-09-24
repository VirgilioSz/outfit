from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from database import get_db
from services.clothing_service import crear_prenda, obtener_prendas, obtener_prenda_por_id, borrar_prenda, actualizar_prenda, obtener_prendas_filtradas, obtener_opciones_filtros

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

# ── GET / — listar todas las prendas (con filtros opcionales) ──────
@router.get("/")
def listar_prendas(
    tipo: str = Query(default=None),
    color: str = Query(default=None),
    estilo: str = Query(default=None),
    temporada: str = Query(default=None),
    db: Session = Depends(get_db)
):
    # Si no hay filtros, usar obtener_prendas (optimización)
    if not any([tipo, color, estilo, temporada]):
        return obtener_prendas(db)
    return obtener_prendas_filtradas(db, tipo, color, estilo, temporada)

# ── DELETE /{id} — eliminar prenda ────────────────────────────
@router.delete("/{prenda_id}")
def eliminar_prenda(prenda_id: int, db: Session = Depends(get_db)):
    return borrar_prenda(db, prenda_id)

# ── PUT /{id} — actualizar prenda (solo metadatos) ──────────────
@router.put("/{prenda_id}")
async def actualizar_prenda_endpoint(
    prenda_id: int,
    tipo: str = Form(default=None),
    color: str = Form(default=None),
    estilo: str = Form(default=None),
    temporada: str = Form(default=None),
    notas: str = Form(default=None),
    db: Session = Depends(get_db)
):
    # Verificar que al menos un campo viene
    campos = [tipo, color, estilo, temporada, notas]
    if all(c is None for c in campos):
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un campo para actualizar")
    
    return actualizar_prenda(db, prenda_id, tipo, color, estilo, temporada, notas)

# ── GET /filtros/opciones — obtener opciones únicas para filtros ────
@router.get("/filtros/opciones")
def obtener_opciones_filtros_endpoint(db: Session = Depends(get_db)):
    return obtener_opciones_filtros(db)