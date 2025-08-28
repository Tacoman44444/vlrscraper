from sqlalchemy import func
from db.session import SessionLocal
from models import *

def get_current_players_by_coreteam(coreteam_id):
    if coreteam_id is None:
        return []
    latest_match = Match.get_latest_match(coreteam_id)
    if latest_match is None:
        return []
    else:
        return MatchPlayer.get_players_for_match(latest_match, coreteam_id)
    
def latest_five_rosters():
    with SessionLocal() as session:

        roster_counts = (
            session.query(
                CoreTeam.core_id.label("core_id"),
                MatchPlayer.match_id.label("match_id"),
                MatchPlayer.coreteam_id.label("coreteam_id"),
                func.count(func.distinct(MatchPlayer.player_id)).label("player_count"),
            ).join(CoreTeam, CoreTeam.id == MatchPlayer.coreteam_id).group_by(CoreTeam.core_id, MatchPlayer.match_id, MatchPlayer.coreteam_id).subquery()
        )
        
        full_rosters = (
            session.query(
                roster_counts.c.core_id,
                roster_counts.c.match_id,
                roster_counts.c.coreteam_id,
                Match.match_date.label("match_date"),
            ).join(Match, Match.id == roster_counts.c.match_id).filter(roster_counts.c.player_count == 5).subquery()
        )

        rn = func.row_number().over(
            partition_by=full_rosters.c.core_id,
            order_by=full_rosters.c.match_date.desc()
        ).label("rn")

        ranked = (
            session.query(
                full_rosters.c.core_id,
                full_rosters.c.match_id,
                full_rosters.c.coreteam_id,
                full_rosters.c.match_date,
                rn
            )
        ).subquery()

        latest = (
            session.query(
                ranked.c.core_id,
                ranked.c.match_id,
                ranked.c.coreteam_id,
                ranked.c.match_date
            ).filter(ranked.c.rn == 1)
             .subquery()
        )

        return latest
    
def latest_five_rosters_with_players():
    with SessionLocal() as session:
        latest = latest_five_rosters()

        rows = (
            session.query(
            latest.c.core_id,
            MatchPlayer.match_id,
            ).join(MatchPlayer, (MatchPlayer.match_id == latest.c.match_id) & (MatchPlayer.coreteam_id == latest.c.coreteam_id))
             .order_by(latest.c.core_id, MatchPlayer.player_id)
             .all()
        )

        result = {}
        for core_id, player_id in rows:
            result.setdefault(core_id, []).append(player_id)

        return result #maps coreid to list of player ids
    
