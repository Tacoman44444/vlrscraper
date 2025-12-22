"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Map, User, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
    type: "map" | "player" | "page";
    title: string;
    subtitle?: string;
    href: string;
}

const PAGES: SearchResult[] = [
    { type: "page", title: "Home", subtitle: "Main dashboard", href: "/" },
    { type: "page", title: "Maps", subtitle: "Explore all Valorant maps", href: "/maps" },
    { type: "page", title: "Players", subtitle: "Search player IGNs", href: "/players" },
];

const MAPS: SearchResult[] = [
    { type: "map", title: "Ascent", subtitle: "A/B Sites • Venice, Italy", href: "/maps" },
    { type: "map", title: "Bind", subtitle: "A/B Sites • Rabat, Morocco", href: "/maps" },
    { type: "map", title: "Haven", subtitle: "A/B/C Sites • Thimphu, Bhutan", href: "/maps" },
    { type: "map", title: "Split", subtitle: "A/B Sites • Tokyo, Japan", href: "/maps" },
    { type: "map", title: "Icebox", subtitle: "A/B Sites • Bennett Island, Russia", href: "/maps" },
    { type: "map", title: "Breeze", subtitle: "A/B Sites • Bermuda Triangle", href: "/maps" },
    { type: "map", title: "Fracture", subtitle: "A/B Sites • New Mexico, USA", href: "/maps" },
    { type: "map", title: "Pearl", subtitle: "A/B Sites • Lisbon, Portugal", href: "/maps" },
    { type: "map", title: "Lotus", subtitle: "A/B/C Sites • Western Ghats, India", href: "/maps" },
    { type: "map", title: "Sunset", subtitle: "A/B Sites • Los Angeles, USA", href: "/maps" },
    { type: "map", title: "Abyss", subtitle: "A/B Sites • Unknown", href: "/maps" },
];

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (query.trim() === "") {
            setResults([...PAGES, ...MAPS.slice(0, 5)]);
        } else {
            const q = query.toLowerCase();
            const filteredPages = PAGES.filter(
                (p) => p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q)
            );
            const filteredMaps = MAPS.filter(
                (m) => m.title.toLowerCase().includes(q) || m.subtitle?.toLowerCase().includes(q)
            );
            setResults([...filteredPages, ...filteredMaps]);
        }
        setSelectedIndex(0);
    }, [query]);

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
                        placeholder="Search maps, players, pages..."
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
                    {results.length === 0 ? (
                        <div className="px-5 py-8 text-center text-gray-500">
                            No results found for "{query}"
                        </div>
                    ) : (
                        results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.title}`}
                                onClick={() => handleResultClick(result)}
                                className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${index === selectedIndex
                                        ? "bg-cyan-500/10 border-l-2 border-cyan-400"
                                        : "hover:bg-white/5 border-l-2 border-transparent"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg ${result.type === "map"
                                            ? "bg-green-500/15 text-green-400"
                                            : result.type === "player"
                                                ? "bg-violet-500/15 text-violet-400"
                                                : "bg-cyan-500/15 text-cyan-400"
                                        }`}
                                >
                                    {result.type === "map" ? (
                                        <Map className="w-5 h-5" />
                                    ) : result.type === "player" ? (
                                        <User className="w-5 h-5" />
                                    ) : (
                                        <ArrowRight className="w-5 h-5" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-rajdhani text-base font-semibold text-white truncate">
                                        {result.title}
                                    </p>
                                    {result.subtitle && (
                                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                                    )}
                                </div>

                                <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${result.type === "map"
                                            ? "bg-green-500/10 text-green-400"
                                            : result.type === "player"
                                                ? "bg-violet-500/10 text-violet-400"
                                                : "bg-cyan-500/10 text-cyan-400"
                                        }`}
                                >
                                    {result.type}
                                </span>
                            </button>
                        ))
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
                </div>
            </div>
        </div>
    );
}
