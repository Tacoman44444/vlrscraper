"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Swords, Zap, Trophy, Skull, Target, User, ChevronDown } from "lucide-react";

const API_BASE = "http://localhost:8000";

interface DuelStats {
    duel: {
        [playerName: string]: {
            kills: number;
        };
    };
}

interface PlayerSelectProps {
    value: string;
    onChange: (value: string) => void;
    players: string[];
    placeholder: string;
    color: "red" | "blue";
    isLoading: boolean;
}

function Particles({ color, direction }: { color: "red" | "blue"; direction: "left" | "right" }) {
    const particleCount = 12;
    const colorClass = color === "red" ? "bg-red-500" : "bg-blue-500";

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: particleCount }).map((_, i) => (
                <div
                    key={i}
                    className={`absolute w-1 h-1 ${colorClass} rounded-full opacity-40`}
                    style={{
                        top: `${10 + Math.random() * 80}%`,
                        left: direction === "right" ? `${Math.random() * 30}%` : `${70 + Math.random() * 30}%`,
                        animation: `particle-flow-${direction} ${3 + Math.random() * 4}s linear infinite`,
                        animationDelay: `${Math.random() * 3}s`,
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

function PlayerSelect({ value, onChange, players, placeholder, color, isLoading }: PlayerSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const filtered = players.filter(p => p.toLowerCase().includes(search.toLowerCase()));

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
                    <User className={`w-5 h-5 ${colorClasses.text}`} />
                </div>
                <span className={`flex-1 font-rajdhani text-lg font-semibold ${value ? "text-white" : "text-gray-500"}`}>
                    {value || placeholder}
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
                                placeholder="Search players..."
                                className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border ${colorClasses.border} rounded-xl text-white text-sm placeholder:text-gray-500 outline-none focus:${colorClasses.borderFocus} transition-colors`}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-4 text-gray-500 text-sm text-center">No players found</div>
                        ) : (
                            filtered.slice(0, 20).map((player) => (
                                <div
                                    key={player}
                                    onClick={() => {
                                        onChange(player);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`
                    px-4 py-3 cursor-pointer transition-all duration-200
                    ${colorClasses.highlight} 
                    ${player === value ? `${colorClasses.bg} border-l-2 ${colorClasses.borderFocus}` : "border-l-2 border-transparent"}
                  `}
                                >
                                    <span className="font-rajdhani text-white font-medium">{player}</span>
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

export default function PlayerDuelsPage() {
    const [players, setPlayers] = useState<string[]>([]);
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [duelStats, setDuelStats] = useState<DuelStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [playersLoading, setPlayersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await fetch(`${API_BASE}/player_igns`);
                if (res.ok) {
                    const data = await res.json();
                    setPlayers(data.player_igns || []);
                }
            } catch {
                console.error("Failed to fetch players");
            } finally {
                setPlayersLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    const fetchDuel = useCallback(async () => {
        if (!player1 || !player2) return;
        if (player1 === player2) {
            setError("Please select two different players");
            return;
        }

        setLoading(true);
        setError(null);
        setDuelStats(null);

        try {
            const res = await fetch(`${API_BASE}/player_duels?player1_ign=${encodeURIComponent(player1)}&player2_ign=${encodeURIComponent(player2)}`);

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to fetch duel stats");
            }

            const data = await res.json();
            setDuelStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch duel data");
        } finally {
            setLoading(false);
        }
    }, [player1, player2]);

    const player1Kills = duelStats?.duel?.[player1]?.kills || 0;
    const player2Kills = duelStats?.duel?.[player2]?.kills || 0;
    const maxKills = Math.max(player1Kills, player2Kills, 1);
    const winner = player1Kills > player2Kills ? player1 : player2Kills > player1Kills ? player2 : null;

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
                        <span className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">PLAYER</span>
                        <span className="text-white"> DUELS</span>
                    </h1>
                    <p className="font-mono text-sm text-gray-500 tracking-widest uppercase">
                        Head-to-head elimination statistics
                    </p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-start mb-10">
                    <div className="space-y-4 relative">
                        <label className="block font-mono text-xs text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            Player 1
                        </label>
                        <PlayerSelect
                            value={player1}
                            onChange={setPlayer1}
                            players={players}
                            placeholder="Select Player 1"
                            color="red"
                            isLoading={playersLoading}
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center lg:pt-10 gap-4">
                        <button
                            onClick={fetchDuel}
                            onMouseDown={() => setIsPressed(true)}
                            onMouseUp={() => setIsPressed(false)}
                            onMouseLeave={() => setIsPressed(false)}
                            disabled={!player1 || !player2 || loading}
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
                            Player 2
                        </label>
                        <PlayerSelect
                            value={player2}
                            onChange={setPlayer2}
                            players={players}
                            placeholder="Select Player 2"
                            color="blue"
                            isLoading={playersLoading}
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
                            Loading duel data...
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
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-10">
                        <div className={`
              relative p-8 
              bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 
              backdrop-blur-2xl border-2 rounded-3xl 
              transition-all duration-500
              before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none
              ${winner === player1
                                ? "border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                                : "border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                            }
            `}>
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-t-3xl" />
                            {winner === player1 && (
                                <div className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-bounce">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                            )}

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/30 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                                    <User className="w-10 h-10 text-red-400" />
                                </div>
                                <div>
                                    <h2 className="font-rajdhani text-3xl font-bold text-white uppercase tracking-wider">
                                        {player1}
                                    </h2>
                                    <p className="font-mono text-xs text-red-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                        Player 1
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <StatBar label="Kills vs Opponent" value={player1Kills} maxValue={maxKills} color="red" />

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Kill Ratio</span>
                                        <span className="font-rajdhani text-2xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                            {player2Kills > 0 ? (player1Kills / player2Kills).toFixed(2) : player1Kills > 0 ? "∞" : "0.00"}
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
              ${winner === player2
                                ? "border-blue-500/60 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
                                : "border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                            }
            `}>
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-t-3xl" />
                            {winner === player2 && (
                                <div className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-bounce">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                            )}

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                                    <User className="w-10 h-10 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="font-rajdhani text-3xl font-bold text-white uppercase tracking-wider">
                                        {player2}
                                    </h2>
                                    <p className="font-mono text-xs text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        Player 2
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <StatBar label="Kills vs Opponent" value={player2Kills} maxValue={maxKills} color="blue" />

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Kill Ratio</span>
                                        <span className="font-rajdhani text-2xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                            {player1Kills > 0 ? (player2Kills / player1Kills).toFixed(2) : player2Kills > 0 ? "∞" : "0.00"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!duelStats && !loading && !error && player1 && player2 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                        <Target className="w-16 h-16 text-purple-500/50" />
                        <p className="text-gray-400 font-mono text-sm">Click Compare to see head-to-head stats</p>
                    </div>
                )}

                {!player1 && !player2 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-2xl" />
                            <Swords className="relative w-20 h-20 text-gray-600/50" />
                        </div>
                        <h3 className="font-rajdhani text-2xl text-gray-400 uppercase tracking-wider">Select Two Players</h3>
                        <p className="text-gray-500 text-sm max-w-md">
                            Choose two players from the dropdown menus above to compare their head-to-head elimination statistics
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
