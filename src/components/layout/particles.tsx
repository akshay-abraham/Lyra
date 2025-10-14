'use client';
import React, { useEffect, useState } from 'react';

const NUM_PARTICLES = 100;

interface ParticleStyle {
    left: string;
    animationDelay: string;
    animationDuration: string;
    width: string;
    height: string;
}

export function Particles() {
    const [particleStyles, setParticleStyles] = useState<ParticleStyle[]>([]);

    useEffect(() => {
        const styles: ParticleStyle[] = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            const size = Math.random() * 4 + 2;
            styles.push({
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 25}s`,
                animationDuration: `${Math.random() * 15 + 20}s`,
                width: `${size}px`,
                height: `${size}px`,
            });
        }
        setParticleStyles(styles);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
            {particleStyles.map((style, index) => (
                <div key={index} className="particle" style={{...style, bottom: '-20px'}} />
            ))}
        </div>
    );
}
