import os

class Settings:
    PROJECT_NAME: str = "Garment Export ERP Inventory System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:postgres@localhost:5432/garment_inventory"
    )

settings = Settings()
