from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import io

# Carga el modelo una sola vez — tarda la primera vez pero se queda en memoria
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Opciones que CLIP va a evaluar
TIPOS = ["camiseta", "camisa", "blusa", "sudadera", "abrigo", 
         "chaqueta", "pantalon", "jeans", "shorts", "falda", 
         "vestido", "zapatos", "tenis", "botas", "sandalias"]

COLORES = ["negro", "blanco", "gris", "azul", "rojo", "verde",
           "amarillo", "naranja", "morado", "rosa", "cafe", "beige"]

ESTILOS = ["casual", "formal", "deportivo", "elegante"]

def bytes_a_imagen(imagen_bytes: bytes):
    return Image.open(io.BytesIO(imagen_bytes))

def comparar_imagen_con_textos(imagen_pil, textos: list) -> str:
    inputs = processor(text=textos, images=imagen_pil, return_tensors="pt", padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probabilities = torch.softmax(logits_per_image, dim=1)
    return textos[probabilities.argmax().item()]

def analizar_prenda(imagen_bytes: bytes) -> dict:
    imagen_pil = bytes_a_imagen(imagen_bytes)
    tipo = comparar_imagen_con_textos(imagen_pil, TIPOS)
    color = comparar_imagen_con_textos(imagen_pil, COLORES)
    estilo = comparar_imagen_con_textos(imagen_pil, ESTILOS)
    return {"tipo": tipo, "color": color, "estilo": estilo}