from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List

VALID_CATEGORIES = ["Fabric", "Yarn", "Trim", "Accessory"]
VALID_UOMS = ["Meter", "Yard", "Kg", "Piece", "Roll", "Cone", "Set", "Box"]

class ItemBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50, description="Unique item code")
    name: str = Field(..., min_length=1, max_length=200, description="Item name")
    category: str = Field(..., description="Item category (Fabric, Yarn, Trim, Accessory)")
    uom: str = Field(..., description="Unit of Measure (Meter, Yard, Kg, Piece, etc.)")
    unit_cost: float = Field(..., ge=0.0, description="Unit cost in currency")
    reorder_level: float = Field(..., ge=0.0, description="Reorder level threshold")
    is_active: bool = Field(default=True, description="Active status")

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("Item code cannot be empty")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Item name cannot be empty")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v = v.strip()
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v

    @field_validator("uom")
    @classmethod
    def validate_uom(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Unit of measure (UOM) cannot be empty")
        return v

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    uom: Optional[str] = None
    unit_cost: Optional[float] = Field(None, ge=0.0)
    reorder_level: Optional[float] = Field(None, ge=0.0)
    is_active: Optional[bool] = None

class ItemResponse(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
