from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey, desc
from datetime import date
from sqlalchemy import Date
from db.session import SessionLocal

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

    @classmethod
    def get_latest_match(cls, coreteam_id):
        with SessionLocal() as session:
            match = session.query(Match).filter((Match.coreteam1_id == coreteam_id) | (Match.coreteam2_id == coreteam_id)).order_by(desc(Match.match_date)).first()

            if match:
                return match.id
            else:
                return None
            
    @classmethod
    def add_match(cls, vlr_id: int, coreteam1_id: int, coreteam2_id: int, winner_id: int, event_id: int, score: int, match_stage: str, match_date: date):
        with SessionLocal() as session:
            match = cls(vlr_id = vlr_id, coreteam1_id = coreteam1_id, coreteam2_id = coreteam2_id, winner_id = winner_id, event_id = event_id, score = score, match_stage = match_stage, match_date = match_date)
            session.add(match)
            session.commit()
            session.refresh(match)
            return match.id
        
    @classmethod
    def get_coreteams_of_match(cls, match_id):
        with SessionLocal() as session:
            match = session.query(Match).filter(Match.id == match_id).first()

            if match:
                return [match.coreteam1_id, match.coreteam2_id]
            else:
                return None