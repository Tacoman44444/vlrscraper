from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Team(Base):
    __tablename__ = "teams"
    id: Mapped[int] = mapped_column(primary_key=True)
    vlr_id: Mapped[int] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column()
    region: Mapped[str] = mapped_column()