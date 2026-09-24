from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from models.clothing import Clothing
from services.image_service import guardar_imagen, eliminar_imagen, obtener_ruta_imagen, guardar_imagen_sin_fondo
from ai.background_remover import remover_fondo, abrir_imagen_desde_ruta
from ai.clip_analyzer import analizar_prenda

def crear_prenda(db: Session, imagen: UploadFile, tipo: str, 
                 color: str, estilo: str, temporada: str, notas: str) -> Clothing:
    try:
        imagen_url = guardar_imagen(imagen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    imagen_bytes = abrir_imagen_desde_ruta(str(obtener_ruta_imagen(imagen_url)))
    imagen_sin_fondo = remover_fondo(imagen_bytes)
    resultado = analizar_prenda(imagen_sin_fondo)
    imagen_url = guardar_imagen_sin_fondo(imagen_sin_fondo, imagen_url)

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

def obtener_prendas_filtradas(db: Session, tipo: str = None, color: str = None, 
                              estilo: str = None, temporada: str = None) -> list:
    query = db.query(Clothing)
    if tipo and tipo != "todos":
        query = query.filter(Clothing.tipo == tipo)
    if color and color != "todos":
        query = query.filter(Clothing.color == color)
    if estilo and estilo != "todos":
        query = query.filter(Clothing.estilo == estilo)
    if temporada and temporada != "todos":
        query = query.filter(Clothing.temporada == temporada)
    return query.all()

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


def actualizar_prenda(db: Session, prenda_id: int, tipo: str = None, 
                      color: str = None, estilo: str = None, 
                      temporada: str = None, notas: str = None) -> Clothing:
    prenda = obtener_prenda_por_id(db, prenda_id)
    
    if tipo is not None:
        prenda.tipo = tipo
    if color is not None:
        prenda.color = color
    if estilo is not None:
        prenda.estilo = estilo
    if temporada is not None:
        prenda.temporada = temporada
    if notas is not None:
        prenda.notas = notas
    
    db.commit()
    db.refresh(prenda)
    return prenda


def obtener_opciones_filtros(db: Session) -> dict:
    """Obtiene valores únicos existentes en la BD para cada campo de filtro"""
    # Obtener todos los valores únicos de cada campo
    tipos = db.query(Clothing.tipo).distinct().all()
    colores = db.query(Clothing.color).distinct().all()
    estilos = db.query(Clothing.estilo).distinct().all()
    temporadas = db.query(Clothing.temporada).distinct().all()
    
    # Convertir a listas ordenadas
    tipos_lista = sorted([t[0] for t in tipos if t[0]])
    colores_lista = sorted([c[0] for c in colores if c[0]])
    estilos_lista = sorted([e[0] for e in estilos if e[0]])
    temporadas_lista = sorted([t[0] for t in temporadas if t[0]])
    
    # Orden personalizado para temporadas
    orden_temporadas = ["todas", "primavera", "verano", "otoño", "invierno"]
    temporadas_lista = sorted(temporadas_lista, key=lambda x: orden_temporadas.index(x) if x in orden_temporadas else 999)
    
    return {
        "tipos": tipos_lista,
        "colores": colores_lista,
        "estilos": estilos_lista,
        "temporadas": temporadas_lista
    }