"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Map, User, X, ArrowRight, Users, Swords } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8000";

interface SearchResult {
    type: "map" | "player" | "page" | "team";
    title: string;
    subtitle?: string;
    href: string;
    id?: number;
}

interface Team {
    vlr_id: number;
    name: string;
}

interface Player {
    ign: string;
}

const PAGES: SearchResult[] = [
    { type: "page", title: "Home", subtitle: "Main dashboard", href: "/" },
    { type: "page", title: "Maps", subtitle: "Explore all Valorant maps", href: "/maps" },
    { type: "page", title: "Teams", subtitle: "View all pro teams", href: "/teams" },
    { type: "page", title: "Player Duels", subtitle: "Compare player eliminations", href: "/players" },
    { type: "page", title: "Team Duels", subtitle: "Compare team match history", href: "/teamduels" },
];

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<string[]>([]);
    const [maps, setMaps] = useState<string[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch teams, players, and maps from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsRes, playersRes, mapsRes] = await Promise.all([
                    fetch(`${API_BASE}/teams`),
                    fetch(`${API_BASE}/player_igns`),
                    fetch(`${API_BASE}/maps`),
                ]);

                if (teamsRes.ok) {
                    const teamsData = await teamsRes.json();
                    setTeams(teamsData.teams || []);
                }

                if (playersRes.ok) {
                    const playersData = await playersRes.json();
                    setPlayers(playersData.player_igns || []);
                }

                if (mapsRes.ok) {
                    const mapsData = await mapsRes.json();
                    setMaps(mapsData.maps || []);
                }

                setDataLoaded(true);
            } catch (error) {
                console.error("Failed to fetch search data:", error);
                setDataLoaded(true);
            }
        };

        fetchData();
    }, []);

    // Build search results based on query
    useEffect(() => {
        const teamResults: SearchResult[] = teams.map((team) => ({
            type: "team" as const,
            title: team.name,
            subtitle: `VLR ID: ${team.vlr_id}`,
            href: `/teamduels?team=${team.vlr_id}`,
            id: team.vlr_id,
        }));

        const playerResults: SearchResult[] = players.map((ign) => ({
            type: "player" as const,
            title: ign,
            subtitle: "Pro Player",
            href: `/players?player=${encodeURIComponent(ign)}`,
        }));

        const mapResults: SearchResult[] = maps.map((mapName) => ({
            type: "map" as const,
            title: mapName,
            subtitle: "Competitive Map",
            href: "/maps",
        }));

        if (query.trim() === "") {
            // Show pages first, then a sample of teams and players
            setResults([
                ...PAGES,
                ...teamResults.slice(0, 5),
                ...playerResults.slice(0, 3),
            ]);
        } else {
            const q = query.toLowerCase();
            const filteredPages = PAGES.filter(
                (p) => p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q)
            );
            const filteredTeams = teamResults.filter(
                (t) => t.title.toLowerCase().includes(q)
            );
            const filteredPlayers = playerResults.filter(
                (p) => p.title.toLowerCase().includes(q)
            );
            const filteredMaps = mapResults.filter(
                (m) => m.title.toLowerCase().includes(q)
            );
            setResults([...filteredPages, ...filteredTeams.slice(0, 10), ...filteredPlayers.slice(0, 10), ...filteredMaps]);
        }
        setSelectedIndex(0);
    }, [query, teams, players, maps]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
        }
    }, [isOpen]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % results.length);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
                    break;
                case "Enter":
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        router.push(results[selectedIndex].href);
                        onClose();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [isOpen, results, selectedIndex, router, onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleResultClick = (result: SearchResult) => {
        router.push(result.href);
        onClose();
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case "map":
                return <Map className="w-5 h-5" />;
            case "player":
                return <User className="w-5 h-5" />;
            case "team":
                return <Users className="w-5 h-5" />;
            default:
                return <ArrowRight className="w-5 h-5" />;
        }
    };

    const getColorForType = (type: string) => {
        switch (type) {
            case "map":
                return { bg: "bg-green-500/15", text: "text-green-400", badge: "bg-green-500/10 text-green-400" };
            case "player":
                return { bg: "bg-violet-500/15", text: "text-violet-400", badge: "bg-violet-500/10 text-violet-400" };
            case "team":
                return { bg: "bg-orange-500/15", text: "text-orange-400", badge: "bg-orange-500/10 text-orange-400" };
            default:
                return { bg: "bg-cyan-500/15", text: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400" };
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl mx-4 bg-[#0f0f18] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden animate-fade-in-up">
                <div className="flex items-center gap-4 px-5 py-4 border-b border-white/10">
                    <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search teams, players, maps, pages..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-gray-500"
                    />
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="max-h-[50vh] overflow-y-auto py-2">
                    {!dataLoaded ? (
                        <div className="px-5 py-8 text-center text-gray-500">
                            Loading search data...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-5 py-8 text-center text-gray-500">
                            No results found for "{query}"
                        </div>
                    ) : (
                        results.map((result, index) => {
                            const colors = getColorForType(result.type);
                            return (
                                <button
                                    key={`${result.type}-${result.title}-${index}`}
                                    onClick={() => handleResultClick(result)}
                                    className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${index === selectedIndex
                                        ? "bg-cyan-500/10 border-l-2 border-cyan-400"
                                        : "hover:bg-white/5 border-l-2 border-transparent"
                                        }`}
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                                        {getIconForType(result.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-rajdhani text-base font-semibold text-white truncate">
                                            {result.title}
                                        </p>
                                        {result.subtitle && (
                                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                                        )}
                                    </div>

                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${colors.badge}`}>
                                        {result.type}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd>
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd>
                            select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">esc</kbd>
                            close
                        </span>
                    </div>
                    {dataLoaded && (
                        <div className="text-xs text-gray-600">
                            {teams.length} teams • {players.length} players • {maps.length} maps
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

