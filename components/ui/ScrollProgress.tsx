'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

const ScrollProgress = () => {
    const trackRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Track scroll position to show/hide the component
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            // Show after scrolling 200px from top
            setIsVisible(scrollPosition > 200);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial position

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Map scroll progress to the horizontal position (left: 0% to 100%)
    const indicatorX = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

    // Generate ticks (41 ticks for a nice ruler density)
    const ticks = Array.from({ length: 41 });

    // Handle drag to scroll
    const handleDrag = (event: any, info: any) => {
        if (!trackRef.current) return;

        const trackRect = trackRef.current.getBoundingClientRect();
        const trackWidth = trackRect.width;

        // Calculate position relative to track, clamped to bounds
        const relativeX = Math.max(0, Math.min(trackWidth, info.point.x - trackRect.left));
        const progress = relativeX / trackWidth;

        // Scroll to the corresponding position
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({
            top: progress * maxScroll,
            behavior: 'auto'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
                >
                    {/* Glass Container */}
                    <div className="relative w-80 h-16 flex items-center px-4 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">

                        {/* The Ruler Track */}
                        <div ref={trackRef} className="relative w-full h-8 flex items-center justify-between">
                            {ticks.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-[1px] rounded-full transition-colors duration-300 ${i % 5 === 0 ? 'h-3 bg-white/50' : 'h-1.5 bg-white/20'
                                        }`}
                                />
                            ))}

                            {/* Moving Red Indicator - Now Draggable with proper constraints */}
                            <motion.div
                                drag="x"
                                dragConstraints={trackRef}
                                dragElastic={0}
                                dragMomentum={false}
                                onDrag={handleDrag}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={() => setIsDragging(false)}
                                style={{
                                    left: isDragging ? undefined : indicatorX
                                }}
                                className={`absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'
                                    } transition-transform`}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScrollProgress;
