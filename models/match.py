from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey
from datetime import date
from sqlalchemy import Date

class Match(Base):
    __tablename__ = "matches"
    id: Mapped[int] = mapped_column(primary_key = True)
    vlr_id: Mapped[int] = mapped_column(unique = True)
    coreteam1_id: Mapped[int] = mapped_column(ForeignKey("core_teams.id"))
    coreteam2_id: Mapped[int] = mapped_column(ForeignKey("core_teams.id"))
    winner_id: Mapped[int] = mapped_column(ForeignKey("core_teams.id"))
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    score: Mapped[str] = mapped_column()
    match_stage: Mapped[str] = mapped_column()
    match_date: Mapped[date] = mapped_column(Date)
