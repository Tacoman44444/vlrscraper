from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from datetime import date
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from db.session import SessionLocal
from sqlalchemy import and_

class CoreTeam (Base):
    __tablename__ = "core_teams"
    id: Mapped[int] = mapped_column(primary_key = True)
    core_id: Mapped[int] = mapped_column(ForeignKey("cores.id"))
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable = True)

    @classmethod
    def get_by_team_id(cls, team_id: int):
        with SessionLocal() as session:
            coreteam = session.query(CoreTeam).filter(and_(CoreTeam.team_id == team_id, CoreTeam.end_date.is_(None))).first()
            if coreteam:
                return coreteam.id
            else:
                return None
        
    @classmethod
    def add_coreteam(cls, core_id: int, team_id: int, start_date: date):
        with SessionLocal() as session:
            coreteam = cls(core_id = core_id, team_id = team_id, start_date = start_date, end_date = None)
            session.add(coreteam)
            session.commit()
            session.refresh(coreteam)
            return coreteam.id                    