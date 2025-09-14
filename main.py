from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session
from db.session import get_db
from models import *

app = FastAPI()

@app.get('/duels')
def duels_handler(player1_ign: str, player2_ign: str, db: Session = Depends(get_db)):
    player1 = db.query(Player).filter(Player.ign == player1_ign).first()
    player2 = db.query(Player).filter(Player.ign == player2_ign).first()

    if player1 and player2:
        player1_stats = db.query(PlayerDuels).filter(and_(PlayerDuels.attacker_id == player1.id, PlayerDuels.victim_id == player2.id)).first()
        player2_stats = db.query(PlayerDuels).filter(and_(PlayerDuels.attacker_id == player2.id, PlayerDuels.victim_id == player1.id)).first()
        if player1_stats and player2_stats:
                
            return {
                "duel": {
                    player1_ign: {"kills": player1_stats.kills},
                    player2_ign: {"kills": player2_stats.kills}
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Duel stats not found")
    else:
        raise HTTPException(status_code=404, detail="One or both players not found")
