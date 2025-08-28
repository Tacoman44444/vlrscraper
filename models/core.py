from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from datetime import date
from sqlalchemy import Date
from db.session import SessionLocal

class Core(Base):
    __tablename__ = "cores"
    id: Mapped[int] = mapped_column(primary_key = True)

    @classmethod
    def add_core(cls):
        with SessionLocal() as session:
            core = cls()
            session.add(core)
            session.commit()
            session.refresh(core)
            return core.id
