from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from models.clothing import Clothing
from services.image_service import guardar_imagen, eliminar_imagen
from ai.background_remover import remover_fondo, abrir_imagen_desde_ruta
from ai.clip_analyzer import analizar_prenda

def crear_prenda(db: Session, imagen: UploadFile, tipo: str, 
                 color: str, estilo: str, temporada: str, notas: str) -> Clothing:
    try:
        imagen_url = guardar_imagen(imagen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    imagen_bytes =abrir_imagen_desde_ruta(imagen_url)
    imagen_sin_fondo = remover_fondo(imagen_bytes)
    resultado = analizar_prenda(imagen_sin_fondo)

    if not tipo:
        tipo = resultado["tipo"]
    if not color:
        color = resultado["color"]
    if not estilo:
        estilo = resultado["estilo"]
        
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

def obtener_prendas(db: Session) -> list:
    return db.query(Clothing).all()

def obtener_prenda_por_id(db: Session, prenda_id: int) -> Clothing:
    prenda = db.query(Clothing).filter(Clothing.id == prenda_id).first()
    if not prenda:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    return prenda


def borrar_prenda(db: Session, prenda_id: int) -> dict:
    prenda = obtener_prenda_por_id(db, prenda_id)
    eliminar_imagen(prenda.imagen_url)
    db.delete(prenda)
    db.commit()
    return {"message": "Prenda eliminada"}