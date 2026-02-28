"use client";

import { useEffect, useState } from "react";

export function FuturisticBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate particles only on client side
    setParticles(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: `${Math.random() * 3}s`,
        duration: `${3 + Math.random() * 4}s`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Dark base gradient - Futuristic dark cyan/slate */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950" />

      {/* Animated circuit lines - matches logo circuit pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-bg" patternUnits="userSpaceOnUse" width="100" height="100">
              <path d="M10 10 L30 10 L30 30 M30 10 L50 10 M30 30 L30 50 M30 30 L50 30"
                stroke="url(#circuit-gradient)"
                strokeWidth="2"
                fill="none" />
              <circle cx="10" cy="10" r="3" fill="url(#circuit-gradient)" />
              <circle cx="50" cy="10" r="3" fill="url(#circuit-gradient)" />
              <circle cx="30" cy="50" r="3" fill="url(#circuit-gradient)" />
              <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-bg)" />
        </svg>
      </div>

      {/* Animated particles - matches logo light particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Glowing orbs - matches logo blue/cyan theme */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl" />

      {/* Grid overlay - subtle tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
}
