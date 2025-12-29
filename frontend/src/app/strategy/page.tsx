"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Map as MapIcon,
    Pen,
    Eraser,
    Undo,
    Redo,
    Save,
    Trash2,
    MousePointer2,
    Type,
    Move,
    Download,
    X,
    Check,
    ChevronRight,
    ChevronLeft,
    Search,
    Play,
    Pause,
    Plus,
    Image as ImageIcon,
    Crosshair,
    Circle,
    Triangle,
    Square,
    Settings,
    Camera,
    Folder,
    Users,
    Swords,
    Shield,
    Zap
} from "lucide-react";

interface ValorantMap {
    uuid: string;
    displayName: string;
    displayIcon: string | null;
    splash: string | null;
}

interface Agent {
    uuid: string;
    displayName: string;
    displayIcon: string;
    role: {
        displayName: string;
    } | null;
}

type ToolType = "select" | "pen" | "line" | "arrow" | "text" | "eraser" | "spike" | "smoke" | "flash" | "molly";

interface BoardElement {
    id: string;
    type: "path" | "line" | "arrow" | "text" | "icon" | "shape";
    shapeType?: "smoke" | "flash" | "molly" | "spike";
    x: number;
    y: number;
    rotation?: number;
    scale?: number;
    color?: string;
    points?: { x: number; y: number }[];
    text?: string;
    iconUrl?: string;
    endX?: number;
    endY?: number;
    step?: number;
}

interface SavedStrategy {
    id: string;
    name: string;
    mapName: string;
    mapUuid: string;
    side: "ATK" | "DEF";
    elements: BoardElement[];
    createdAt: number;
    updatedAt: number;
}

const COLORS = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#eab308",
    "#a855f7",
    "#ffffff",
];

