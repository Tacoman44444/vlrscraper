from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey

class PlayerDuels(Base):
    __tablename__ = "players_duels"
    id: Mapped[int] = mapped_column(primary_key = True)
    map_player_id: Mapped[int] = mapped_column(ForeignKey("maps_played.id"))
    attacker_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    victim_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    kills: Mapped[int] = mapped_column()