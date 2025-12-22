"use client";

import { useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { type Paths, setupSvgRenderer } from "@left4code/svg-renderer";
import { cva, type VariantProps } from "class-variance-authority";

function Frame({
    className,
    paths,
    enableBackdropBlur,
    enableViewBox,
    ...props
}: {
    paths: Paths;
    enableBackdropBlur?: boolean;
    enableViewBox?: boolean;
} & React.ComponentProps<"svg">) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (svgRef.current && svgRef.current.parentElement) {
            const instance = setupSvgRenderer({
                el: svgRef.current,
                paths,
                enableBackdropBlur,
                enableViewBox,
            });

            return () => instance.destroy();
        }
    }, [paths, enableViewBox, enableBackdropBlur]);

    return (
        <svg
            {...props}
            className={twMerge(["absolute inset-0 size-full", className])}
            xmlns="http://www.w3.org/2000/svg"
            ref={svgRef}
        />
    );
}

const COLORS = {
    default: {
        stroke1: "#00fff7",
        fill1: "rgba(0, 255, 247, 0.22)",
        stroke2: "#00fff7",
        fill2: "rgba(0, 255, 247, 0.1)",
        text: "#ffffff",
    },
    accent: {
        stroke1: "#39ff14",
        fill1: "rgba(57, 255, 20, 0.4)",
        stroke2: "#39ff14",
        fill2: "rgba(57, 255, 20, 0.2)",
        text: "#ffffff",
    },
    destructive: {
        stroke1: "#ff4444",
        fill1: "rgba(255, 68, 68, 0.22)",
        stroke2: "#ff4444",
        fill2: "rgba(255, 68, 68, 0.1)",
        text: "#ffffff",
    },
    secondary: {
        stroke1: "#64748b",
        fill1: "rgba(100, 116, 139, 0.15)",
        stroke2: "#64748b",
        fill2: "rgba(100, 116, 139, 0.1)",
        text: "#ffffff",
    },
    success: {
        stroke1: "#39ff14",
        fill1: "rgba(57, 255, 20, 0.22)",
        stroke2: "#39ff14",
        fill2: "rgba(57, 255, 20, 0.1)",
        text: "#ffffff",
    },
};

const buttonVariants = cva(
    "group font-bold mb-2 relative px-8 py-2 cursor-pointer transition-all outline-none [&>span]:relative [&>span]:flex [&>span]:items-center [&>span]:justify-center",
    {
        variants: {
            shape: {
                default: "",
                flat: "",
                simple: "ps-8 pe-6",
            },
        },
        defaultVariants: {
            shape: "default",
        },
    }
);

function FutureButton({
    className,
    children,
    shape = "default",
    enableBackdropBlur = false,
    enableViewBox = false,
    customPaths,
    textColor,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        customPaths?: string[];
        enableBackdropBlur?: boolean;
        enableViewBox?: boolean;
        bgColor?: string;
        textColor?: string;
    }) {
    const colors = COLORS.default;

    return (
        <button
            {...props}
            style={{
                color: textColor || colors.text,
            }}
            className={twMerge(buttonVariants({ shape, className }))}
        >
            <div className="absolute inset-0 -mb-2">
                {!customPaths && (shape === "default" || shape === "flat") && (
                    <Frame
                        enableBackdropBlur={enableBackdropBlur}
                        enableViewBox={enableViewBox}
                        paths={[
                            {
                                show: true,
                                style: {
                                    strokeWidth: "1",
                                    stroke: colors.stroke1,
                                    fill: colors.fill1,
                                },
                                path: [
                                    ["M", "17", "0"],
                                    ["L", "100% - 7", "0"],
                                    ["L", "100% + 0", "0% + 9.5"],
                                    ["L", "100% - 18", "100% - 6"],
                                    ["L", "4", "100% - 6"],
                                    ["L", "0", "100% - 15"],
                                    ["L", "17", "0"],
                                ],
                            },
                            {
                                show: true,
                                style: {
                                    strokeWidth: "1",
                                    stroke: colors.stroke2,
                                    fill: colors.fill2,
                                },
                                path: [
                                    ["M", "9", "100% - 6"],
                                    ["L", "100% - 22", "100% - 6"],
                                    ["L", "100% - 25", "100% + 0"],
                                    ["L", "12", "100% + 0"],
                                    ["L", "9", "100% - 6"],
                                ],
                            },
                        ]}
                    />
                )}

                {!customPaths && shape === "simple" && (
                    <Frame
                        enableBackdropBlur={enableBackdropBlur}
                        enableViewBox={enableViewBox}
                        paths={[
                            {
                                show: true,
                                style: {
                                    strokeWidth: "1",
                                    stroke: colors.stroke1,
                                    fill: colors.fill1,
                                },
                                path: [
                                    ["M", "17", "0"],
                                    ["L", "100% - 0", "0"],
                                    ["L", "100% - 0", "100% - 6"],
                                    ["L", "0% + 3", "100% - 6"],
                                    ["L", "0% - 0", "100% - 16"],
                                    ["L", "17", "0"],
                                ],
                            },
                            {
                                show: true,
                                style: {
                                    strokeWidth: "1",
                                    stroke: colors.stroke2,
                                    fill: colors.fill2,
                                },
                                path: [
                                    ["M", "8", "100% - 6"],
                                    ["L", "100% - 5", "100% - 6"],
                                    ["L", "100% - 7", "100% - 0"],
                                    ["L", "10", "100% - 0"],
                                    ["L", "8", "100% - 6"],
                                ],
                            },
                        ]}
                    />
                )}

                {customPaths?.map((customPath, i) => (
                    <Frame key={i} paths={JSON.parse(customPath)} />
                ))}
            </div>
            <span>{children}</span>
        </button>
    );
}

export { Frame, FutureButton, COLORS };
export default FutureButton;
