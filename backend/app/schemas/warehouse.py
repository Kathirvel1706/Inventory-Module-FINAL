from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional

class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Warehouse name")
    location: str = Field(..., min_length=1, max_length=255, description="Physical location")
    is_active: bool = Field(default=True, description="Active status")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Warehouse name cannot be empty")
        return v

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Location cannot be empty")
        return v

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None

class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
