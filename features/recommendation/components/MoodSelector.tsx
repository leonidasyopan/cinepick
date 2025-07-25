
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MOODS } from '../constants';
import StepContainer from '../../../components/StepContainer';
import { useI18n } from '../../../src/i18n/i18n';

interface MoodSelectorProps {
    onSelect: (data: { mood: string }) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect }) => {
    const { t, getTimeOfDayTerm } = useI18n();
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
            carouselRef.current.style.transition = 'none';
            carouselRef.current.style.cursor = 'grabbing';
        }
        
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        dragInfo.current.isDown = true;
        dragInfo.current.startX = e.clientX;
        dragInfo.current.startRotation = dragInfo.current.currentRotation;

        dragInfo.current.longPressTimeout = window.setTimeout(() => {
            dragInfo.current.isDragging = true;
        }, 150);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragInfo.current.isDown) return;

        const deltaX = e.clientX - dragInfo.current.startX;
        
        if (!dragInfo.current.isDragging && Math.abs(deltaX) > 10) {
            dragInfo.current.isDragging = true;
            clearTimeout(dragInfo.current.longPressTimeout);
        }
        
        if (dragInfo.current.isDragging) {
            const containerWidth = window.innerWidth;
            const rotationFactor = (360 / MOODS.length) / (containerWidth / 2); 
            const rotationOffset = deltaX * rotationFactor;
            
            const newRotation = dragInfo.current.startRotation + rotationOffset;
            dragInfo.current.currentRotation = newRotation;
            
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
            
            const newIndex = Math.round(-currentRotation / cardAngle);
            const clampedIndex = (newIndex % MOODS.length + MOODS.length) % MOODS.length;

            setActiveIndex(clampedIndex);

        } else {
            onSelect({ mood: MOODS[activeIndex].id });
        }
        
        dragInfo.current.isDown = false;
        dragInfo.current.isDragging = false;

    }, [activeIndex, onSelect]);

    const cardAngle = 360 / MOODS.length;
    const radius = Math.min(Math.max(window.innerWidth / 4, 180), 280);

    return (
        <StepContainer title={t('moodSelector.title', { timeOfDay: getTimeOfDayTerm() })} subtitle={t('moodSelector.subtitle')}>
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
                                style={{ transform, pointerEvents: 'none' }}
                            >
                                <div className={`w-full h-full bg-surface/60 border border-primary/50 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 p-6 transition-all duration-500 ${isCardActive ? 'scale-105 shadow-accent/20 border-accent/50 opacity-100' : 'opacity-60'}`}>
                                    <div className={`w-36 h-36 md:w-48 md:h-48 text-accent transition-transform duration-500 ${isCardActive ? 'scale-100' : 'scale-90'}`}>{mood.icon}</div>
                                    <span className="text-2xl md:text-3xl font-bold text-text-primary">{t(mood.labelKey)}</span>
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