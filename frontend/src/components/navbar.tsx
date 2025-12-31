"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { Github, Zap, Map, Home, Swords, Users, BarChart3, Compass } from "lucide-react";
import { Frame } from "@/components/ui/future-navbar";
import Link from "next/link";
import FutureButton from "@/components/ui/future-navbar";
import { usePathname } from "next/navigation";
import SearchModal from "@/components/search-modal";

export const MobileMenuContext = createContext<{
    showMenu: boolean;
    setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    showMenu: false,
    setShowMenu: () => { },
});

const NAV_LINKS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/maps", label: "Maps", icon: Map },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/players", label: "Player Duels", icon: Swords },
    { href: "/teamduels", label: "Team Duels", icon: Swords },
    { href: "/mapanalytics", label: "Analytics", icon: BarChart3 },
    { href: "/strategy", label: "Strat Board", icon: Compass },
];

function FutureNavbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const pathname = usePathname();

    const primaryStroke = "#00fff7";
    const primaryFill = "rgba(0, 255, 247, 0.15)";

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            setShowSearch((prev) => !prev);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <MobileMenuContext.Provider value={{ showMenu, setShowMenu }}>
            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />

            {showMenu && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute top-0 right-0 w-72 h-full bg-[#0a0a0f] border-l border-[#00fff7]/20 p-6">
                        <button
                            onClick={() => setShowMenu(false)}
                            className="absolute top-4 right-4 text-[#00fff7] text-2xl"
                        >
                            ×
                        </button>
                        <nav className="mt-12 flex flex-col gap-4">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setShowMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(link.href)
                                        ? "bg-[#00fff7]/20 text-[#00fff7] border border-[#00fff7]/40"
                                        : "text-white/70 hover:text-[#00fff7] hover:bg-[#00fff7]/10"
                                        }`}
                                >
                                    <link.icon className="size-5" />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            <div className="h-16 mt-2 mx-2 lg:-mt-px lg:-mx-px flex w-full top-0 inset-x-0 z-40">
                <div className="size-full relative -mr-[11px] hidden lg:block">
                    <Frame
                        className="drop-shadow-2xl"
                        paths={JSON.parse(
                            `[{
                "show": true,
                "style": {"strokeWidth": "1", "stroke": "${primaryStroke}", "fill": "rgba(0,255,247,0.06)"},
                "path":[["M","0","0"],["L","100% - 6","0"],["L","100% - 11","100% - 64"],["L","100% + 0","0% + 29"],["L","0","11"],["L","0","0"]]
              },{
                "show": true,
                "style": {"strokeWidth": "1", "stroke": "${primaryStroke}38", "fill": "transparent"},
                "path":[["M","0","14"],["L","100% - 7","33"]]
              }]`
                        )}
                    />
                </div>

                <div className="flex lg:container h-full relative flex-none w-full">
                    <div className="flex-none h-full px-14 relative w-full lg:w-auto">
                        <Frame
                            enableBackdropBlur
                            className="drop-shadow-2xl"
                            paths={JSON.parse(
                                `[{
                  "show":true,
                  "style":{"strokeWidth":"1","stroke":"${primaryStroke}","fill":"${primaryFill}"},
                  "path":[["M","6","0"],["L","100% - 6.5","0"],["L","100% + 0","0% + 9"],["L","100% - 28","100% - 15"],["L","162","100% - 15"],["L","164","100% - 30"],["L","153","100% - 15"],["L","27","100% - 15"],["L","0","0% + 8"],["L","6","0"]]
                },{
                  "show":true,
                  "style":{"strokeWidth":"1","stroke":"${primaryStroke}91","fill":"transparent"},
                  "path":[["M","32","100% - 15"],["L","0% + 152.5","100% - 15"],["L","0% + 163.5","100% - 29"],["L","0% + 161.5","100% - 15"],["L","100% - 32.5","100% - 15"],["L","100% - 36.5","100% - 7"],["L","0% + 163.5","100% - 7"],["L","0% + 165.5","100% - 23"],["L","0% + 152.5","100% - 7"],["L","37","100% - 7"],["L","32","100% - 15"]]
                },{
                  "show":true,
                  "style":{"strokeWidth":"1","stroke":"${primaryStroke}3B","fill":"transparent"},
                  "path":[["M","0","0% + 33"],["M","4","0% + 33"],["L","0% + 18.5","100% - 12"],["L","0% + 23.5","100% - 12"],["L","29","100% + 0"],["L","155","100% - 0"],["L","160","100% - 8"],["L","161","100% - 0"],["L","100% - 28","100% + 0"],["L","100% - 23","100% - 11"],["L","100% - 17","100% - 11"],["L","100% - 14","100% - 14"],["L","100% + 0","100% - 14"]]
                }]`
                            )}
                        />
                        <div className="flex items-center mt-2.5 relative">
                            <Link href="/" className="me-16 font-bold text-lg tracking-wider">
                                <span className="text-[#00fff7]">VAL</span>
                                <span className="text-white">/HUB</span>
                            </Link>

                            <div className="hidden lg:flex gap-8 font-medium">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`transition-all flex items-center gap-2 ${isActive(link.href)
                                            ? "text-[#00fff7] drop-shadow-[0_0_10px_rgba(0,255,247,0.5)]"
                                            : "text-white/70 hover:text-[#00fff7]"
                                            }`}
                                    >
                                        <link.icon className="size-4" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div
                                onClick={() => setShowMenu(true)}
                                className="cursor-pointer ms-auto flex items-center gap-2 lg:hidden font-medium text-[#00fff7]"
                            >
                                <Zap className="size-4" />
                                Menu
                            </div>
                        </div>
                    </div>

                    <div className="w-full relative -ml-[25px] lg:flex justify-end pe-8 hidden">
                        <Frame
                            enableBackdropBlur
                            className="drop-shadow-2xl"
                            paths={JSON.parse(
                                `[{
                  "show":true,
                  "style":{"strokeWidth":"1","stroke":"${primaryStroke}80","fill":"rgba(0,255,247,0.08)"},
                  "path":[["M","19","0"],["L","100% - 5","0"],["L","100% + 0","0% + 7"],["L","100% - 36","100% - 20"],["L","0","100% - 20"],["L","25","8.999992370605469"],["L","19","1"]]
                },{
                  "show":true,
                  "style":{"strokeWidth":"1","stroke":"${primaryStroke}3B","fill":"transparent"},
                  "path":[["M","25","100% - 14"],["L","100% - 32","100% - 13"],["L","100% - 15","36"]]
                }]`
                            )}
                        />
                        <div className="flex items-center -mt-3.5">
                            <div onClick={() => setShowSearch(true)}>
                                <FutureButton
                                    shape="flat"
                                    className="font-normal px-9 py-[0.45rem] text-xs text-white/80 cursor-pointer"
                                >
                                    <div className="me-10">Search...</div>
                                    <div className="ms-auto text-[#00fff7]">⌘K</div>
                                </FutureButton>
                            </div>
                            <a
                                target="_blank"
                                href="https://github.com/Tacoman44444/vlrscraper"
                                rel="noopener noreferrer"
                            >
                                <FutureButton shape="flat" className="py-[0.45rem] px-6 ms-1">
                                    <Github className="size-4" />
                                </FutureButton>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="size-full relative -ml-[18px] hidden lg:block">
                    <Frame
                        paths={JSON.parse(
                            `[{
                "show":true,
                "style":{"strokeWidth":"1","stroke":"${primaryStroke}E6","fill":"rgba(0,255,247,0.06)"},
                "path":[["M","12","0"],["L","100% + 0","0"],["L","100% + 0","0% + 16"],["L","0","100% - 42"],["L","18","7"],["L","12","0"]]
              },{
                "show":true,
                "style":{"strokeWidth":"1","stroke":"${primaryStroke}3B","fill":"transparent"},
                "path":[["M","3","100% - 36"],["L","100% + 0","20"]]
              }]`
                        )}
                    />
                </div>
            </div>
        </MobileMenuContext.Provider>
    );
}

export default FutureNavbar;
