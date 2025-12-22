import logging
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session
from db.session import get_db
from models import *
from datetime import date
from pydantic import BaseModel

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

app = FastAPI()

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlayerMapStatisticsSchema(BaseModel):
    id: int
    map_played_id: int
    player_id: int
    agent: str
    kills: int
    deaths: int
    assists: int
    rating: float | None
    acs: int | None
    kast_percent: int | None
    adr: int | None
    hs_percent: int | None
    first_kills: int | None
    first_deaths: int | None

    model_config = {"from_attributes": True}

class MapDuelData(BaseModel):
    map_name: str
    winner_name: str
    loser_name: str
    winner_score: int
    loser_score: int
    winner_statistics: list[PlayerMapStatisticsSchema]
    loser_statistics: list[PlayerMapStatisticsSchema]

class MapData(BaseModel):
    map_name: str
    result: str
    team_score: int
    opponent_score: int
    opponent_name: str
    agent_comp: list[str]

class MatchData(BaseModel):
    vlr_id: int
    winner_name: str
    loser_name: str
    score: str
    maps: list[MapDuelData]

@app.get(
        '/maps',
        summary="Get list of all VALORANT maps",
        description="Returns a list of all VALORANT maps used in competitive play."
        )
def maps_handler():
    map_list = ["Corrode", "Breeze", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Ascent", "Sunset", "Bind", "Abyss"]
    return {"maps": map_list}


@app.get(
        '/player_igns',
        summary="Get list of all player in-game names (IGNs)",
        description="Returns a list of all player in-game names (IGNs) in the database."
        )
def played_igns_handler(
    db: Session = Depends(get_db),
):
    players = db.query(Player).all()
    igns = [player.ign for player in players]
    return {"player_igns": igns}


@app.get(
        '/teams',
        summary="Get list of all teams",
        description="Returns a list of all teams in the database with their VLR IDs and names."
        )
def teams_handler(
    db: Session = Depends(get_db),
):
    teams = db.query(Team).all()
    team_list = [{"vlr_id": team.vlr_id, "name": team.name} for team in teams]
    return {"teams": team_list}


@app.get(
        '/player_duels',
        summary="Get duel statistics between two players",
        description="Returns the number of times the two players have eliminated each other in competitive play"
        )
def player_duels_handler(
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


@app.get(
        '/team_duels',
        summary="Get match statistics between two teams",
        description="Returns the number of matches played between two teams and their respective wins. Also returns detailed match data for each encounter."
        )
def team_duels_handler(
    team1_vlr_id: int,
    team2_vlr_id: int,
    db: Session = Depends(get_db)
):
    team1 = db.query(Team).filter(Team.vlr_id == team1_vlr_id).first()
    team2 = db.query(Team).filter(Team.vlr_id == team2_vlr_id).first()

    if not (team1 and team2):
        raise HTTPException(status_code=404, detail="One or both teams not found")

    coreteams1 = db.query(CoreTeam).filter(CoreTeam.team_id == team1.id).all()
    coreteams2 = db.query(CoreTeam).filter(CoreTeam.team_id == team2.id).all()

    if not (coreteams1 and coreteams2):
        raise HTTPException(status_code=404, detail="One or both teams have no coreteams")

    coreteam1_ids = [ct.id for ct in coreteams1]
    coreteam2_ids = [ct.id for ct in coreteams2]

    matches = (
        db.query(Match)
        .filter(
            or_(
                and_(Match.coreteam1_id.in_(coreteam1_ids), Match.coreteam2_id.in_(coreteam2_ids)),
                and_(Match.coreteam1_id.in_(coreteam2_ids), Match.coreteam2_id.in_(coreteam1_ids))
            )
        )
        .all()
    )

    team1_wins = sum(1 for match in matches if match.winner_id in coreteam1_ids)
    team2_wins = sum(1 for match in matches if match.winner_id in coreteam2_ids)


    if len(matches) != team1_wins + team2_wins:
        raise HTTPException(status_code=500, detail="Data inconsistency detected")

    match_ids = [m.id for m in matches]
    if not match_ids:
        raise HTTPException(status_code=404, detail="No matches found between these teams")
    
    matchHistory = []
    
    #need player data for each match
    for match in matches:
        # get the maps for each match
        maps = db.query(MapPlayed).filter(MapPlayed.match_id == match.id).all()
        team1_data = db.query(MatchPlayer).filter(and_(MatchPlayer.match_id == match.id, MatchPlayer.coreteam_id.in_(coreteam1_ids))).all()
        team2_data = db.query(MatchPlayer).filter(and_(MatchPlayer.match_id == match.id, MatchPlayer.coreteam_id.in_(coreteam2_ids))).all()
        team1_players = [data.player_id for data in team1_data]
        team2_players = [data.player_id for data in team2_data]

        team1_id = db.query(CoreTeam).filter(CoreTeam.id == match.coreteam1_id).first().team_id
        team2_id = db.query(CoreTeam).filter(CoreTeam.id == match.coreteam2_id).first().team_id
        team1_name = db.query(Team).filter(Team.id == team1_id).first().name
        team2_name = db.query(Team).filter(Team.id == team2_id).first().name

        matchData = MatchData(  vlr_id=match.vlr_id,
                                winner_name=team1_name if match.winner_id==match.coreteam1_id else team2_name,
                                loser_name=team2_name if match.winner_id==match.coreteam1_id else team1_name,
                                score=match.score,
                                maps=[]
                            )

        # get the players for each map
        for map in maps:
            player_statistics = db.query(PlayerMapStatistics).filter(PlayerMapStatistics.map_played_id == map.id).all()
            team1_statistics = []
            team2_statistics = []
            for stats in player_statistics:
                if stats.player_id in team1_players:
                    team1_statistics.append(stats)
                elif stats.player_id in team2_players:
                    team2_statistics.append(stats)

            winner_team_id = db.query(CoreTeam).filter(CoreTeam.id == map.winner_id).first().team_id
            loser_team_id = db.query(CoreTeam).filter(CoreTeam.id == map.loser_id).first().team_id
            winner_team_name = db.query(Team).filter(Team.id == team1_id).first().name
            loser_team_name = db.query(Team).filter(Team.id == team2_id).first().name
            
            mapData = MapDuelData(  map_name=map.map_name,
                                winner_name=winner_team_name,
                                loser_name=loser_team_name,
                                winner_score=map.team1_score if map.team1_score > map.team2_score else map.team2_score,
                                loser_score=map.team1_score if map.team1_score < map.team2_score else map.team2_score,
                                winner_statistics=team1_statistics if map.team1_score > map.team2_score else team2_statistics,
                                loser_statistics=team1_statistics if map.team1_score < map.team2_score else team2_statistics
                            )
            # append mapData to match data
            matchData.maps.append(mapData)

        matchHistory.append(matchData)
    
    return {
        "team1_ign": team1.name,
        "team2_ign": team2.name,
        "number_of_matches": len(match_ids),
        "team1_wins": team1_wins,
        "team2_wins": team2_wins,
        "matches": matchHistory,
    }


@app.get(
        '/map_percentages/filtered',
        summary="Get map win percentage for a team on a specific map within a date range",
        description="Returns the map win percentage of a team on a specific map within a given date range, along with wins, losses, and total games played."
        )
def filtered_mapwinpercent_handler(
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


@app.get(
        '/map_percentages/overall_excluding',
        summary="Get overall map win percentage for a team excluding specific maps within a date range",
        description="Returns the overall map win percentage of a team excluding specific maps within a given date range, along with wins, losses, and total games played."
        )
def overall_mapwinpercent_exclude_handler(
    team_vlr_id: int,
    start_date: date,
    exclude_maps: list[str] = Query(default=[]),
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
            ~MapPlayed.map_name.in_(exclude_maps),
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
        "excluded_maps": exclude_maps,
        "range": {"start": start_date, "end": end_date},
        "wins": wins,
        "losses": losses,
        "total": total,
        "win_percent": win_percent,
    }


@app.get(
        '/map_percentages/overall',
        summary="Get overall map win percentage for a team within a date range",
        description="Returns the overall map win percentage of a team within a given date range, along with wins, losses, and total games played."
        )
def overall_mapwinpercent_handler(
    team_vlr_id: int,
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
        "range": {"start": start_date, "end": end_date},
        "wins": wins,
        "losses": losses,
        "total": total,
        "win_percent": win_percent,
    }


@app.get(
        '/mapdata/filtered',
        summary="Get detailed map data for a team on a specific map within a date range",
        description="Returns detailed map data for a team on a specific map within a given date range."
        )
def filtered_mapdata_handler(
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

    stmt = (
        select(MapPlayed)
        .join(Match, MapPlayed.match_id == Match.id)
        .where(
            Match.match_date.between(start_date, end_date),
            or_(
                Match.coreteam1_id.in_(coreteam_ids),
                Match.coreteam2_id.in_(coreteam_ids),
            ),
            MapPlayed.map_name == map_name,
        )
    )

    maps = db.execute(stmt).scalars().all()
    if not maps:
        raise HTTPException(status_code=404, detail="No maps found for this team in range")
    
    map_data_list = []
    for map in maps:
        match = db.query(Match).filter(Match.id == map.match_id).first()
        if not match:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, match missing")

        if map.winner_id in coreteam_ids:
            won = True
            team_coreteam_id = map.winner_id
            opponent_coreteam_id = map.loser_id
        else:
            won = False
            team_coreteam_id = map.loser_id
            opponent_coreteam_id = map.winner_id

        if team_coreteam_id == match.coreteam1_id:
            team_score = map.team1_score
            opponent_score = map.team2_score
        else:
            team_score = map.team2_score
            opponent_score = map.team1_score

        opponent_coreteam = db.query(CoreTeam).filter(CoreTeam.id == opponent_coreteam_id).first()
        if not opponent_coreteam:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, opponent coreteam missing")
        opponent_team = db.query(Team).filter(Team.id == opponent_coreteam.team_id).first()
        if not opponent_team:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, opponent team missing")
        

        name = map.map_name
        opponent_name = opponent_team.name

        player_ids = db.query(MatchPlayer.player_id).filter(MatchPlayer.coreteam_id == team_coreteam_id, MatchPlayer.match_id == map.match_id).all()
        player_stats = db.query(PlayerMapStatistics).filter(PlayerMapStatistics.map_played_id == map.id).all()
        if not player_stats:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, player stats missing")
        
        agent_comp = [stat.agent for stat in player_stats if stat.player_id in [pid[0] for pid in player_ids]]

        if team_score > opponent_score:
            result = "Win"
        elif team_score < opponent_score:
            result = "Loss"

        map_data = MapData(
            map_name=name,
            result=result,
            team_score=team_score,
            opponent_score=opponent_score,
            opponent_name=opponent_name,
            agent_comp=agent_comp
        )

        map_data_list.append(map_data)

    return {
        "map_data": map_data_list
    }


@app.get( 
        '/mapdata/overall',
        summary="Get detailed map data for a team within a date range",
        description="Returns detailed map data for a team within a given date range."
        )
def overall_mapdata_handler(
        team_vlr_id: int, 
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

    stmt = (
        select(MapPlayed)
        .join(Match, MapPlayed.match_id == Match.id)
        .where(
            Match.match_date.between(start_date, end_date),
            or_(
                Match.coreteam1_id.in_(coreteam_ids),
                Match.coreteam2_id.in_(coreteam_ids),
            ),
        )
    )

    maps = db.execute(stmt).scalars().all()
    if not maps:
        raise HTTPException(status_code=404, detail="No maps found for this team in range")
    
    map_data_list = []
    for map in maps:
        match = db.query(Match).filter(Match.id == map.match_id).first()
        if not match:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, match missing")

        if map.winner_id in coreteam_ids:
            won = True
            team_coreteam_id = map.winner_id
            opponent_coreteam_id = map.loser_id
        else:
            won = False
            team_coreteam_id = map.loser_id
            opponent_coreteam_id = map.winner_id

        if team_coreteam_id == match.coreteam1_id:
            team_score = map.team1_score
            opponent_score = map.team2_score
        else:
            team_score = map.team2_score
            opponent_score = map.team1_score

        opponent_coreteam = db.query(CoreTeam).filter(CoreTeam.id == opponent_coreteam_id).first()
        if not opponent_coreteam:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, opponent coreteam missing")
        opponent_team = db.query(Team).filter(Team.id == opponent_coreteam.team_id).first()
        if not opponent_team:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, opponent team missing")
        

        name = map.map_name
        opponent_name = opponent_team.name  
        player_ids = db.query(MatchPlayer.player_id).filter(MatchPlayer.coreteam_id == team_coreteam_id, MatchPlayer.match_id == map.match_id).all()
        player_stats = db.query(PlayerMapStatistics).filter(PlayerMapStatistics.map_played_id == map.id).all()
        if not player_stats:
            raise HTTPException(status_code=500, detail="Data inconsistency detected, player stats missing")    
        agent_comp = [stat.agent for stat in player_stats if stat.player_id in [pid[0] for pid in player_ids]]
        if team_score > opponent_score:
            result = "Win"
        elif team_score < opponent_score:
            result = "Loss"

        map_data = MapData(
            map_name=name,
            result=result,
            team_score=team_score,
            opponent_score=opponent_score,
            opponent_name=opponent_name,
            agent_comp=agent_comp
        )
        map_data_list.append(map_data)

    
    return {
        "map_data": map_data_list
    }


