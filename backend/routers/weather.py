from fastapi import APIRouter, HTTPException
import requests
from config import OPENWEATHER_API_KEY

router = APIRouter()

@router.get("/")
def obtener_clima():
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="API key de clima no configurada")
    
    url = f"https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": "Saltillo,Coahuila,MX",
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "es"
    }
    
    response = requests.get(url, params=params)
    
    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener el clima")
    
    return response.json()