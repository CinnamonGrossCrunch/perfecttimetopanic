"use client";

import React, { useEffect, useRef, useState } from "react";

const gradients = [
    ["#1a1a1a", "#2d130f", "#b34723", "#ff6f3c"], // black → deep red-orange
    ["#2d130f", "#1a1a1a", "#ff6f3c", "#b34723"],
    ["#b34723", "#2d130f", "#1a1a1a", "#ff6f3c"], // deep red-orange → black
    ["#ff6f3c", "#b34723", "#2d130f", "#1a1a1a"], // red-orange → deep red
    ["#1a1a1a", "#ff6f3c", "#b34723", "#2d130f"], // black → red-orange
    ["#2d130f", "#b34723", "#ff6f3c", "#1a1a1a"], // deep red → black
    ["#b34723", "#ff6f3c", "#2d130f", "#1a1a1a"], // deep red → black   
];

// The gradient direction/location is set in the `background` variable below as `linear-gradient(120deg, ...)`.
// The `120deg` specifies the angle/direction of the gradient.

function interpolateColor(c1: string, c2: string, factor: number) {
    const parseHex = (hex: string) =>
        hex.startsWith("#") ? hex.slice(1) : hex;
    const hexToRgb = (hex: string) =>
        [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const rgb1 = hexToRgb(parseHex(c1));
    const rgb2 = hexToRgb(parseHex(c2));
    const blended = rgb1.map((v, i) =>
        Math.round(v + factor * (rgb2[i] - v))
    );
    return `rgb(${blended[0]},${blended[1]},${blended[2]})`;
}

const AnimatedBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);
    const [factor, setFactor] = useState(0);

    useEffect(() => {
        let frame: number;
        let start: number | null = null;
        const duration = 1000; // 🔥 faster morph time

        function animate(timestamp: number) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const localFactor = Math.min(elapsed / duration, 1);
            setFactor(localFactor);

            if (localFactor < 1) {
                frame = requestAnimationFrame(animate);
            } else {
                setIndex((prev) => (prev + 1) % gradients.length);
                setFactor(0);
                start = null;
                frame = requestAnimationFrame(animate);
            }
        }

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [index]);

    const current = gradients[index];
    const next = gradients[(index + 1) % gradients.length];

    const background = `linear-gradient(90deg, 
        ${interpolateColor(current[0], next[0], factor)} 0%, 
        ${interpolateColor(current[1], next[1], factor)} 15%, 
        ${interpolateColor(current[2], next[2], factor)} 30%, 
        ${interpolateColor(current[3], next[3], factor)} 45%, 
        ${interpolateColor(current[0], next[0], factor)} 60%, 
        ${interpolateColor(current[1], next[1], factor)} 75%, 
        ${interpolateColor(current[2], next[2], factor)} 90%, 
        ${interpolateColor(current[3], next[3], factor)} 100%
    )`;

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                width: "100vw",
                height: "100vh",
                // No background here, handled by layers below
            }}
        >
            {/* Black solid layer under everything
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "#000",
                    zIndex: 0,
                }}
            /> */}
            {/* Animated gradient layer */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background,
                    transition: "background 0.5s linear",
                    zIndex: 2,
                    opacity: 1, // Changed opacity for the animation layer
                    mixBlendMode: "multiply", // Changed blend mode for the animation layer
                }}
            />
            {/* Overlay for smoke / darkness */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
                    pointerEvents: "none",
                    zIndex: 3,
                }}
            />
            {/* Dark gradient from the bottom */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgb(8, 4, 1) 40%, rgba(19, 9, 2, 0) 100%)",
                    opacity: 1, // Adjusted opacity for the dark gradient
                    pointerEvents: "none",
                    zIndex: 3,
                }}
            
            />
            {/* Noise overlay (commented out)
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "url('/wavecut.png')repeat",
                    backgroundSize: "200px 20px",
                    opacity: .8,
                    pointerEvents: "none",
                    zIndex: 4,
                    mixBlendMode: "SCREEN",
                    filter: "blur(0.5px) brightness(0.8)",
                    transform: "rotate(90deg)",
                }}
            /> */}
        </div>
    );
};

export default AnimatedBackground;
