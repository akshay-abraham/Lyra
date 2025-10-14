'use client';
import React, { useEffect, useState } from 'react';

const NUM_PARTICLES = 15;

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
            const size = Math.random() * 3 + 1; // size between 1px and 4px
            styles.push({
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 25}s`,
                animationDuration: `${Math.random() * 20 + 20}s`, // duration between 20s and 40s
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
