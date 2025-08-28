from sqlalchemy.orm import Mapped, mapped_column
from db.session import SessionLocal
from models.base import Base

class Team(Base):
    __tablename__ = "teams"
    id: Mapped[int] = mapped_column(primary_key=True)
    vlr_id: Mapped[int] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column()

    @classmethod
    def add_team(cls, vlr_id: int, name: str):
        with SessionLocal() as session:
            team = cls(vlr_id=vlr_id, name=name)
            session.add(team)
            session.commit()
            session.refresh(team) 
            return team.id

    @classmethod
    def get_by_vlr_id(cls, vlr_id: int):
        with SessionLocal() as session:
            team = session.query(Team).filter(Team.vlr_id == vlr_id).first()
            if team is None:
                return None
            else:
                return team.id