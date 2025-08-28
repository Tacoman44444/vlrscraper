from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from db.session import SessionLocal

class Player(Base):
    __tablename__ = "players"
    id: Mapped[int] = mapped_column(primary_key = True)
    vlr_id: Mapped[int] = mapped_column(unique = True)
    ign: Mapped[str] = mapped_column()
    country: Mapped[str] = mapped_column()

    @classmethod
    def get_by_vlr_id(cls, vlr_id: int):
        with SessionLocal() as session:
            player = session.query(Player).filter(Player.vlr_id == vlr_id).first()
            if player:
                return player.id
            else:
                return None
        
    @classmethod
    def add_player(cls, vlr_id: int, ign: str, country: str):
        with SessionLocal() as session:
            player = cls(vlr_id = vlr_id, ign = ign, country = country)
            session.add(player)
            session.commit()
            session.refresh(player)
            return player.id