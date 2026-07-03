from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.clothing import Clothing
from models.outfit_history import OutfitHistory
import google.generativeai as genai
import json
from config import GEMINI_API_KEY, GEMINI_MODEL

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

router = APIRouter()

# Schema para recibir la ocasión
class GenerarOutfitRequest(BaseModel):
    ocasion: str

# ── Función auxiliar ───────────────────────────────────────────
def armar_prompt(prendas, ocasion):
    lista = ""
    for p in prendas:
        lista += f"- ID {p.id}: {p.tipo} {p.color}, estilo {p.estilo}, temporada {p.temporada}\n"
    
    return f"""
    Tengo las siguientes prendas en mi closet:
    {lista}
    
    Necesito un outfit para: {ocasion}
    
    Responde en formato JSON con esta estructura exacta:
    {{
        "prendas_ids": [1, 5, 12],
        "descripcion": "explicación de por qué combinan"
    }}
    
    Solo devuelve el JSON, sin texto extra.
    """

# ── POST /generate ─────────────────────────────────────────────
@router.post("/generate")
def generar_outfit(request: GenerarOutfitRequest, db: Session = Depends(get_db)):
    # 1. Obtén todas las prendas del closet
    prendas = db.query(Clothing).all()
    if not prendas:
        raise HTTPException(status_code=400, detail="No hay prendas en el closet")

    # 2. Llama a armar_prompt() con las prendas y la ocasión
    prompt = armar_prompt(prendas, request.ocasion)

    # 3. Llama a model.generate_content() con el prompt
    respuesta = model.generate_content(prompt)

    # 4. Parsea la respuesta JSON de Gemini
    texto = respuesta.text.strip()
    texto = texto.replace("```json", "").replace("```", "").strip()
    datos = json.loads(texto)

    # 5. Crea el objeto OutfitHistory y guárdalo en la db
    outfit_guardado = OutfitHistory(
        ocasion=request.ocasion,
        prendas_ids=datos["prendas_ids"],
        descripcion=datos["descripcion"]
    )
    db.add(outfit_guardado)
    db.commit()
    db.refresh(outfit_guardado)

    # 6. Retorna los datos del outfit + las prendas completas
    #    para que el frontend pueda mostrar las fotos
    prendas_outfit = db.query(Clothing).filter(Clothing.id.in_(datos["prendas_ids"])).all()
    return {
        "outfit_id": outfit_guardado.id,
        "ocasion": request.ocasion,
        "descripcion": datos["descripcion"],
        "prendas": prendas_outfit
    }

# ── GET /history ───────────────────────────────────────────────
@router.get("/history")
def obtener_historial(db: Session = Depends(get_db)):
    return db.query(OutfitHistory).order_by(OutfitHistory.created_at.desc()).all()

# ── DELETE /history/{id} ───────────────────────────────────────
@router.delete("/history/{outfit_id}")
def eliminar_outfit(outfit_id: int, db: Session = Depends(get_db)):
    # busca, verifica que existe, elimina y retorna mensaje
    outfit = db.query(OutfitHistory).filter(OutfitHistory.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit no encontrado")
    db.delete(outfit)
    db.commit()
    return {"message": "Outfit eliminado"}