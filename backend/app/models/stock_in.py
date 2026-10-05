from sqlalchemy import ForeignKey, Float, String, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date, datetime
from typing import Optional
from app.database import Base

class StockIn(Base):
    __tablename__ = "stock_ins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id", ondelete="RESTRICT"), nullable=False, index=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False, index=True)
    qty: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    supplier_reference: Mapped[str] = mapped_column(String(200), nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    item = relationship("Item", back_populates="stock_ins")
    warehouse = relationship("Warehouse", back_populates="stock_ins")
