from sqlalchemy import Boolean, Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class OutfitHistory(Base):
    __tablename__ = "historial_outfits"

    id = Column(Integer, primary_key=True, index=True)
    ocasion = Column(String, nullable=False)
    prendas_ids = Column(JSON, nullable=False)
    descripcion = Column(String, nullable=True)
    le_gusto = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<OutfitHistory id={self.id} ocasion={self.ocasion} prendas_ids={self.prendas_ids}>"