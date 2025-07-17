from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from datetime import date
from sqlalchemy import Date

class Core(Base):
    __tablename__ = "cores"
    id: Mapped[int] = mapped_column(primary_key = True)
    vlr_id: Mapped[int] = mapped_column(unique = True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable = True)
