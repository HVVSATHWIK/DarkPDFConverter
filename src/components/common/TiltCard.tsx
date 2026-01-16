import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
}

export const TiltCard = ({ children, className = "" }: TiltCardProps) => {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for X and Y mouse position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Keep this subtle; the app already has a 3D scene.
    const mouseX = useSpring(x, { stiffness: 120, damping: 22 });
    const mouseY = useSpring(y, { stiffness: 120, damping: 22 });

    // Map mouse position to Rotation (very subtle)
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["2deg", "-2deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-2deg", "2deg"]);

    // Dynamic Glare: Moves opposite to tilt
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
    const glareOpacity = useTransform(mouseX, [-0.5, 0.5], [0, 0.12]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d", // Essential for 3D effect
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-[24px] perspective-1000 overflow-hidden ${className}`}
        >
            {/* The Liquid Glass Container */}
            <div className="card-liquid-glass absolute inset-0 w-full h-full overflow-hidden backface-hidden">

                {/* The Glare Layer */}
                <motion.div
                    style={{
                        opacity: glareOpacity,
                        background: `radial-gradient(
              circle at ${glareX} ${glareY}, 
                            rgba(255,255,255,0.28) 0%, 
                            transparent 70%
            )`
                    }}
                    className="absolute inset-0 pointer-events-none z-10"
                />

                {/* Content Layer (Projected forward slightly) */}
                <div className="relative z-20 h-full min-h-0 flex flex-col transform translate-z-10">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};
