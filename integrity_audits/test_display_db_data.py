from sqlalchemy import select
from datetime import date, datetime
from models import *
import json

def test_audit_all_matches(db):
    """Verifies the integrity of every entry and visualizes a sample."""
    stmt = select(Match)
    matches = db.execute(stmt).scalars().all()
    
    if not matches:
        print("No matches found in database.")
        return

    # --- Sample Visualization Section ---
    print(f"\n{'='*20} DATA SAMPLE {'='*20}")
    sample = matches[0]
    # Convert the first match object to a dictionary for clear viewing
    sample_data = {col.name: getattr(sample, col.name) for col in sample.__table__.columns}
    
    # We use indent for a "pretty print" JSON look in the terminal
    print(json.dumps(sample_data, indent=4, default=str))
    print(f"{'='*53}\n")
    # ------------------------------------

    print(f"--- Starting Audit of {len(matches)} Matches ---")
    
    non_nullable_fields = [
        "id", "vlr_id", "coreteam1_id", "coreteam2_id", 
        "winner_id", "event_id", "score", "match_stage", "match_date"
    ]
    
    for m in matches:
        errors = []
        
        # 1. Verify Date Integrity
        if not isinstance(m.match_date, date):
            errors.append(f"Invalid date type: {type(m.match_date)}")
        
        # 2. Verify Winner Logic
        if m.winner_id not in [m.coreteam1_id, m.coreteam2_id]:
            errors.append(f"Winner ID {m.winner_id} does not match coreteam1 or coreteam2")

        # 3. Verify non-nullable fields
        for field in non_nullable_fields:
            if getattr(m, field) is None:
                errors.append(f"Field '{field}' is NULL")
        
        status = "✅ PASS" if not errors else f"❌ FAIL: {', '.join(errors)}"
        print(f"ID: {m.id} | VLR_ID: {m.vlr_id} | Match Stage: {m.match_stage} | Date: {m.match_date} | {status}")

        assert not errors, f"Match ID {m.id} failed integrity check: {errors}"

    print(f"--- Audit Complete ---")


def test_audit_all_maps_played(db):
    """Verifies the integrity of every entry in the maps_played table."""
    stmt = select(MapPlayed)
    maps = db.execute(stmt).scalars().all()
    
    if not maps:
        print("\nNo map data found in database.")
        return

    # --- Sample Visualization Section ---
    print(f"\n{'='*20} MAP DATA SAMPLE {'='*20}")
    sample = maps[0]
    sample_data = {col.name: getattr(sample, col.name) for col in sample.__table__.columns}
    print(json.dumps(sample_data, indent=4, default=str))
    print(f"{'='*53}\n")

    print(f"--- Starting Audit of {len(maps)} Map Records ---")
    
    # Define fields that should never be None
    non_nullable_fields = [
        "id", "match_id", "map_number", "map_name", 
        "team1_score", "team2_score", "winner_id", "loser_id"
    ]
    
    for m in maps:
        errors = []
        
        # 1. Nullity Check
        for field in non_nullable_fields:
            if getattr(m, field) is None:
                errors.append(f"Field '{field}' is NULL")

        # 2. Logic Check: Winner and Loser cannot be the same team
        if m.winner_id == m.loser_id and m.winner_id is not None:
            errors.append(f"Winner and Loser are the same ID ({m.winner_id})")

        # 3. Logic Check: Scores should not both be zero (unless it's a forfeit/unplayed)
        if m.team1_score == 0 and m.team2_score == 0:
            errors.append("Both team scores are 0")

        # 4. Cleanup Check: Look for the \t or \n artifacts in map_name
        if m.map_name and ("\t" in m.map_name or "\n" in m.map_name):
            errors.append(f"Map name contains whitespace artifacts: {repr(m.map_name)}")

        # Display Result
        status = "✅ PASS" if not errors else f"❌ FAIL: {', '.join(errors)}"
        print(f"ID: {m.id} | Match: {m.match_id} | Map: {m.map_name} | Score: {m.team1_score}-{m.team2_score} | {status}")

        # Assert to trigger pytest failure
        assert not errors, f"Map ID {m.id} failed integrity check: {errors}"

    print(f"--- Map Audit Complete ---")
    

def test_audit_all_events(db):
    """Verifies the integrity of every entry in the events table."""
    stmt = select(Event)
    events = db.execute(stmt).scalars().all()
    
    if not events:
        print("\nNo event data found in database.")
        return

    # --- Sample Visualization Section ---
    print(f"\n{'='*20} EVENT DATA SAMPLE {'='*20}")
    sample = events[0]
    sample_data = {col.name: getattr(sample, col.name) for col in sample.__table__.columns}
    print(json.dumps(sample_data, indent=4, default=str))
    print(f"{'='*53}\n")

    print(f"--- Starting Audit of {len(events)} Event Records ---")
    
    # Define fields that should never be None based on your Model
    non_nullable_fields = ["id", "vlr_id", "name", "year", "region", "winner_id"]
    
    current_year = datetime.now().year

    for e in events:
        errors = []
        
        # 1. Nullity Check
        for field in non_nullable_fields:
            if getattr(e, field) is None:
                errors.append(f"Field '{field}' is NULL")

        # 2. Logic Check: Year Validity
        # VCT started around 2020; events shouldn't be in the far future
        if e.year and (e.year < 2020 or e.year > current_year + 1):
            errors.append(f"Suspicious year: {e.year}")

        # 3. Cleanup Check: Look for the \t or \n artifacts in event name or region
        if e.name and ("\t" in e.name or "\n" in e.name):
            errors.append(f"Event name contains whitespace artifacts: {repr(e.name)}")
        
        if e.region and ("\t" in e.region or "\n" in e.region):
            errors.append(f"Region contains whitespace artifacts: {repr(e.region)}")

        # Display Result
        status = "✅ PASS" if not errors else f"❌ FAIL: {', '.join(errors)}"
        print(f"ID: {e.id} | VLR_ID: {e.vlr_id} | Name: {e.name[:30]}... | {status}")

        # Assert to trigger pytest failure
        assert not errors, f"Event ID {e.id} failed integrity check: {errors}"

    print(f"--- Event Audit Complete ---")


