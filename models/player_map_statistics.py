from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey

class PlayerMapStatistics(Base):
    __tablename__ = "player_map_statistics"
    id: Mapped[int] = mapped_column(primary_key = True)
    map_played_id: Mapped[int] = mapped_column(ForeignKey("maps_played.id"))
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    agent: Mapped[str] = mapped_column()
    kills: Mapped[int] = mapped_column()
    deaths: Mapped[int] = mapped_column()
    acs: Mapped[int] = mapped_column()
    first_kills: Mapped[int] = mapped_column()
    first_deaths: Mapped[int] = mapped_column()
