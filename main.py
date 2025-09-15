from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session
from db.session import get_db
from models import *
from datetime import date

app = FastAPI()

@app.get('/duels')
def duels_handler(
    player1_ign: str, 
    player2_ign: str, 
    db: Session = Depends(get_db)
):
    player1 = db.query(Player).filter(Player.ign == player1_ign).first()
    player2 = db.query(Player).filter(Player.ign == player2_ign).first()

    if not (player1 and player2):
        raise HTTPException(status_code=404, detail="One or both players not found")

    player1_kills = (
        db.query(func.sum(PlayerDuels.kills))
        .filter(and_(PlayerDuels.attacker_id == player1.id, PlayerDuels.victim_id == player2.id))
        .scalar()
    ) or 0

    # aggregate kills where player2 is attacker and player1 is victim
    player2_kills = (
        db.query(func.sum(PlayerDuels.kills))
        .filter(and_(PlayerDuels.attacker_id == player2.id, PlayerDuels.victim_id == player1.id))
        .scalar()
    ) or 0
    if player1_kills == 0 and player2_kills == 0:
        raise HTTPException(status_code=404, detail="Duel stats not found")
            
    return {
        "duel": {
            player1_ign: {"kills": player1_kills},
            player2_ign: {"kills": player2_kills}
        }
    }

@app.get('/map_percentages')
def mapwinpercent_handler(
    team_vlr_id: int,
    map_name: str,
    start_date: date,
    end_date: date = date.today(),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.vlr_id == team_vlr_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    coreteams = db.query(CoreTeam).filter(CoreTeam.team_id == team.id).all()
    if not coreteams:
        raise HTTPException(status_code=404, detail="No coreteams found for this team")

    coreteam_ids = [ct.id for ct in coreteams]

    matches = (
        db.query(Match.id)
        .filter(
            or_(Match.coreteam1_id.in_(coreteam_ids), Match.coreteam2_id.in_(coreteam_ids)),
            Match.match_date >= start_date,
            Match.match_date <= end_date,
        )
        .all()
    )
    match_ids = [m.id for m in matches]

    if not match_ids:
        raise HTTPException(status_code=404, detail="No matches found in range")

    maps = (
        db.query(MapPlayed)
        .filter(
            MapPlayed.match_id.in_(match_ids),
            MapPlayed.map_name == map_name,
        )
        .all()
    )

    if not maps:
        raise HTTPException(status_code=404, detail="No maps found for this team in range")

    wins = sum(1 for m in maps if m.winner_id in coreteam_ids)
    losses = sum(1 for m in maps if m.loser_id in coreteam_ids)
    total = wins + losses

    win_percent = (wins / total * 100) if total > 0 else 0

    return {
        "team": team_vlr_id,
        "map": map_name,
        "range": {"start": start_date, "end": end_date},
        "wins": wins,
        "losses": losses,
        "total": total,
        "win_percent": win_percent,
    }