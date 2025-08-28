from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base
from sqlalchemy import ForeignKey
from db.session import SessionLocal

class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key = True)
    vlr_id: Mapped[int] = mapped_column(unique = True)
    name: Mapped[str] = mapped_column(unique = True)
    year: Mapped[int] = mapped_column()
    region: Mapped[str] = mapped_column()
    winner_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))

    @classmethod
    def add_event(cls, vlr_id: int, name: str, year: int, region: str, winner_id: int):
        with SessionLocal() as session:
            event = cls(vlr_id=vlr_id, name=name, year=year, region=region, winner_id=winner_id)
            session.add(event)
            session.commit()
            session.refresh(event)
            return event.id
        
    @classmethod
    def get_by_vlr_id(cls, vlr_id: int):
        with SessionLocal() as session:
            event = session.query(Event).filter(Event.vlr_id == vlr_id).first()
            if event:
                return event.id
            else:
                return None