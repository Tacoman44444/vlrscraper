"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Calendar,
    Target,
    TrendingUp,
    TrendingDown,
    Search,
    ChevronDown,
    Zap,
    Trophy,
    Skull,
    BarChart3,
    Users,
    Layers,
    Activity,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

interface Team {
    vlr_id: number;
    name: string;
}

interface MapDataItem {
    map_name: string;
    result: "Win" | "Loss";
    team_score: number;
    opponent_score: number;
    opponent_name: string;
    agent_comp: string[];
}

interface MapDataResponse {
    "total maps": number;
    wins: number;
    losses: number;
    map_data: MapDataItem[];
}

const VALORANT_MAPS = [
    "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture",
    "Haven", "Icebox", "Lotus", "Pearl", "Split", "Sunset"
];

const AGENT_COLORS: Record<string, string> = {
    "Astra": "from-purple-500 to-purple-700",
    "Breach": "from-orange-500 to-orange-700",
    "Brimstone": "from-orange-600 to-red-700",
    "Chamber": "from-yellow-500 to-yellow-700",
    "Clove": "from-purple-400 to-pink-600",
    "Cypher": "from-cyan-500 to-cyan-700",
    "Deadlock": "from-gray-400 to-gray-600",
    "Fade": "from-slate-600 to-slate-800",
    "Gekko": "from-lime-400 to-green-600",
    "Harbor": "from-blue-400 to-cyan-600",
    "Iso": "from-purple-500 to-violet-700",
    "Jett": "from-cyan-400 to-blue-600",
    "KAY/O": "from-blue-500 to-blue-700",
    "Killjoy": "from-yellow-400 to-yellow-600",
    "Neon": "from-blue-400 to-purple-600",
    "Omen": "from-indigo-600 to-purple-800",
    "Phoenix": "from-orange-400 to-red-600",
    "Raze": "from-orange-500 to-yellow-600",
    "Reyna": "from-purple-500 to-pink-600",
    "Sage": "from-cyan-300 to-teal-500",
    "Skye": "from-green-400 to-emerald-600",
    "Sova": "from-blue-500 to-cyan-600",
    "Tejo": "from-amber-500 to-orange-600",
    "Viper": "from-green-500 to-emerald-700",
    "Vyse": "from-pink-400 to-rose-600",
    "Yoru": "from-blue-600 to-indigo-800",
};

