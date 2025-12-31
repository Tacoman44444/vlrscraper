"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Swords, Zap, Trophy, Skull, Target, Users, ChevronDown, Map, User } from "lucide-react";

const API_BASE = "http://localhost:8000";

interface Team {
    vlr_id: number;
    name: string;
}

interface PlayerMapStatistics {
    id: number;
    map_played_id: number;
    player_id: number;
    player_ign: string;
    agent: string;
    kills: number;
    deaths: number;
    assists: number;
    rating: number | null;
    acs: number | null;
    kast_percent: number | null;
    adr: number | null;
    hs_percent: number | null;
    first_kills: number | null;
    first_deaths: number | null;
}

interface MapDuelData {
    map_name: string;
    winner_name: string;
    loser_name: string;
    winner_score: number;
    loser_score: number;
    winner_statistics: PlayerMapStatistics[];
    loser_statistics: PlayerMapStatistics[];
}

interface MatchData {
    vlr_id: number;
    winner_name: string;
    loser_name: string;
    score: string;
    maps: MapDuelData[];
}

interface TeamDuelsResponse {
    team1_ign: string;
    team2_ign: string;
    number_of_matches: number;
    team1_wins: number;
    team2_wins: number;
    matches: MatchData[];
}

interface TeamSelectProps {
    value: Team | null;
    onChange: (team: Team | null) => void;
    teams: Team[];
    placeholder: string;
    color: "red" | "blue";
    isLoading: boolean;
}

