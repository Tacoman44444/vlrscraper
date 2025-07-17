from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey

class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key = True)
    vlr_id: Mapped[int] = mapped_column(unique = True)
    name: Mapped[str] = mapped_column(unique = True)
    year: Mapped[int] = mapped_column()
    region: Mapped[str] = mapped_column()
    winner_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