function TeamSelect({
    value,
    onChange,
    teams,
    isLoading,
}: {
    value: Team | null;
    onChange: (team: Team | null) => void;
    teams: Team[];
    isLoading: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const filtered = teams.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => !isLoading && setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-3 px-5 py-4
                    bg-gradient-to-b from-emerald-500/10 to-emerald-600/5
                    backdrop-blur-xl border-2 border-emerald-500/30 hover:border-emerald-500/60
                    rounded-2xl cursor-pointer transition-all duration-300
                    ${isOpen ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : ""}
                `}
            >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                    <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <span className={`flex-1 font-rajdhani text-lg font-semibold ${value ? "text-white" : "text-gray-500"}`}>
                    {value?.name || "Select Team"}
                </span>
                <ChevronDown className={`w-5 h-5 text-emerald-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a12]/95 backdrop-blur-2xl border-2 border-emerald-500/30 rounded-2xl overflow-hidden z-50 shadow-2xl shadow-emerald-500/10 animate-fade-in-up">
                    <div className="p-3 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search teams..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-emerald-500/30 rounded-xl text-white text-sm placeholder:text-gray-500 outline-none focus:border-emerald-500 transition-colors"
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
                                    className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-emerald-500/20 ${team.vlr_id === value?.vlr_id ? "bg-emerald-500/10 border-l-2 border-emerald-500" : "border-l-2 border-transparent"}`}
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

function MapFilterSelect({
    selectedMaps,
    onChange,
}: {
    selectedMaps: string[];
    onChange: (maps: string[]) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleMap = (map: string) => {
        if (selectedMaps.includes(map)) {
            onChange(selectedMaps.filter(m => m !== map));
        } else {
            onChange([...selectedMaps, map]);
        }
    };

    const selectAll = () => onChange([...VALORANT_MAPS]);
    const clearAll = () => onChange([]);

    const allSelected = selectedMaps.length === VALORANT_MAPS.length;
    const noneSelected = selectedMaps.length === 0;
    const someSelected = selectedMaps.length > 0 && selectedMaps.length < VALORANT_MAPS.length;

    let displayText = "No Maps Selected";
    if (allSelected) {
        displayText = "All Maps";
    } else if (someSelected) {
        displayText = `${selectedMaps.length} of ${VALORANT_MAPS.length} Maps`;
    }

    return (
        <div ref={ref} className="relative lg:col-span-2">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-3 px-5 py-4
                    bg-gradient-to-b from-cyan-500/10 to-cyan-600/5
                    backdrop-blur-xl border-2 border-cyan-500/30 hover:border-cyan-500/60
                    rounded-2xl cursor-pointer transition-all duration-300
                    ${isOpen ? "border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]" : ""}
                `}
            >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30">
                    <Layers className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className={`font-rajdhani text-lg font-semibold ${noneSelected ? "text-gray-500" : "text-white"}`}>
                        {displayText}
                    </span>
                    {someSelected && (
                        <div className="text-xs text-cyan-400/70 truncate">
                            {selectedMaps.slice(0, 4).join(", ")}{selectedMaps.length > 4 ? ` +${selectedMaps.length - 4} more` : ""}
                        </div>
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a12]/95 backdrop-blur-2xl border-2 border-cyan-500/30 rounded-2xl overflow-hidden z-50 shadow-2xl shadow-cyan-500/10 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Select maps to include</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={selectAll}
                                className={`text-xs transition-colors ${allSelected ? "text-gray-600" : "text-cyan-400 hover:text-cyan-300"}`}
                                disabled={allSelected}
                            >
                                Select All
                            </button>
                            <span className="text-gray-600">|</span>
                            <button
                                onClick={clearAll}
                                className={`text-xs transition-colors ${noneSelected ? "text-gray-600" : "text-red-400 hover:text-red-300"}`}
                                disabled={noneSelected}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                            {VALORANT_MAPS.map((map) => (
                                <div
                                    key={map}
                                    className={`group/item px-3 py-2.5 cursor-pointer transition-all duration-200 rounded-lg flex items-center gap-2
                                        ${selectedMaps.includes(map)
                                            ? "bg-cyan-500/20 border border-cyan-500/40"
                                            : "bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10"}`}
                                >
                                    <div
                                        onClick={() => toggleMap(map)}
                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0
                                            ${selectedMaps.includes(map) ? "border-cyan-500 bg-cyan-500" : "border-gray-600 hover:border-gray-400"}`}
                                    >
                                        {selectedMaps.includes(map) && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>

                                    <span
                                        onClick={() => toggleMap(map)}
                                        className={`font-rajdhani text-sm font-medium truncate flex-1 ${selectedMaps.includes(map) ? "text-white" : "text-gray-400"}`}
                                    >
                                        {map}
                                    </span>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange([map]);
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition-all font-bold uppercase tracking-wider shrink-0"
                                    >
                                        Only
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function StatCard({
    icon: Icon,
    label,
    value,
    color,
    subValue,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: "emerald" | "cyan" | "red" | "yellow" | "purple";
    subValue?: string;
}) {
    const colorClasses = {
        emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
        cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
        red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
        yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400",
        purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    }[color];

    return (
        <div className={`relative p-6 bg-gradient-to-br ${colorClasses.split(" ").slice(0, 2).join(" ")} backdrop-blur-xl border ${colorClasses.split(" ")[2]} rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                    <p className={`font-rajdhani text-4xl font-bold ${colorClasses.split(" ").slice(-1)}`}>{value}</p>
                    {subValue && <p className="font-mono text-xs text-gray-400 mt-1">{subValue}</p>}
                </div>
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses.split(" ").slice(0, 2).join(" ")} border ${colorClasses.split(" ")[2]}`}>
                    <Icon className={`w-6 h-6 ${colorClasses.split(" ").slice(-1)}`} />
                </div>
            </div>
        </div>
    );
}

function WinRateRing({ winRate, size = 120 }: { winRate: number; size?: number }) {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (winRate / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#winRateGradient)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="winRateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-rajdhani text-3xl font-bold text-white">{winRate.toFixed(1)}%</span>
                <span className="font-mono text-xs text-gray-500 uppercase">Win Rate</span>
            </div>
        </div>
    );
}

function MatchCard({ match, index }: { match: MapDataItem; index: number }) {
    const isWin = match.result === "Win";

    return (
        <div
            className={`relative p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] group ${isWin
                ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40"
                : "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40"
                }`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${isWin ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-red-500/20 border border-red-500/30"}`}>
                        {isWin ? <Trophy className="w-5 h-5 text-emerald-400" /> : <Skull className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                        <p className="font-rajdhani text-lg font-bold text-white">{match.map_name}</p>
                        <p className="font-mono text-xs text-gray-500">vs {match.opponent_name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`font-rajdhani text-2xl font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                        {match.team_score} - {match.opponent_score}
                    </p>
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-mono font-semibold ${isWin ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {match.result}
                    </span>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10">
                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-3">Agent Composition</p>
                <div className="flex flex-wrap gap-2">
                    {match.agent_comp.map((agent, idx) => (
                        <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-xl text-xs font-rajdhani font-semibold text-white bg-gradient-to-r ${AGENT_COLORS[agent] || "from-gray-500 to-gray-700"} shadow-lg`}
                        >
                            {agent}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AgentUsageChart({ matches }: { matches: MapDataItem[] }) {
    const agentCount: Record<string, number> = {};
    matches.forEach((match) => {
        match.agent_comp.forEach((agent) => {
            agentCount[agent] = (agentCount[agent] || 0) + 1;
        });
    });

    const sortedAgents = Object.entries(agentCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const maxCount = Math.max(...sortedAgents.map(([, count]) => count));

    return (
        <div className="space-y-3">
            {sortedAgents.map(([agent, count], idx) => (
                <div key={agent} className="group">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-rajdhani text-sm font-semibold text-white">{agent}</span>
                        <span className="font-mono text-xs text-gray-500">{count} games</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${AGENT_COLORS[agent] || "from-gray-500 to-gray-700"} transition-all duration-1000 ease-out`}
                            style={{ width: `${(count / maxCount) * 100}%`, transitionDelay: `${idx * 100}ms` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function MapAnalyticsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedMaps, setSelectedMaps] = useState<string[]>([...VALORANT_MAPS]);
    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 6);
        return date.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
    const [data, setData] = useState<MapDataResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch(`${API_BASE}/teams`);
                if (res.ok) {
                    const data = await res.json();
                    setTeams(data.teams || []);
                }
            } catch {
                console.error("Failed to fetch teams");
            } finally {
                setTeamsLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const fetchMapData = useCallback(async () => {
        if (!selectedTeam) return;
        if (selectedMaps.length === 0) {
            setError("Please select at least one map");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            let endpoint: string;
            const allMapsSelected = selectedMaps.length === VALORANT_MAPS.length;
            const singleMapSelected = selectedMaps.length === 1;

            if (singleMapSelected) {
                endpoint = `/mapdata/filtered?team_vlr_id=${selectedTeam.vlr_id}&map_name=${encodeURIComponent(selectedMaps[0])}&start_date=${startDate}&end_date=${endDate}`;
            } else if (allMapsSelected) {
                endpoint = `/mapdata/overall?team_vlr_id=${selectedTeam.vlr_id}&start_date=${startDate}&end_date=${endDate}`;
            } else {
                const excludedMaps = VALORANT_MAPS.filter(m => !selectedMaps.includes(m));
                const excludeParams = excludedMaps.map(m => `exclude_maps=${encodeURIComponent(m)}`).join('&');
                endpoint = `/mapdata/overall_excluding?team_vlr_id=${selectedTeam.vlr_id}&start_date=${startDate}&end_date=${endDate}&${excludeParams}`;
            }

            const res = await fetch(`${API_BASE}${endpoint}`);

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to fetch map data");
            }

            const result = await res.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch map data");
        } finally {
            setLoading(false);
        }
    }, [selectedTeam, selectedMaps, startDate, endDate]);

    const winRate = data ? (data.wins / data["total maps"]) * 100 : 0;

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1)_0%,transparent_60%)] blur-[100px]" />
                <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_60%)] blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[30%] w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_60%)] blur-[80px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 relative">
                <section className="text-center mb-10 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse,rgba(16,185,129,0.15)_0%,transparent_60%)] blur-[60px] pointer-events-none" />
                    <h1 className="font-rajdhani text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-wider mb-3 relative">
                        <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">MAP</span>
                        <span className="text-white"> ANALYTICS</span>
                    </h1>
                    <p className="font-mono text-sm text-gray-500 tracking-widest uppercase">
                        Team Performance Analysis by Map
                    </p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <TeamSelect
                        value={selectedTeam}
                        onChange={setSelectedTeam}
                        teams={teams}
                        isLoading={teamsLoading}
                    />
                    <MapFilterSelect
                        selectedMaps={selectedMaps}
                        onChange={setSelectedMaps}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="flex items-center gap-2 px-5 py-4 bg-gradient-to-b from-purple-500/10 to-purple-600/5 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl overflow-hidden">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 shrink-0">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-[110px] bg-transparent text-white font-mono text-xs outline-none"
                            />
                            <span className="text-gray-500">–</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-[110px] bg-transparent text-white font-mono text-xs outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={fetchMapData}
                        disabled={!selectedTeam || loading}
                        className="group relative overflow-hidden"
                    >
                        <div className={`
                            relative flex items-center justify-center gap-3 px-8 py-4
                            bg-[#0c1a14] rounded-xl
                            border border-emerald-500/40
                            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.3)]
                            transition-all duration-200 ease-out
                            group-hover:bg-[#0d1f17] group-hover:border-emerald-400/60
                            group-hover:-translate-y-px
                            group-active:translate-y-0 group-active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]
                            group-disabled:opacity-40 group-disabled:cursor-not-allowed group-disabled:hover:translate-y-0 group-disabled:hover:shadow-none
                        `}>
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <Activity className="w-[18px] h-[18px] text-emerald-400 group-hover:text-emerald-300 transition-colors duration-200" strokeWidth={2.5} />
                            </div>
                            <span className="relative font-rajdhani text-[15px] font-semibold tracking-wide text-emerald-100/90 group-hover:text-white transition-colors duration-200">
                                Run Analysis
                            </span>
                            <div className="relative hidden sm:flex items-center ml-2 px-1.5 py-0.5 rounded bg-black/20 border border-white/5">
                                <span className="font-mono text-[10px] text-emerald-400/60 group-hover:text-emerald-300/70 transition-colors">↵</span>
                            </div>
                        </div>
                    </button>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                            <div className="absolute inset-2 w-20 h-20 border-4 border-cyan-500/20 border-b-cyan-500 rounded-full animate-spin" style={{ animationDirection: "reverse" }} />
                        </div>
                        <p className="font-mono text-sm text-emerald-400 tracking-widest uppercase flex items-center gap-2">
                            <Zap className="w-4 h-4 animate-pulse" />
                            Analyzing map data...
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

                {data && !loading && !error && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={Layers} label="Total Maps" value={data["total maps"]} color="cyan" />
                            <StatCard icon={Trophy} label="Wins" value={data.wins} color="emerald" subValue={`${((data.wins / data["total maps"]) * 100).toFixed(1)}%`} />
                            <StatCard icon={Skull} label="Losses" value={data.losses} color="red" subValue={`${((data.losses / data["total maps"]) * 100).toFixed(1)}%`} />
                            <StatCard icon={TrendingUp} label="Form" value={winRate >= 50 ? "Positive" : "Negative"} color={winRate >= 50 ? "emerald" : "red"} subValue={`${winRate.toFixed(1)}% WR`} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="p-8 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-6">
                                <WinRateRing winRate={winRate} size={160} />
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="font-rajdhani text-2xl font-bold text-emerald-400">{data.wins}</p>
                                        <p className="font-mono text-xs text-gray-500 uppercase">Wins</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="text-center">
                                        <p className="font-rajdhani text-2xl font-bold text-red-400">{data.losses}</p>
                                        <p className="font-mono text-xs text-gray-500 uppercase">Losses</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 p-8 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-3xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-rajdhani text-xl font-bold text-white uppercase">Agent Usage</h3>
                                        <p className="font-mono text-xs text-gray-500">Most picked agents</p>
                                    </div>
                                </div>
                                <AgentUsageChart matches={data.map_data} />
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl">
                                    <Target className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-rajdhani text-xl font-bold text-white uppercase">Match Details</h3>
                                    <p className="font-mono text-xs text-gray-500">{data["total maps"]} games played</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.map_data.map((match, idx) => (
                                    <MatchCard key={idx} match={match} index={idx} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!data && !loading && !error && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 rounded-full blur-2xl" />
                            <Layers className="relative w-20 h-20 text-gray-600/50" />
                        </div>
                        <h3 className="font-rajdhani text-2xl text-gray-400 uppercase tracking-wider">Select a Team</h3>
                        <p className="text-gray-500 text-sm max-w-md">
                            Choose a team and optionally filter by map to analyze their performance across matches
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
