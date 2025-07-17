from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey

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