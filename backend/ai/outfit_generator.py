import google.generativeai as genai
import json
from config import GEMINI_API_KEY, GEMINI_MODEL

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

def armar_prompt(prendas: list, ocasion: str) -> str:
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

def parsear_respuesta(texto: str) -> dict:
    texto = texto.strip()
    texto = texto.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        raise ValueError("Respuesta no válida, no se pudo parsear como JSON")

def generar_outfit(prendas: list, ocasion: str) -> dict:
    prompt = armar_prompt(prendas, ocasion)
    respuesta = model.generate_content(prompt)
    datos = parsear_respuesta(respuesta.text)
    return datos