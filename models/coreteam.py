from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from datetime import date
from sqlalchemy import Date
from sqlalchemy import ForeignKey

class CoreTeam (Base):
    __tablename__ = "core_teams"
    id: Mapped[int] = mapped_column(primary_key = True)
    core_id: Mapped[int] = mapped_column(ForeignKey("cores.id"))
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable = True)