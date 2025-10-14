'use client';
import React, { useEffect, useState } from 'react';

const NUM_PARTICLES = 20;

interface ParticleStyle {
    left: string;
    bottom: string;
    width: string;
    height: string;
    animationDelay: string;
    animationDuration: string;
}

export function Particles() {
    const [particleStyles, setParticleStyles] = useState<ParticleStyle[]>([]);

    useEffect(() => {
        const styles: ParticleStyle[] = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            const size = Math.random() * 5 + 2; // size between 2px and 7px
            styles.push({
                left: `${Math.random() * 100}%`,
                bottom: `-${Math.random() * 20 + 10}px`, // Start below the viewport
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${Math.random() * 25}s`,
                animationDuration: `${Math.random() * 20 + 15}s`, // duration between 15s and 35s
            });
        }
        setParticleStyles(styles);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
            {particleStyles.map((style, index) => (
                <div key={index} className="particle" style={style} />
            ))}
        </div>
    );
}