def test_audit_player_map_statistics(db):
    """Verifies the integrity of every entry in the player_map_statistics table."""
    stmt = select(PlayerMapStatistics).limit(1000) # Auditing a large sample
    stats_entries = db.execute(stmt).scalars().all()
    
    if not stats_entries:
        print("\nNo player statistics data found in database.")
        return

    # --- Sample Visualization Section ---
    print(f"\n{'='*20} PLAYER STATS SAMPLE {'='*20}")
    sample = stats_entries[0]
    sample_data = {col.name: getattr(sample, col.name) for col in sample.__table__.columns}
    print(json.dumps(sample_data, indent=4, default=str))
    print(f"{'='*53}\n")

    print(f"--- Starting Audit of {len(stats_entries)} Stats Records ---")
    
    # Non-nullable fields based on your model
    required_fields = ["id", "map_played_id", "player_id", "agent", "kills", "deaths", "assists"]
    
    for s in stats_entries:
        errors = []
        
        # 1. Nullity Check for Required Fields
        for field in required_fields:
            if getattr(s, field) is None:
                errors.append(f"Required field '{field}' is NULL")

        # 2. Logic Check: Kills/Deaths/Assists should be non-negative
        if s.kills is not None and s.kills < 0:
            errors.append(f"Negative kills: {s.kills}")
        if s.deaths is not None and s.deaths < 0:
            errors.append(f"Negative deaths: {s.deaths}")

        # 3. Agent Cleanup Check
        if s.agent and ("\t" in s.agent or "\n" in s.agent):
            errors.append(f"Agent name contains artifacts: {repr(s.agent)}")

        # 4. Range Checks for Percentages (Optional fields)
        if s.hs_percent is not None and (s.hs_percent < 0 or s.hs_percent > 100):
            errors.append(f"Invalid HS%: {s.hs_percent}")
        if s.kast_percent is not None and (s.kast_percent < 0 or s.kast_percent > 100):
            errors.append(f"Invalid KAST%: {s.kast_percent}")

        # Display Result
        status = "✅ PASS" if not errors else f"❌ FAIL: {', '.join(errors)}"
        print(f"ID: {s.id} | PlayerID: {s.player_id} | MapID: {s.map_played_id} | Agent: {s.agent} | K/D/A: {s.kills}/{s.deaths}/{s.assists} | {status}")

        assert not errors, f"PlayerStat ID {s.id} failed integrity check: {errors}"

    print(f"--- Player Stats Audit Complete ---")


def test_audit_players(db):
    """Verifies the integrity of every entry in the players table."""
    stmt = select(Player).order_by(Player.id.desc()).limit(500)
    players = db.execute(stmt).scalars().all()
    
    if not players:
        print("\nNo player data found in database.")
        return

    # --- Sample Visualization Section ---
    print(f"\n{'='*20} PLAYER DATA SAMPLE {'='*20}")
    sample = players[0]
    sample_data = {col.name: getattr(sample, col.name) for col in sample.__table__.columns}
    
    # Visualizes the sample entry with indent for readability
    print(json.dumps(sample_data, indent=4, default=str))
    print(f"{'='*53}\n")

    print(f"--- Starting Audit of {len(players)} Player Records ---")
    
    # Define non-nullable fields based on your model
    required_fields = ["id", "vlr_id", "ign", "country"]
    
    for p in players:
        errors = []
        
        # 1. Nullity Check
        for field in required_fields:
            if getattr(p, field) is None:
                errors.append(f"Field '{field}' is NULL")

        # 2. Cleanup Check: Check for artifacts in IGN or Country
        # VLR often includes team tags or flags in these fields during scraping
        if p.ign and ("\t" in p.ign or "\n" in p.ign):
            errors.append(f"IGN contains whitespace artifacts: {repr(p.ign)}")
            
        if p.country and ("\t" in p.country or "\n" in p.country):
            errors.append(f"Country contains whitespace artifacts: {repr(p.country)}")

        # 3. Logic Check: Ensure ign isn't just whitespace
        if p.ign and not p.ign.strip():
            errors.append("IGN is an empty string or just whitespace")

        # Display Result
        status = "✅ PASS" if not errors else f"❌ FAIL: {', '.join(errors)}"
        print(f"ID: {p.id} | VLR_ID: {p.vlr_id} | IGN: {p.ign} | Country: {p.country} | {status}")

        # Assert to trigger pytest failure if the record is broken
        assert not errors, f"Player ID {p.id} failed integrity check: {errors}"

    print(f"--- Player Audit Complete ---")