function Particles({ color, direction }: { color: "red" | "blue"; direction: "left" | "right" }) {
    const particleCount = 12;
    const colorClass = color === "red" ? "bg-red-500" : "bg-blue-500";
    const [particles, setParticles] = useState<Array<{ top: number; left: number; duration: number; delay: number }>>([]);

    useEffect(() => {
        const generatedParticles = Array.from({ length: particleCount }).map(() => ({
            top: 10 + Math.random() * 80,
            left: direction === "right" ? Math.random() * 30 : 70 + Math.random() * 30,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 3,
        }));
        setParticles(generatedParticles);
    }, [direction, particleCount]);

    if (particles.length === 0) {
        return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
    }

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle, i) => (
                <div
                    key={i}
                    className={`absolute w-1 h-1 ${colorClass} rounded-full opacity-40`}
                    style={{
                        top: `${particle.top}%`,
                        left: `${particle.left}%`,
                        animation: `particle-flow-${direction} ${particle.duration}s linear infinite`,
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}


function EnergyLine() {
    return (
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px overflow-hidden pointer-events-none hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
            <div
                className="absolute w-full h-20 bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-60"
                style={{ animation: "energy-pulse 2s ease-in-out infinite" }}
            />
            <div
                className="absolute w-full h-10 bg-gradient-to-b from-transparent via-white to-transparent opacity-40"
                style={{ animation: "energy-pulse 2s ease-in-out infinite", animationDelay: "0.5s" }}
            />
        </div>
    );
}

function TeamSelect({ value, onChange, teams, placeholder, color, isLoading }: TeamSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const filtered = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const colorClasses = {
        red: {
            border: "border-red-500/30",
            borderHover: "hover:border-red-500/60",
            borderFocus: "border-red-500",
            glow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
            glowInner: "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(239,68,68,0.2)]",
            text: "text-red-400",
            bg: "bg-red-500/10",
            highlight: "hover:bg-red-500/20",
            gradient: "from-red-500/20 to-red-600/10",
            bevel: "before:bg-gradient-to-b before:from-white/5 before:to-transparent",
        },
        blue: {
            border: "border-blue-500/30",
            borderHover: "hover:border-blue-500/60",
            borderFocus: "border-blue-500",
            glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
            glowInner: "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(59,130,246,0.2)]",
            text: "text-blue-400",
            bg: "bg-blue-500/10",
            highlight: "hover:bg-blue-500/20",
            gradient: "from-blue-500/20 to-blue-600/10",
            bevel: "before:bg-gradient-to-b before:from-white/5 before:to-transparent",
        },
    }[color];

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => !isLoading && setIsOpen(!isOpen)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`
          relative flex items-center gap-3 px-5 py-4 
          bg-gradient-to-b ${colorClasses.gradient}
          backdrop-blur-xl border-2 ${colorClasses.border} ${colorClasses.borderHover}
          rounded-2xl cursor-pointer 
          transition-all duration-300 ease-out
          before:absolute before:inset-0 before:rounded-2xl ${colorClasses.bevel} before:pointer-events-none
          ${isOpen || isFocused ? `${colorClasses.borderFocus} ${colorClasses.glow}` : colorClasses.glowInner}
        `}
            >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border}`}>
                    <Users className={`w-5 h-5 ${colorClasses.text}`} />
                </div>
                <span className={`flex-1 font-rajdhani text-lg font-semibold ${value ? "text-white" : "text-gray-500"}`}>
                    {value?.name || placeholder}
                </span>
                <ChevronDown className={`w-5 h-5 ${colorClasses.text} transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div
                    className={`
            absolute top-full left-0 right-0 mt-3 
            bg-[#0a0a12]/95 backdrop-blur-2xl 
            border-2 ${colorClasses.border} rounded-2xl 
            overflow-hidden z-50 
            shadow-2xl ${colorClasses.glow}
            animate-fade-in-up
          `}
                >
                    <div className="p-3 border-b border-white/10">
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colorClasses.text}`} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search teams..."
                                className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border ${colorClasses.border} rounded-xl text-white text-sm placeholder:text-gray-500 outline-none focus:${colorClasses.borderFocus} transition-colors`}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-4 text-gray-500 text-sm text-center">No teams found</div>
                        ) : (
                            filtered.slice(0, 20).map((team) => (
                                <div
                                    key={team.vlr_id}
                                    onClick={() => {
                                        onChange(team);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`
                    px-4 py-3 cursor-pointer transition-all duration-200
                    ${colorClasses.highlight} 
                    ${team.vlr_id === value?.vlr_id ? `${colorClasses.bg} border-l-2 ${colorClasses.borderFocus}` : "border-l-2 border-transparent"}
                  `}
                                >
                                    <span className="font-rajdhani text-white font-medium">{team.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">#{team.vlr_id}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: "red" | "blue" }) {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    const colorClasses = color === "red"
        ? "from-red-600 via-red-500 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
        : "from-blue-600 via-blue-500 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]";

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">{label}</span>
                <span className={`font-rajdhani text-3xl font-bold ${color === "red" ? "text-red-400" : "text-blue-400"} drop-shadow-[0_0_10px_currentColor]`}>
                    {value}
                </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                    className={`h-full bg-gradient-to-r ${colorClasses} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function PlayerStatRow({ stat, isWinner }: { stat: PlayerMapStatistics; isWinner: boolean }) {
    const textColor = isWinner ? "text-green-400" : "text-red-400";
    const bgColor = isWinner ? "bg-green-500/5" : "bg-red-500/5";

    return (
        <div className={`flex items-center gap-3 py-2 px-3 ${bgColor} rounded-lg hover:bg-white/5 transition-colors`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <User className={`w-4 h-4 ${textColor} flex-shrink-0`} />
                <div className="flex flex-col min-w-0">
                    <span className="font-rajdhani font-semibold text-white truncate">
                        {stat.player_ign}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                        {stat.agent}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-center">
                    <span className="text-white font-semibold">{stat.kills}/{stat.deaths}/{stat.assists}</span>
                    <p className="text-gray-600 text-[10px]">K/D/A</p>
                </div>
                {stat.acs !== null && (
                    <div className="text-center hidden sm:block">
                        <span className="text-cyan-400 font-semibold">{stat.acs}</span>
                        <p className="text-gray-600 text-[10px]">ACS</p>
                    </div>
                )}
                {stat.adr !== null && (
                    <div className="text-center hidden sm:block">
                        <span className="text-orange-400 font-semibold">{stat.adr}</span>
                        <p className="text-gray-600 text-[10px]">ADR</p>
                    </div>
                )}
                {stat.kast_percent !== null && (
                    <div className="text-center hidden md:block">
                        <span className="text-purple-400 font-semibold">{stat.kast_percent}%</span>
                        <p className="text-gray-600 text-[10px]">KAST</p>
                    </div>
                )}
                {stat.rating !== null && (
                    <div className="text-center">
                        <span className={`font-semibold ${stat.rating >= 1.0 ? "text-green-400" : "text-red-400"}`}>
                            {stat.rating.toFixed(2)}
                        </span>
                        <p className="text-gray-600 text-[10px]">Rating</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MatchHistory({ matches, team1Name, team2Name }: { matches: MatchData[]; team1Name: string; team2Name: string }) {
    const [expandedMatch, setExpandedMatch] = useState<number | null>(null);

    if (matches.length === 0) return null;

    return (
        <div className="mt-10">
            <h3 className="font-rajdhani text-2xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                <Map className="w-6 h-6 text-purple-400" />
                Match History
            </h3>
            <div className="space-y-4">
                {matches.map((match, idx) => (
                    <div
                        key={`${match.vlr_id}-${idx}`}
                        className="bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <div
                            onClick={() => setExpandedMatch(expandedMatch === idx ? null : idx)}
                            className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${match.winner_name === team1Name ? "bg-red-500" : "bg-blue-500"} shadow-[0_0_10px_currentColor]`} />
                                <div>
                                    <p className="font-rajdhani text-lg font-bold text-white">
                                        {match.winner_name} vs {match.loser_name}
                                    </p>
                                    <p className="font-mono text-xs text-gray-500">
                                        Score: {match.score} • {match.maps.length} map{match.maps.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-sm font-rajdhani font-semibold ${match.winner_name === team1Name
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    }`}>
                                    {match.winner_name} Won
                                </span>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedMatch === idx ? "rotate-180" : ""}`} />
                            </div>
                        </div>

                        {expandedMatch === idx && (
                            <div className="border-t border-white/10 p-5 space-y-6">
                                {match.maps.map((map, mapIdx) => (
                                    <div key={mapIdx} className="bg-white/[0.02] rounded-xl p-5 border border-white/5">
                                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl">
                                                    <Map className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <span className="font-rajdhani text-xl font-bold text-white">{map.map_name}</span>
                                                    <p className="text-xs text-gray-500 font-mono">Round Score</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <span className="font-rajdhani text-2xl font-bold text-green-400">{map.winner_score}</span>
                                                    <p className="text-xs text-green-400/70 font-mono">{map.winner_name}</p>
                                                </div>
                                                <span className="text-gray-600 text-xl font-bold">:</span>
                                                <div className="text-left">
                                                    <span className="font-rajdhani text-2xl font-bold text-red-400">{map.loser_score}</span>
                                                    <p className="text-xs text-red-400/70 font-mono">{map.loser_name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                    <p className="font-rajdhani text-sm font-bold text-green-400 uppercase tracking-wider">
                                                        {map.winner_name}
                                                    </p>
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-mono rounded-full border border-green-500/30">
                                                        WINNER
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {map.winner_statistics.slice(0, 5).map((stat, sIdx) => (
                                                        <PlayerStatRow key={sIdx} stat={stat} isWinner={true} />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                    <p className="font-rajdhani text-sm font-bold text-red-400 uppercase tracking-wider">
                                                        {map.loser_name}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    {map.loser_statistics.slice(0, 5).map((stat, sIdx) => (
                                                        <PlayerStatRow key={sIdx} stat={stat} isWinner={false} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeamDuelsContent() {
    const searchParams = useSearchParams();
    const preselectedTeamId = searchParams.get("team");

    const [teams, setTeams] = useState<Team[]>([]);
    const [team1, setTeam1] = useState<Team | null>(null);
    const [team2, setTeam2] = useState<Team | null>(null);
    const [duelStats, setDuelStats] = useState<TeamDuelsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch(`${API_BASE}/teams`);
                if (res.ok) {
                    const data = await res.json();
                    const teamList = data.teams || [];
                    setTeams(teamList);

                    // Pre-select team if URL param exists
                    if (preselectedTeamId) {
                        const preselected = teamList.find((t: Team) => t.vlr_id === parseInt(preselectedTeamId));
                        if (preselected) {
                            setTeam1(preselected);
                        }
                    }
                }
            } catch {
                console.error("Failed to fetch teams");
            } finally {
                setTeamsLoading(false);
            }
        };
        fetchTeams();
    }, [preselectedTeamId]);

    const fetchDuel = useCallback(async () => {
        if (!team1 || !team2) return;
        if (team1.vlr_id === team2.vlr_id) {
            setError("Please select two different teams");
            return;
        }

        setLoading(true);
        setError(null);
        setDuelStats(null);

        try {
            const res = await fetch(`${API_BASE}/team_duels?team1_vlr_id=${team1.vlr_id}&team2_vlr_id=${team2.vlr_id}`);

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to fetch team duel stats");
            }

            const data = await res.json();
            setDuelStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch team duel data");
        } finally {
            setLoading(false);
        }
    }, [team1, team2]);

    const team1Wins = duelStats?.team1_wins || 0;
    const team2Wins = duelStats?.team2_wins || 0;
    const maxWins = Math.max(team1Wins, team2Wins, 1);
    const winner = team1Wins > team2Wins ? team1?.name : team2Wins > team1Wins ? team2?.name : null;

    return (
        <main className="min-h-screen relative overflow-hidden">
            <style jsx>{`
        @keyframes particle-flow-right {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateX(200px) translateY(-20px); opacity: 0; }
        }
        @keyframes particle-flow-left {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateX(-200px) translateY(-20px); opacity: 0; }
        }
        @keyframes energy-pulse {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(200%); }
        }
      `}</style>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-500/8 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/8 via-transparent to-transparent" />
            </div>

            <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12)_0%,transparent_60%)] blur-[100px] pointer-events-none" />
            <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_60%)] blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_60%)] blur-[80px] pointer-events-none" />

            <div className="fixed inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"
            }} />

            <Particles color="red" direction="right" />
            <Particles color="blue" direction="left" />

            <EnergyLine />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 relative">
                <section className="text-center mb-10 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.15)_0%,transparent_60%)] blur-[60px] pointer-events-none" />
                    <h1 className="font-rajdhani text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-wider mb-3 relative">
                        <span className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">TEAM</span>
                        <span className="text-white"> DUELS</span>
                    </h1>
                    <p className="font-mono text-sm text-gray-500 tracking-widest uppercase">
                        Head-to-head team match statistics
                    </p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-start mb-10">
                    <div className="space-y-4 relative">
                        <label className="block font-mono text-xs text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            Team 1
                        </label>
                        <TeamSelect
                            value={team1}
                            onChange={setTeam1}
                            teams={teams}
                            placeholder="Select Team 1"
                            color="red"
                            isLoading={teamsLoading}
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center lg:pt-10 gap-4">
                        <button
                            onClick={fetchDuel}
                            onMouseDown={() => setIsPressed(true)}
                            onMouseUp={() => setIsPressed(false)}
                            onMouseLeave={() => setIsPressed(false)}
                            disabled={!team1 || !team2 || loading}
                            className={`
                relative flex items-center gap-3 px-8 py-4 
                bg-gradient-to-r from-red-500 via-purple-600 to-blue-500 
                rounded-2xl text-white font-rajdhani font-bold text-lg uppercase tracking-wider 
                disabled:opacity-40 disabled:cursor-not-allowed 
                transition-all duration-300 ease-out
                hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] 
                hover:-translate-y-1
                active:translate-y-0 active:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none
                after:absolute after:inset-[-2px] after:rounded-2xl after:bg-gradient-to-r after:from-red-500 after:via-purple-500 after:to-blue-500 after:-z-10 after:blur-sm after:opacity-60
                ${isPressed ? "scale-95" : ""}
              `}
                        >
                            <Swords className="w-6 h-6" />
                            <span>Compare</span>
                        </button>

                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
                            <div className="relative w-full h-full flex items-center justify-center bg-[#0a0a12] border-2 border-purple-500/50 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                <span className="font-rajdhani text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-400 to-blue-500">
                                    VS
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 relative">
                        <label className="block font-mono text-xs text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            Team 2
                        </label>
                        <TeamSelect
                            value={team2}
                            onChange={setTeam2}
                            teams={teams}
                            placeholder="Select Team 2"
                            color="blue"
                            isLoading={teamsLoading}
                        />
                    </div>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
                            <div className="absolute inset-2 w-20 h-20 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin" style={{ animationDirection: "reverse" }} />
                            <div className="absolute inset-4 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
                        </div>
                        <p className="font-mono text-sm text-purple-400 tracking-widest uppercase flex items-center gap-2">
                            <Zap className="w-4 h-4 animate-pulse" />
                            Loading team duel data...
                        </p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-20 h-20 flex items-center justify-center bg-red-500/10 border-2 border-red-500/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <Skull className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-red-400 font-mono text-sm">{error}</p>
                    </div>
                )}

                {duelStats && !loading && !error && (
                    <>
                        <div className="text-center mb-8 p-6 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl">
                            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">Total Matches Played</p>
                            <p className="font-rajdhani text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-400 to-blue-500">
                                {duelStats.number_of_matches}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-10">
                            <div className={`
              relative p-8 
              bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 
              backdrop-blur-2xl border-2 rounded-3xl 
              transition-all duration-500
              before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none
              ${winner === team1?.name
                                    ? "border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                                    : "border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                                }
            `}>
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-t-3xl" />
                                {winner === team1?.name && (
                                    <div className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-bounce">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                )}

                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/30 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                                        <Users className="w-10 h-10 text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-rajdhani text-3xl font-bold text-white uppercase tracking-wider">
                                            {duelStats.team1_ign}
                                        </h2>
                                        <p className="font-mono text-xs text-red-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                            Team 1
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <StatBar label="Match Wins" value={team1Wins} maxValue={maxWins} color="red" />

                                    <div className="pt-6 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Win Rate</span>
                                            <span className="font-rajdhani text-2xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                                {duelStats.number_of_matches > 0
                                                    ? ((team1Wins / duelStats.number_of_matches) * 100).toFixed(1)
                                                    : "0.0"
                                                }%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:flex items-center justify-center">
                                <div className="w-px h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
                            </div>

                            <div className={`
              relative p-8 
              bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 
              backdrop-blur-2xl border-2 rounded-3xl 
              transition-all duration-500
              before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none
              ${winner === team2?.name
                                    ? "border-blue-500/60 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
                                    : "border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                                }
            `}>
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-t-3xl" />
                                {winner === team2?.name && (
                                    <div className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-bounce">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                )}

                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                                        <Users className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-rajdhani text-3xl font-bold text-white uppercase tracking-wider">
                                            {duelStats.team2_ign}
                                        </h2>
                                        <p className="font-mono text-xs text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                            Team 2
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <StatBar label="Match Wins" value={team2Wins} maxValue={maxWins} color="blue" />

                                    <div className="pt-6 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Win Rate</span>
                                            <span className="font-rajdhani text-2xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                                {duelStats.number_of_matches > 0
                                                    ? ((team2Wins / duelStats.number_of_matches) * 100).toFixed(1)
                                                    : "0.0"
                                                }%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <MatchHistory
                            matches={duelStats.matches}
                            team1Name={duelStats.team1_ign}
                            team2Name={duelStats.team2_ign}
                        />
                    </>
                )}

                {!duelStats && !loading && !error && team1 && team2 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                        <Target className="w-16 h-16 text-purple-500/50" />
                        <p className="text-gray-400 font-mono text-sm">Click Compare to see head-to-head stats</p>
                    </div>
                )}

                {!team1 && !team2 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-2xl" />
                            <Swords className="relative w-20 h-20 text-gray-600/50" />
                        </div>
                        <h3 className="font-rajdhani text-2xl text-gray-400 uppercase tracking-wider">Select Two Teams</h3>
                        <p className="text-gray-500 text-sm max-w-md">
                            Choose two teams from the dropdown menus above to compare their head-to-head match statistics
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function TeamDuelsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        }>
            <TeamDuelsContent />
        </Suspense>
    );
}
