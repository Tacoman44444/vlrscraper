from models import Team, CoreTeam, Match, MapPlayed, Core
from datetime import date

def test_map_percentages_endpoint(client, db):
    team = Team(vlr_id=100, name="TestTeam")
    db.add(team)
    db.commit()
    db.refresh(team)

    core = Core()
    db.add(core)
    db.commit()
    db.refresh(core)

    coreteam = CoreTeam(core_id=core.id, team_id=team.id, start_date=date.today())
    db.add(coreteam)
    db.commit()
    db.refresh(coreteam)

    match = Match(vlr_id=1234, coreteam1_id=coreteam.id, coreteam2_id=999, winner_id=999, event_id=10, score="0-2", match_stage="Finals", match_date=date.today())
    db.add(match)
    db.commit()
    db.refresh(match)

    map1 = MapPlayed(match_id=match.id, map_number = 1, map_name="Ascent", team1_score=3, team2_score=13, winner_id=999, loser_id=coreteam.id)
    map2 = MapPlayed(match_id=match.id, map_number = 2, map_name="Haven", team1_score=3, team2_score=13, winner_id=999, loser_id=coreteam.id)
    db.add_all([map1, map2])
    db.commit()

    response = client.get("/map_percentages", params={
        "team_vlr_id": 100,
        "map_name": "Ascent",
        "start_date": date.today().isoformat(),
        "end_date": date.today().isoformat()
    })
    assert response.status_code == 200
    data = response.json()
    assert data["wins"] == 0
    assert data["losses"] == 1
    assert data["total"] == 1
    assert data["win_percent"] == 0
