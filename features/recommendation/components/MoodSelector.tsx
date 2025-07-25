import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MOODS } from '../constants';
import StepContainer from '../../../components/StepContainer';

interface MoodSelectorProps {
    onSelect: (data: { mood: string }) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect }) => {
    // Start with the 'Laugh' mood as the initial focus
    const [activeIndex, setActiveIndex] = useState(1);
    const carouselRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({
        isDown: false,
        isDragging: false,
        startX: 0,
        startRotation: 0,
        longPressTimeout: -1,
        currentRotation: -(1 / MOODS.length) * 360,
    });

    const getBaseRotation = useCallback((index: number) => {
        return -(index / MOODS.length) * 360;
    }, []);

    // Effect to animate the carousel snapping into place when the activeIndex changes.
    useEffect(() => {
        const targetRotation = getBaseRotation(activeIndex);
        dragInfo.current.currentRotation = targetRotation;
        if (carouselRef.current) {
            carouselRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            carouselRef.current.style.transform = `rotateY(${targetRotation}deg)`;
        }
    }, [activeIndex, getBaseRotation]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (carouselRef.current) {
            carouselRef.current.style.transition = 'none'; // Disable transition during drag
            carouselRef.current.style.cursor = 'grabbing';
        }
        
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        dragInfo.current.isDown = true;
        dragInfo.current.startX = e.clientX;
        dragInfo.current.startRotation = dragInfo.current.currentRotation;

        // Differentiate a tap from a drag with a small delay
        dragInfo.current.longPressTimeout = window.setTimeout(() => {
            dragInfo.current.isDragging = true;
        }, 150);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragInfo.current.isDown) return;

        const deltaX = e.clientX - dragInfo.current.startX;
        
        // If the user moves more than a few pixels, it's a drag.
        if (!dragInfo.current.isDragging && Math.abs(deltaX) > 10) {
            dragInfo.current.isDragging = true;
            clearTimeout(dragInfo.current.longPressTimeout);
        }
        
        if (dragInfo.current.isDragging) {
            const containerWidth = window.innerWidth;
            // A drag of half the screen width corresponds to one card rotation
            const rotationFactor = (360 / MOODS.length) / (containerWidth / 2); 
            const rotationOffset = deltaX * rotationFactor;
            
            const newRotation = dragInfo.current.startRotation + rotationOffset;
            dragInfo.current.currentRotation = newRotation;
            
            // Apply rotation directly to the DOM for performance
            if (carouselRef.current) {
                carouselRef.current.style.transform = `rotateY(${newRotation}deg)`;
            }
        }
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        clearTimeout(dragInfo.current.longPressTimeout);

        if (carouselRef.current) {
            carouselRef.current.style.cursor = 'grab';
        }

        if (dragInfo.current.isDragging) {
            const cardAngle = 360 / MOODS.length;
            const currentRotation = dragInfo.current.currentRotation;
            
            // Snap to the nearest card based on the final rotation
            const newIndex = Math.round(-currentRotation / cardAngle);
            const clampedIndex = (newIndex % MOODS.length + MOODS.length) % MOODS.length;

            // Setting activeIndex triggers the useEffect to animate the snap
            setActiveIndex(clampedIndex);

        } else {
            // If it wasn't a drag, it was a tap. Select the active mood.
            onSelect({ mood: MOODS[activeIndex].id });
        }
        
        dragInfo.current.isDown = false;
        dragInfo.current.isDragging = false;

    }, [activeIndex, onSelect]);

    const cardAngle = 360 / MOODS.length;
    // Make the carousel radius responsive for different screen sizes
    const radius = Math.min(Math.max(window.innerWidth / 4, 180), 280);

    return (
        <StepContainer title="How are you feeling tonight?" subtitle="Tap a mood to select, or drag to spin.">
            <div
                className="relative w-full h-80 flex items-center justify-center select-none touch-none"
                style={{ perspective: '1200px' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div
                    ref={carouselRef}
                    className="relative w-full h-full cursor-grab"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {MOODS.map((mood, index) => {
                        const angle = cardAngle * index;
                        const transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
                        const isCardActive = index === activeIndex;

                        return (
                            <div
                                key={mood.id}
                                className="absolute inset-0 m-auto w-64 h-64 md:w-72 md:h-72"
                                style={{ transform, pointerEvents: 'none' }} // Cards don't capture events
                            >
                                <div className={`w-full h-full bg-surface/60 border border-primary/50 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 p-6 transition-all duration-500 ${isCardActive ? 'scale-105 shadow-accent/20 border-accent/50 opacity-100' : 'opacity-60'}`}>
                                    <div className={`w-36 h-36 md:w-48 md:h-48 text-accent transition-transform duration-500 ${isCardActive ? 'scale-100' : 'scale-90'}`}>{mood.icon}</div>
                                    <span className="text-2xl md:text-3xl font-bold text-text-primary">{mood.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </StepContainer>
    );
};

export default MoodSelector;
