"use client";

import { useEffect, useState, useCallback } from "react";
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";

interface MapCallout {
    regionName: string;
    superRegionName: string;
}

interface ValorantMap {
    uuid: string;
    displayName: string;
    narrativeDescription: string | null;
    tacticalDescription: string | null;
    coordinates: string | null;
    displayIcon: string | null;
    listViewIcon: string | null;
    listViewIconTall: string | null;
    splash: string | null;
    stylizedBackgroundImage: string | null;
    premierBackgroundImage: string | null;
    callouts: MapCallout[] | null;
}

interface ApiResponse {
    status: number;
    data: ValorantMap[];
}

const API_URL = "https://valorant-api.com/v1/maps";

function Map3DCard({ map, index }: { map: ValorantMap; index: number }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovering, setIsHovering] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mouseX.set(x);
        mouseY.set(y);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 });
    };

    const getUniqueCallouts = (callouts: MapCallout[] | null): string[] => {
        if (!callouts) return [];
        const unique = [...new Set(callouts.map((c) => c.regionName))];
        return unique.slice(0, 4);
    };

    return (
        <div className="group/card h-full" style={{ perspective: "1000px" }}>
            <article
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative h-full rounded-2xl overflow-hidden bg-[#0f0f18] border border-white/10 shadow-xl cursor-pointer transition-all duration-300 ease-out flex flex-col"
                style={{
                    transform: isHovering
                        ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(20px)`
                        : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transformStyle: "preserve-3d",
                }}
                tabIndex={0}
            >
                <motion.div
                    className="pointer-events-none absolute z-10 -inset-px rounded-2xl opacity-0 transition duration-300 group-hover/card:opacity-100"
                    style={{
                        background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(0, 255, 247, 0.15),
                transparent 80%
              )
            `,
                    }}
                />

                <div
                    className="relative h-48 overflow-hidden flex-shrink-0"
                    style={{ transform: isHovering ? "translateZ(30px)" : "translateZ(0)" }}
                >
                    <img
                        src={map.splash || map.listViewIconTall || ""}
                        alt={`${map.displayName} map splash art`}
                        className="w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110 group-hover/card:brightness-110"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-[#0f0f18]/40 to-transparent" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] opacity-30 pointer-events-none" />
                </div>

                <div
                    className="relative p-5 z-20 flex flex-col flex-grow"
                    style={{ transform: isHovering ? "translateZ(50px)" : "translateZ(0)" }}
                >
                    <h2 className="font-rajdhani text-2xl font-bold uppercase tracking-wider text-white mb-2 transition-all duration-300 group-hover/card:text-cyan-400 group-hover/card:drop-shadow-[0_0_20px_rgba(0,255,247,0.5)]">
                        {map.displayName}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {map.tacticalDescription && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-md font-mono text-[10px] text-green-400 uppercase tracking-wider">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2v20M2 12h20" />
                                </svg>
                                {map.tacticalDescription}
                            </span>
                        )}

                        {map.coordinates && (
                            <span className="font-mono text-[10px] text-gray-500 tracking-wider">
                                {map.coordinates}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/10">
                        {map.callouts && map.callouts.length > 0 ? (
                            <>
                                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                                    {map.callouts.length} Callouts
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {getUniqueCallouts(map.callouts).map((callout, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400 hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:text-cyan-400 transition-all duration-200"
                                        >
                                            {callout}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">
                                No callout data
                            </p>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1/2 bg-[radial-gradient(ellipse_at_center_bottom,rgba(0,255,247,0.2)_0%,transparent_70%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-400 pointer-events-none z-0" />
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover/card:border-cyan-400/30 transition-all duration-300 pointer-events-none" />
            </article>
        </div>
    );
}

export default function MapsPage() {
    const [maps, setMaps] = useState<ValorantMap[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMaps = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: ApiResponse = await response.json();

            const playableMaps = data.data.filter(
                (map) => map.splash && map.tacticalDescription
            );

            setMaps(playableMaps);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch maps");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMaps();
    }, [fetchMaps]);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <section className="text-center mb-12">
                <h1 className="font-rajdhani text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wider mb-2 bg-gradient-to-r from-cyan-400 via-white to-green-400 bg-clip-text text-transparent">
                    Maps
                </h1>
            </section>

            {loading && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                    <div className="relative w-28 h-28">
                        <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full" />
                        <div className="absolute inset-4 border-2 border-cyan-400/20 rounded-full" />
                        <div className="absolute inset-8 border-2 border-cyan-400/20 rounded-full" />
                        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,247,0.4)_30deg,transparent_60deg)] animate-spin" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(0,255,247,0.5)]" />
                    </div>
                    <p className="font-mono text-sm text-cyan-400 tracking-widest uppercase animate-pulse">
                        Fetching Map Data...
                    </p>
                </div>
            )}

            {error && !loading && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
                    <div className="text-6xl text-red-500">⚠</div>
                    <h2 className="font-rajdhani text-2xl text-white">Connection Failed</h2>
                    <p className="text-gray-400 max-w-md">{error}</p>
                    <button
                        onClick={fetchMaps}
                        className="mt-4 px-8 py-3 border-2 border-cyan-400 rounded-lg text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-400 hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {!loading && !error && maps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                    {maps.map((map, index) => (
                        <Map3DCard key={map.uuid} map={map} index={index} />
                    ))}
                </div>
            )}
        </main>
    );
}