export default function StrategyPage() {
    const [maps, setMaps] = useState<ValorantMap[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedMap, setSelectedMap] = useState<ValorantMap | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [elements, setElements] = useState<BoardElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isAlly, setIsAlly] = useState(true);

    const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
    const [currentStrategyId, setCurrentStrategyId] = useState<string | null>(null);
    const [strategyName, setStrategyName] = useState("New Strategy");

    const [activeTool, setActiveTool] = useState<ToolType>("select");
    const [activeColor, setActiveColor] = useState(COLORS[1]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

    const svgRef = useRef<SVGSVGElement>(null);
    const [draggedAgent, setDraggedAgent] = useState<Agent | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mapsRes, agentsRes] = await Promise.all([
                    fetch("https://valorant-api.com/v1/maps"),
                    fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true"),
                ]);

                const mapsData = await mapsRes.json();
                const agentsData = await agentsRes.json();

                const nonCompetitiveMaps = [
                    "The Range", "Basic Training", "District", "Kasbah", "Piazza", "Drift", "Tutorial"
                ];

                const playableMaps = mapsData.data.filter((m: ValorantMap) =>
                    !nonCompetitiveMaps.includes(m.displayName) &&
                    m.displayIcon // Must have a map icon
                );

                console.log("Maps loaded:", playableMaps.length);
                setMaps(playableMaps);
                setAgents(agentsData.data);
                if (playableMaps.length > 0) setSelectedMap(playableMaps[0]);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (activeTool !== 'select') {
        }
    }, [isAlly]);

    const STORAGE_KEY = "valorant_strategies";

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as SavedStrategy[];
                setSavedStrategies(parsed);
            }
        } catch (error) {
            console.error("Failed to load strategies:", error);
        }
    }, []);

    useEffect(() => {
        if (savedStrategies.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStrategies));
            } catch (error) {
                console.error("Failed to save strategies:", error);
            }
        }
    }, [savedStrategies]);

    const saveCurrentStrategy = () => {
        if (!selectedMap) return;

        const now = Date.now();

        if (currentStrategyId) {
            setSavedStrategies(prev => prev.map(s =>
                s.id === currentStrategyId
                    ? { ...s, name: strategyName, elements, side: isAlly ? "DEF" : "ATK", updatedAt: now }
                    : s
            ));
        } else {
            const newStrategy: SavedStrategy = {
                id: crypto.randomUUID(),
                name: strategyName || "Untitled Strategy",
                mapName: selectedMap.displayName,
                mapUuid: selectedMap.uuid,
                side: isAlly ? "DEF" : "ATK",
                elements,
                createdAt: now,
                updatedAt: now
            };
            setSavedStrategies(prev => [newStrategy, ...prev]);
            setCurrentStrategyId(newStrategy.id);
        }
    };

    const loadStrategy = (strategy: SavedStrategy) => {
        setElements(strategy.elements);
        setStrategyName(strategy.name);
        setCurrentStrategyId(strategy.id);
        setIsAlly(strategy.side === "DEF");
        const map = maps.find(m => m.uuid === strategy.mapUuid);
        if (map) setSelectedMap(map);
        setCurrentStep(1);
    };

    const createNewStrategy = () => {
        setElements([]);
        setStrategyName("New Strategy");
        setCurrentStrategyId(null);
        setCurrentStep(1);
    };

    const deleteStrategy = (id: string) => {
        setSavedStrategies(prev => prev.filter(s => s.id !== id));
        if (currentStrategyId === id) {
            createNewStrategy();
        }
        if (savedStrategies.length <= 1) {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };


    const [history, setHistory] = useState<BoardElement[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const addToHistory = (newElements: BoardElement[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setElements(newElements);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setElements(history[historyIndex - 1]);
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setElements([]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setElements(history[historyIndex + 1]);
        }
    };

    const updateElements = (newElements: BoardElement[]) => {
        addToHistory(newElements);
    };

    const [isDraggingElement, setIsDraggingElement] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [initialDragState, setInitialDragState] = useState<BoardElement[] | null>(null);

    const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };

        const rect = svgRef.current.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: ((clientX - rect.left) / rect.width) * 1000,
            y: ((clientY - rect.top) / rect.height) * 1000,
        };
    };

    const handleElementMouseDown = (e: React.MouseEvent | React.TouchEvent, el: BoardElement) => {
        if (activeTool !== 'select') return;

        e.stopPropagation(); // Prevent canvas drag/drawing

        const { x, y } = getMousePos(e);
        setSelectedElementId(el.id);
        setIsDraggingElement(true);
        setDragOffset({ x: x - el.x, y: y - el.y });
        setInitialDragState(elements); // Save state before drag for history if we implemented "commit on release"
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (activeTool === "select") {
            setSelectedElementId(null);
            return;
        }

        if (["smoke", "flash", "molly", "spike"].includes(activeTool)) {
            const { x, y } = getMousePos(e);

            const newElement: BoardElement = {
                id: crypto.randomUUID(),
                type: "shape",
                shapeType: activeTool as any,
                x,
                y,
                color: activeColor,
                scale: 1,
                step: currentStep
            };
            updateElements([...elements, newElement]);
            return;
        }

        setIsDrawing(true);
        const { x, y } = getMousePos(e);

        if (activeTool === "pen") {
            setCurrentPoints([{ x, y }]);
        } else if (activeTool === "line" || activeTool === "arrow") {
            setCurrentPoints([{ x, y }, { x, y }]);
        } else if (activeTool === "text") {
            const text = prompt("Enter text label:");
            if (text) {
                const newElement: BoardElement = {
                    id: crypto.randomUUID(),
                    type: "text",
                    x,
                    y,
                    text,
                    color: activeColor,
                    scale: 1,
                    step: currentStep
                };
                updateElements([...elements, newElement]);
            }
            setIsDrawing(false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const { x, y } = getMousePos(e);

        if (activeTool === 'select' && isDraggingElement && selectedElementId) {
            setElements(prevElements => prevElements.map(el => {
                if (el.id === selectedElementId) {
                    return { ...el, x: x - dragOffset.x, y: y - dragOffset.y };
                }
                return el;
            }));
            return;
        }

        if (!isDrawing) return;

        if (activeTool === "pen") {
            setCurrentPoints((prev) => [...prev, { x, y }]);
        } else if (activeTool === "line" || activeTool === "arrow") {
            setCurrentPoints((prev) => [prev[0], { x, y }]);
        }
    };

    const handleMouseUp = () => {
        if (activeTool === 'select' && isDraggingElement) {
            setIsDraggingElement(false);
            if (initialDragState) {
                addToHistory(elements);
            }
            setInitialDragState(null);
            return;
        }

        if (!isDrawing) return;
        setIsDrawing(false);

        if (activeTool === "pen" && currentPoints.length > 1) {
            const newElement: BoardElement = {
                id: crypto.randomUUID(),
                type: "path",
                x: 0,
                y: 0,
                points: currentPoints,
                color: activeColor,
                scale: 4,
                step: currentStep
            };
            updateElements([...elements, newElement]);
        } else if ((activeTool === "line" || activeTool === "arrow") && currentPoints.length === 2) {
            const newElement: BoardElement = {
                id: crypto.randomUUID(),
                type: activeTool,
                x: currentPoints[0].x,
                y: currentPoints[0].y,
                endX: currentPoints[1].x,
                endY: currentPoints[1].y,
                color: activeColor,
                scale: 4,
                step: currentStep
            };
            updateElements([...elements, newElement]);
        }

        setCurrentPoints([]);
    };

    const handleDragStart = (e: React.DragEvent, agent: Agent) => {
        e.dataTransfer.setData("agent_uuid", agent.uuid);
        e.dataTransfer.setData("agent_icon", agent.displayIcon);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!svgRef.current) return;

        const iconUrl = e.dataTransfer.getData("agent_icon");
        if (!iconUrl) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 1000;
        const y = ((e.clientY - rect.top) / rect.height) * 1000;

        const newElement: BoardElement = {
            id: crypto.randomUUID(),
            type: "icon",
            x,
            y,
            iconUrl,
            scale: 1,
            step: currentStep
        };

        updateElements([...elements, newElement]);
    };

    const deleteSelected = useCallback(() => {
        if (selectedElementId) {
            updateElements(elements.filter(el => el.id !== selectedElementId));
            setSelectedElementId(null);
        }
    }, [selectedElementId, elements]);

    const clearBoard = () => {
        if (confirm("Clear all items from this board?")) {
            addToHistory([]);
        }
    };

    const saveBoard = () => {
        if (!svgRef.current) return;
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = 1000;
            canvas.height = 1000;
            if (ctx) {
                ctx.fillStyle = "#0f0f18";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const link = document.createElement("a");
                link.download = `strat-${selectedMap?.displayName}-step${currentStep}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
                deleteSelected();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selectedElementId, deleteSelected]);


    const renderElement = (el: BoardElement) => {
        if (el.step !== undefined && el.step > currentStep) return null;

        const isSelected = el.id === selectedElementId;
        const isPastStep = el.step !== undefined && el.step < currentStep;

        let opacity = isPastStep ? 0.4 : 1;
        if (isSelected) opacity = 0.8;

        const style = { cursor: activeTool === "select" ? "move" : "default", opacity };
        const props = {
            onMouseDown: (e: React.MouseEvent | React.TouchEvent) => handleElementMouseDown(e, el),
            className: `pointer-events-auto transition-opacity duration-200 ${activeTool === 'select' ? "hover:opacity-60" : ""}`,
            style
        };

        const renderShape = () => {
            const size = 40 * (el.scale || 1);
            if (el.shapeType === 'smoke') {
                return <circle cx={el.x} cy={el.y} r={size / 2} fill={el.color} fillOpacity="0.3" stroke={el.color} strokeWidth="2" />;
            } else if (el.shapeType === 'molly') {
                return <circle cx={el.x} cy={el.y} r={size / 2} fill="transparent" stroke={el.color} strokeWidth="2" strokeDasharray="4 2" />;
            } else if (el.shapeType === 'flash') {
                return (
                    <path
                        d={`M ${el.x} ${el.y - size / 2} Q ${el.x + size / 2} ${el.y - size / 4} ${el.x + size / 2} ${el.y} Q ${el.x} ${el.y + size / 2} ${el.x - size / 2} ${el.y} Q ${el.x - size / 2} ${el.y - size / 4} ${el.x} ${el.y - size / 2}`}
                        fill="#fbbf24" fillOpacity="0.4" stroke="#fbbf24" strokeWidth="2"
                    />
                );
            } else if (el.shapeType === 'spike') {
                return (
                    <g transform={`translate(${el.x - 15}, ${el.y - 15}) scale(1.5)`}>
                        <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" fill="#ef4444" stroke="white" strokeWidth="1" />
                    </g>
                )
            }
            return null;
        }

        switch (el.type) {
            case "path":
                if (!el.points) return null;
                const pathData = `M ${el.points.map(p => `${p.x} ${p.y}`).join(" L ")}`;
                return (
                    <path
                        key={el.id}
                        d={pathData}
                        stroke={el.color}
                        strokeWidth={el.scale}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        {...props}
                    />
                );
            case "line":
                return (
                    <line
                        key={el.id}
                        x1={el.x}
                        y1={el.y}
                        x2={el.endX}
                        y2={el.endY}
                        stroke={el.color}
                        strokeWidth={el.scale}
                        strokeLinecap="round"
                        {...props}
                    />
                );
            case "arrow":
                const angle = Math.atan2((el.endY || 0) - el.y, (el.endX || 0) - el.x);
                const headLen = 20;
                return (
                    <g key={el.id} {...props}>
                        <line
                            x1={el.x}
                            y1={el.y}
                            x2={el.endX}
                            y2={el.endY}
                            stroke={el.color}
                            strokeWidth={el.scale}
                            strokeLinecap="round"
                        />
                        <path
                            d={`M ${el.endX} ${el.endY} L ${(el.endX || 0) - headLen * Math.cos(angle - Math.PI / 6)} ${(el.endY || 0) - headLen * Math.sin(angle - Math.PI / 6)} M ${el.endX} ${el.endY} L ${(el.endX || 0) - headLen * Math.cos(angle + Math.PI / 6)} ${(el.endY || 0) - headLen * Math.sin(angle + Math.PI / 6)}`}
                            stroke={el.color}
                            strokeWidth={el.scale}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </g>
                );
            case "text":
                return (
                    <text
                        key={el.id}
                        x={el.x}
                        y={el.y}
                        fill={el.color}
                        fontSize={24 * (el.scale || 1)}
                        fontFamily="rajdhani, monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        {...props}
                    >
                        {el.text}
                    </text>
                );
            case "icon":
                return (
                    <image
                        key={el.id}
                        x={el.x - 25}
                        y={el.y - 25}
                        width={50 * (el.scale || 1)}
                        height={50 * (el.scale || 1)}
                        href={el.iconUrl}
                        {...props}
                    />
                );
            case "shape":
                return (
                    <g key={el.id} {...props}>
                        {renderShape()}
                    </g>
                )
            default:
                return null;
        }
    };


    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0f] text-emerald-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="font-rajdhani text-lg animate-pulse">Initializing Command Center...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="h-[calc(100vh-64px)] w-full bg-[#0a0a0f] flex overflow-hidden font-rajdhani">
            <div className="w-80 bg-[#0f0f13] border-r border-white/5 flex flex-col shrink-0 z-20 shadow-2xl">

                <div className="p-4 border-b border-white/5 relative overflow-hidden group">
                    {selectedMap ? (
                        <div className="relative h-28 rounded-xl overflow-hidden border border-white/10">
                            <img src={selectedMap.splash || ""} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-3 left-4">
                                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{selectedMap.displayName}</h2>
                                <button onClick={() => setIsAlly(!isAlly)} className="flex items-center gap-2 text-xs font-mono mt-1">
                                    <div className={`w-2 h-2 rounded-full ${isAlly ? "bg-cyan-400" : "bg-red-500"}`} />
                                    <span className={isAlly ? "text-cyan-400" : "text-red-400"}>{isAlly ? "DEFENSE" : "ATTACK"}</span>
                                </button>
                            </div>
                            <div className="absolute top-2 right-2">
                                <div className="p-1.5 bg-black/50 backdrop-blur rounded-lg hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer" title="Switch Map">
                                    <MapIcon className="w-4 h-4 text-white/70" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-28 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">No Map Selected</div>
                    )}
                </div>

                <div className="px-4 py-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sequence</h3>
                        <div className="text-xs text-gray-600">Step {currentStep}/10</div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
                            <button
                                key={step}
                                onClick={() => setCurrentStep(step)}
                                className={`h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${currentStep === step ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                            >
                                {step}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-4 border-b border-white/5 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Actions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button onClick={undo} disabled={historyIndex < 0} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
                            <Undo className="w-4 h-4" /> Undo
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)">
                            <Redo className="w-4 h-4" /> Redo
                        </button>
                    </div>
                    <button onClick={clearBoard} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear Board
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={saveCurrentStrategy} className="py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-gray-400 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                            <Save className="w-3 h-3" /> Save Strat
                        </button>
                        <button onClick={saveBoard} className="py-2 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg text-gray-400 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                            <Camera className="w-3 h-3" /> Screenshot
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-4 py-4 overflow-y-auto">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Tools</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: "select", icon: MousePointer2, label: "Select" },
                            { id: "pen", icon: Pen, label: "Draw" },
                            { id: "line", icon: Move, label: "Line" },
                            { id: "arrow", icon: ChevronRight, label: "Arrow" },
                            { id: "text", icon: Type, label: "Text" },
                            { id: "eraser", icon: Eraser, label: "Erase" },
                            { id: "spike", icon: Triangle, label: "Spike", color: "text-red-500" },
                            { id: "smoke", icon: Circle, label: "Smoke" },
                            { id: "molly", icon: X, label: "Molly" },
                            { id: "flash", icon: Zap, label: "Flash" },
                        ].map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id as ToolType)}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all border ${activeTool === tool.id ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300"}`}
                                title={tool.label}
                            >
                                <tool.icon className={`w-5 h-5 ${tool.color || ""}`} />
                            </button>
                        ))}
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-6 mb-3">Colors</h3>
                    <div className="grid grid-cols-6 gap-2">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => setActiveColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${activeColor === color ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-110"}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative bg-[#050508] overflow-hidden">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <select
                        className="bg-[#0f0f18]/90 text-white text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-emerald-500 outline-none backdrop-blur-md"
                        value={selectedMap?.uuid || ""}
                        onChange={(e) => {
                            const m = maps.find(m => m.uuid === e.target.value);
                            if (m) setSelectedMap(m);
                        }}
                    >
                        {maps.map(m => (
                            <option key={m.uuid} value={m.uuid}>{m.displayName}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                    <div
                        className="relative aspect-square h-full max-h-[calc(100vh-80px)] shadow-2xl rounded-xl overflow-hidden bg-[#1a1a20] border border-white/10"
                    >
                        {selectedMap ? (
                            <img
                                src={selectedMap.displayIcon || ""}
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-100 select-none bg-white/5"
                                alt="Map"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-mono">
                                No Map Image Available
                            </div>
                        )}

                        <svg
                            ref={svgRef}
                            className={`absolute inset-0 w-full h-full touch-none ${activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
                            viewBox="0 0 1000 1000"
                            preserveAspectRatio="none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <defs>
                                <pattern id="subgrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                                </pattern>
                                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                    <rect width="100" height="100" fill="url(#subgrid)" />
                                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" pointerEvents="none" />

                            {elements.map(renderElement)}

                            {isDrawing && activeTool === 'pen' && (
                                <path
                                    d={`M ${currentPoints.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                                    stroke={activeColor}
                                    strokeWidth={4}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.6"
                                    pointerEvents="none"
                                />
                            )}
                            {isDrawing && (activeTool === 'line' || activeTool === 'arrow') && currentPoints.length > 1 && (
                                <line
                                    x1={currentPoints[0].x}
                                    y1={currentPoints[0].y}
                                    x2={currentPoints[currentPoints.length - 1].x}
                                    y2={currentPoints[currentPoints.length - 1].y}
                                    stroke={activeColor}
                                    strokeWidth={4}
                                    strokeLinecap="round"
                                    opacity="0.6"
                                    pointerEvents="none"
                                />
                            )}
                        </svg>
                    </div>
                </div>

                <div className="h-20 bg-[#0c0c10] border-t border-white/5 flex items-center px-6 shrink-0 z-20 overflow-x-auto">
                    <div className="flex items-center gap-2 mr-6 border-r border-white/10 pr-6">
                        <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Agents</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {agents.map((agent) => (
                            <div
                                key={agent.uuid}
                                draggable
                                onDragStart={(e) => handleDragStart(e, agent)}
                                className="w-12 h-12 shrink-0 rounded border border-white/10 hover:border-emerald-500 hover:scale-105 transition-all cursor-grab active:cursor-grabbing bg-cover bg-center bg-[#1a1a20] relative group"
                                style={{ backgroundImage: `url(${agent.displayIcon})` }}
                                title={agent.displayName}
                            >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute top-1/2 -translate-y-1/2 z-30 p-2 bg-[#0f0f13] border border-white/10 rounded-l-xl text-gray-400 hover:text-emerald-500 hover:bg-white/5 transition-all shadow-xl"
                style={{ right: isSidebarOpen ? "16rem" : "0" }}
            >
                {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div
                className={`bg-[#0f0f13] border-l border-white/5 flex flex-col shrink-0 z-20 shadow-2xl transition-all duration-300 overflow-hidden ${isSidebarOpen ? "w-64" : "w-0 border-l-0"}`}
            >
                <div className="w-64 flex flex-col h-full">
                    <div className="p-4 border-b border-white/5">
                        <h2 className="text-lg font-bold text-white mb-3">My Strategies</h2>
                        <input
                            type="text"
                            value={strategyName}
                            onChange={(e) => setStrategyName(e.target.value)}
                            placeholder="Strategy name..."
                            className="w-full px-3 py-2 mb-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:border-emerald-500 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={createNewStrategy}
                                className="py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                            >
                                <Plus className="w-3 h-3" />
                                New
                            </button>
                            <button
                                onClick={saveCurrentStrategy}
                                className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1"
                            >
                                <Save className="w-3 h-3" />
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {savedStrategies.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No saved strategies yet.<br />
                                Create your first one!
                            </div>
                        ) : (
                            savedStrategies.map(strategy => (
                                <div
                                    key={strategy.id}
                                    onClick={() => loadStrategy(strategy)}
                                    className={`group p-3 rounded-xl border cursor-pointer transition-all ${currentStrategyId === strategy.id
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-white/5 border-white/5 hover:border-emerald-500/30 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-bold text-sm truncate ${currentStrategyId === strategy.id ? "text-emerald-400" : "text-gray-300 group-hover:text-emerald-400"}`}>
                                            {strategy.name}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${strategy.side === "ATK" ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                                                {strategy.side}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteStrategy(strategy.id); }}
                                                className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {strategy.mapName} • {formatTimeAgo(strategy.updatedAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
