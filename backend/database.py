from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import DATABASE_URL

# ── Configuración especial para SQLite ────────────────────────────────────────
# check_same_thread=False es necesario porque FastAPI maneja múltiples
# requests en hilos distintos, y SQLite por defecto solo permite un hilo.
# En PostgreSQL esta línea no haría falta.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Cada request a la API obtiene su propia sesión de base de datos
# y la cierra al terminar — así no quedan conexiones colgadas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base de la que heredan todos los modelos (User, Clothing, etc.)
Base = declarative_base()


def get_db():
    """
    Dependencia de FastAPI. Se inyecta en los endpoints así:

        @app.get("/clothes")
        def get_clothes(db: Session = Depends(get_db)):
            ...

    Abre la sesión, la entrega al endpoint, y la cierra al terminar
    aunque haya habido un error (el bloque finally lo garantiza).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Crea todas las tablas en la base de datos si no existen todavía.
    Se llama una vez al arrancar el servidor desde main.py.
    Con SQLite esto también crea el archivo .db si no existe.
    """
    Base.metadata.create_all(bind=engine)