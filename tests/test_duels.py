from models import Player, PlayerDuels, MapPlayed

def test_duels_endpoint(client, db):
    p1 = Player(vlr_id=1, ign="player1", country="Turkey")
    p2 = Player(vlr_id=2, ign="player2", country="Russia")
    db.add_all([p1, p2])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)

    map_played = MapPlayed(
        match_id=1,
        map_number = 1,
        map_name="Ascent",
        team1_score=13,
        team2_score=4,
        winner_id=110101,
        loser_id=1010100
    )

    db.add(map_played)
    db.commit()
    db.refresh(map_played)

    d1 = PlayerDuels(map_played_id=map_played.id, attacker_id=p1.id, victim_id=p2.id, kills=3)
    d3 = PlayerDuels(map_played_id=map_played.id, attacker_id=p2.id, victim_id=p1.id, kills=1)
    db.add_all([d1, d3])
    db.commit()

    response = client.get("/duels", params={"player1_ign": "player1", "player2_ign": "player2"})
    assert response.status_code == 200
    data = response.json()
    assert data["duel"]["player1"]["kills"] == 3
    assert data["duel"]["player2"]["kills"] == 1
