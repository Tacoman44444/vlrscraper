from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey, and_
from db.session import SessionLocal

class MatchPlayer(Base):
    __tablename__ = "match_players"
    id: Mapped[int] = mapped_column(primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"))
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    coreteam_id: Mapped[int] = mapped_column(ForeignKey("core_teams.id"))

    @classmethod
    def get_players_for_match(cls, match_id: int, coreteam_id: int):
        with SessionLocal() as session:
            match_players = session.query(MatchPlayer).filter(and_(MatchPlayer.match_id == match_id, MatchPlayer.coreteam_id == coreteam_id)).all()
            return [mp.player_id for mp in match_players]
        
    def add_matchplayer(cls, match_id: int, player_id: int, coreteam_id: int):
        with SessionLocal() as session:
            matchplayer = cls(match_id = match_id, player_id = player_id, coreteam_id = coreteam_id)
            session.add(matchplayer)
            session.commit()
            session.refresh(matchplayer)
            return matchplayer.id