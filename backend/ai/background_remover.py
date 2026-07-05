from rembg import remove

def remover_fondo(imagen_bytes: bytes) -> bytes:
    return remove(imagen_bytes)

def abrir_imagen_desde_ruta(ruta: str) -> bytes:
    with open(ruta, "rb") as f:
        return f.read()