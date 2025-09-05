from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey
from db.session import SessionLocal

class PlayerDuels(Base):
    __tablename__ = "players_duels"
    id: Mapped[int] = mapped_column(primary_key = True)
    map_played_id: Mapped[int] = mapped_column(ForeignKey("maps_played.id"))
    attacker_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    victim_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    kills: Mapped[int] = mapped_column()

    @classmethod
    def addplayerduels(cls, map_played_id: int, attacker_id: int, victim_id: int, kills: int):
        with SessionLocal() as session:
            playerduels = cls(map_played_id=map_played_id, attacker_id=attacker_id, victim_id=victim_id, kills=kills)
            session.add(playerduels)
            session.commit()
            session.refresh(playerduels)
            return playerduels.id
