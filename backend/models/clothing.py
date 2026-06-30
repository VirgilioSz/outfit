from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Clothing(Base):
    __tablename__ = "prendas"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)
    color = Column(String, nullable=False)
    estilo = Column(String, nullable=False)
    temporada = Column(String, default="todas")
    imagen_url = Column(String, nullable=False)
    ai_metadata = Column(JSON, nullable=True)
    notas = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Clothing id={self.id} tipo={self.tipo} color={self.color}>"