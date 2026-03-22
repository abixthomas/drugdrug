"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BrainCircuit, Cpu, Network, Zap, Waves, CheckCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface AlgorithmProps {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: React.ElementType;
  accent: string;
}

const ALGORITHMS: AlgorithmProps[] = [
  {
    id: "QAOA",
    name: "QAOA",
    fullName: "Quantum Approximate Optimization",
    description: "Discrete optimization via parameterized quantum circuits for combinatorial molecular search.",
    icon: Network,
    accent: "#00d4ff",
  },
  {
    id: "VQE",
    name: "VQE",
    fullName: "Variational Quantum Eigensolver",
    description: "Ground-state energy estimation of molecular Hamiltonians with hybrid quantum-classical loops.",
    icon: Waves,
    accent: "#00aaff",
  },
  {
    id: "QPCA",
    name: "QPCA",
    fullName: "Quantum Principal Component Analysis",
    description: "Exponential speedup in dimensional reduction of high-dimensional chemical fingerprint spaces.",
    icon: BrainCircuit,
    accent: "#7b2ff7",
  },
  {
    id: "Grover",
    name: "Grover's",
    fullName: "Grover's Search Algorithm",
    description: "Quadratic speedup for unstructured molecular database search achieving quantum supremacy.",
    icon: Zap,
    accent: "#f59e0b",
  },
  {
    id: "QGA",
    name: "QGA",
    fullName: "Quantum Genetic Algorithm",
    description: "Evolutionary optimization merged with quantum superposition for unprecedented molecular diversity.",
    icon: Cpu,
    accent: "#10b981",
  },
];

interface AlgorithmSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function AlgorithmSelector({ selected, onSelect }: AlgorithmSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Section header
    gsap.fromTo(
      ".algo-header",
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 82%", toggleActions: "play none none none" },
      }
    );

    // Cards cascade
    gsap.fromTo(
      ".algo-card",
      { opacity: 0, y: 60, scale: 0.94, rotationX: 8 },
      {
        opacity: 1, y: 0, scale: 1, rotationX: 0,
        duration: 0.9, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 78%", toggleActions: "play none none none" },
      }
    );
  }, { scope: containerRef });

  return (
    <section id="algorithms" className="section-container" ref={containerRef}>
      {/* Header */}
      <div className="algo-header opacity-0 text-center mb-16">
        <div className="section-label mx-auto" style={{ width: "fit-content" }}>
          <BrainCircuit size={10} />
          <span>Quantum Architecture</span>
        </div>
        <h2 className="apple-heading text-5xl md:text-6xl mb-5" style={{ color: "var(--text)" }}>
          Pre-trained <span className="text-gradient-quantum">Algorithms</span>
        </h2>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <p className="apple-subheading text-lg" style={{ maxWidth: 672, textAlign: "center", width: "100%" }}>
            Select a pre-trained quantum model to begin generating novel SMILES strings.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {ALGORITHMS.map((algo) => {
          const isSelected = selected === algo.id;
          const Icon = algo.icon;

          return (
            <div
              key={algo.id}
              onClick={() => onSelect(algo.id)}
              className="algo-card opacity-0 border-glow-animated cursor-pointer smooth-transition"
              style={{
                borderRadius: 20,
                padding: "2rem",
                border: isSelected
                  ? `1.5px solid ${algo.accent}`
                  : "1px solid var(--qb-border)",
                background: isSelected
                  ? `linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,71,171,0.12) 100%)`
                  : "var(--qb-glass)",
                backdropFilter: "blur(24px)",
                boxShadow: isSelected
                  ? `0 0 40px ${algo.accent}30, 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 ${algo.accent}20`
                  : "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                transform: isSelected ? "translateY(-4px)" : "none",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}
            >
              {/* Sheen on selected */}
              {isSelected && (
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: `radial-gradient(circle at top right, ${algo.accent}15, transparent 60%)`,
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: isSelected
                  ? `linear-gradient(135deg, ${algo.accent}30, ${algo.accent}10)`
                  : "rgba(0,212,255,0.06)",
                border: `1px solid ${isSelected ? algo.accent + "50" : "var(--qb-border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.25rem",
                boxShadow: isSelected ? `0 0 20px ${algo.accent}30` : "none",
                transition: "all 0.4s",
              }}>
                <Icon size={24} style={{ color: isSelected ? algo.accent : "var(--text-dim)" }} />
              </div>

              {/* If selected, show check and active badge */}
              {isSelected && (
                <>
                  <div style={{
                    position: "absolute", top: "1.25rem", right: "1.25rem",
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}>
                    <span style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: "0.5rem",
                      fontWeight: 900,
                      color: "#00060f",
                      background: algo.accent,
                      padding: "0.15rem 0.4rem",
                      borderRadius: 4,
                      letterSpacing: "0.1em",
                      boxShadow: `0 0 12px ${algo.accent}80`
                    }}>
                      ACTIVE
                    </span>
                    <div style={{
                      color: algo.accent, filter: `drop-shadow(0 0 8px ${algo.accent})`,
                      display: "flex", alignItems: "center"
                    }}>
                      <CheckCircle size={18} />
                    </div>
                  </div>
                </>
              )}

              {/* Name badge */}
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: isSelected ? algo.accent : "var(--text-muted)",
                marginBottom: "0.4rem",
                fontWeight: 600,
                textAlign: "center",
              }}>
                {algo.fullName.toUpperCase()}
              </div>

              <h3 style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: isSelected ? algo.accent : "var(--text)",
                marginBottom: "0.75rem",
                textShadow: isSelected ? `0 0 20px ${algo.accent}60` : "none",
                transition: "all 0.4s",
              }}>
                {algo.name}
              </h3>

              <p style={{
                fontSize: "0.875rem",
                color: isSelected ? "rgba(255,255,255,0.75)" : "var(--text-dim)",
                lineHeight: 1.65,
                transition: "color 0.4s",
              }}>
                {algo.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
