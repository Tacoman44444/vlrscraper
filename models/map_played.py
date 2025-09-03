from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey
from db.session import SessionLocal

class MapPlayed(Base):
    __tablename__ = "maps_played"
    id: Mapped[int] = mapped_column(primary_key = True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"))
    map_number: Mapped[int] = mapped_column()
    map_name: Mapped[str] = mapped_column()
    team1_score: Mapped[int] = mapped_column()
    team2_score: Mapped[int] = mapped_column()
    winner_id: Mapped[int] = mapped_column(ForeignKey("core_teams.id"))
    loser_id: Mapped[int] = mapped_column(ForeignKey("core_teams.id"))

    @classmethod
    def add_mapplayed(cls, match_id: int, map_number: int, map_name: str, team1_score: int, team2_score: int, winner_id: int, loser_id: int):
        with SessionLocal() as session:
            mapplayed = cls(match_id=match_id, map_number=map_number, map_name=map_name, team1_score=team1_score, team2_score=team2_score, winner_id=winner_id, loser_id=loser_id)
            session.add(mapplayed)
            session.commit()
            session.refresh(mapplayed)
            return mapplayed.id