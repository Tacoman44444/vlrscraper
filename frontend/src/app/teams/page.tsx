"use client";

import { useState, useEffect } from "react";
import { Users, Trophy, Search, Swords, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:8000";

interface Team {
    vlr_id: number;
    name: string;
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch(`${API_BASE}/teams`);
                if (!res.ok) {
                    throw new Error("Failed to fetch teams");
                }
                const data = await res.json();
                setTeams(data.teams || []);
                setFilteredTeams(data.teams || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load teams");
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredTeams(teams);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredTeams(
                teams.filter((team) => team.name.toLowerCase().includes(query))
            );
        }
    }, [searchQuery, teams]);

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
            </div>

            <div className="fixed top-[-10%] left-[10%] w-[500px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,247,0.08)_0%,transparent_60%)] blur-[80px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_60%)] blur-[80px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 relative">
                {/* Header Section */}
                <section className="text-center mb-10 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse,rgba(0,255,247,0.1)_0%,transparent_60%)] blur-[60px] pointer-events-none" />
                    <h1 className="font-rajdhani text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-wider mb-3 relative">
                        <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(0,255,247,0.5)]">PRO</span>
                        <span className="text-white"> TEAMS</span>
                    </h1>
                    <p className="font-mono text-sm text-gray-500 tracking-widest uppercase">
                        All competitive Valorant teams
                    </p>
                </section>

                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search teams..."
                            className="w-full pl-12 pr-4 py-3 bg-[#0f0f18]/80 backdrop-blur-xl border-2 border-cyan-500/30 rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(0,255,247,0.2)] transition-all"
                        />
                    </div>

                    <Link
                        href="/teamduels"
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 rounded-xl text-cyan-400 font-rajdhani font-semibold uppercase tracking-wider hover:bg-cyan-500/30 hover:shadow-[0_0_30px_rgba(0,255,247,0.3)] transition-all"
                    >
                        <Swords className="w-5 h-5" />
                        Compare Teams
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                                <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Total Teams</p>
                                <p className="font-rajdhani text-3xl font-bold text-white">{teams.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                <Trophy className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Matches</p>
                                <p className="font-rajdhani text-3xl font-bold text-white">∞</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-green-500/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center bg-green-500/10 border border-green-500/30 rounded-xl">
                                <Search className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Filtered</p>
                                <p className="font-rajdhani text-3xl font-bold text-white">{filteredTeams.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,247,0.3)]" />
                        </div>
                        <p className="font-mono text-sm text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading teams from database...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-20 h-20 flex items-center justify-center bg-red-500/10 border-2 border-red-500/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <Users className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-red-400 font-mono text-sm">{error}</p>
                    </div>
                )}

                {/* Teams Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTeams.map((team) => (
                            <Link
                                key={team.vlr_id}
                                href={`/teamduels?team=${team.vlr_id}`}
                                className="group relative p-5 bg-gradient-to-br from-[#0f0f18]/90 to-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(0,255,247,0.15)] transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-xl flex-shrink-0 group-hover:border-cyan-500/30 transition-colors">
                                            <Users className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-rajdhani text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                                {team.name}
                                            </h3>
                                            <p className="font-mono text-xs text-gray-500">
                                                VLR ID: {team.vlr_id}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredTeams.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                        <Users className="w-16 h-16 text-gray-600/50" />
                        <h3 className="font-rajdhani text-2xl text-gray-400 uppercase tracking-wider">No Teams Found</h3>
                        <p className="text-gray-500 text-sm max-w-md">
                            {searchQuery
                                ? `No teams matching "${searchQuery}"`
                                : "No teams available in the database"}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
