from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey, Numeric
from db.session import SessionLocal
from typing import Optional

class PlayerMapStatistics(Base):
    __tablename__ = "player_map_statistics"
    id: Mapped[int] = mapped_column(primary_key = True)
    map_played_id: Mapped[int] = mapped_column(ForeignKey("maps_played.id"))
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    agent: Mapped[str] = mapped_column()
    kills: Mapped[int] = mapped_column()
    deaths: Mapped[int] = mapped_column()
    assists: Mapped[int] = mapped_column()
    rating: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    acs: Mapped[int] = mapped_column()
    kast_percent: Mapped[Optional[int]] = mapped_column()
    adr: Mapped[int] = mapped_column()
    hs_percent: Mapped[int] = mapped_column()
    first_kills: Mapped[int] = mapped_column()
    first_deaths: Mapped[int] = mapped_column()

    @classmethod
    def add_playermapstatistic(cls, map_played_id: int, player_id: int, agent: str, kills: int, deaths: int, assists: int, rating: float, acs: int, kast_percent: int, adr: int, hs_percent: int, first_kills: int, first_deaths: int):
        with SessionLocal() as session:
            playermapstatistic = cls(map_played_id=map_played_id, player_id=player_id, agent=agent, kills=kills, deaths=deaths, assists=assists, rating=rating, acs=acs, kast_percent=kast_percent, adr=adr, hs_percent=hs_percent, first_kills=first_kills, first_deaths=first_deaths)
            session.add(playermapstatistic)
            session.commit()
            session.refresh(playermapstatistic)
            return playermapstatistic.id