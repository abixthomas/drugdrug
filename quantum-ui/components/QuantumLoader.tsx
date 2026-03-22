"use client";
// components/QuantumLoader.tsx
import { motion } from "framer-motion";

interface Props {
  algorithm: string;
}

const QUBIT_LABELS = ["q[0]", "q[1]", "q[2]", "q[3]", "q[4]", "q[5]", "q[6]", "q[7]"];

export default function QuantumLoader({ algorithm }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        gap: "2rem",
      }}
    >
      {/* Spinning quantum rings */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {[
          { size: 120, color: "#0ea5e9", duration: 3, clockwise: true, opacity: 0.6 },
          { size: 88, color: "#06b6d4", duration: 2.2, clockwise: false, opacity: 0.5 },
          { size: 56, color: "#a855f7", duration: 1.5, clockwise: true, opacity: 0.7 },
        ].map((ring, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: ring.size, height: ring.size,
              marginLeft: -ring.size / 2, marginTop: -ring.size / 2,
              border: `2px solid ${ring.color}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              opacity: ring.opacity,
              animation: `${ring.clockwise ? "quantum-spin" : "counter-spin"} ${ring.duration}s linear infinite`,
              boxShadow: `0 0 10px ${ring.color}60`,
            }}
          />
        ))}
        {/* Center core */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 16, height: 16,
          marginLeft: -8, marginTop: -8,
          borderRadius: "50%",
          background: "radial-gradient(circle, #38bdf8, #0ea5e9)",
          boxShadow: "0 0 20px #0ea5e9",
          animation: "glow-pulse 1s ease-in-out infinite",
        }} />
      </div>

      {/* Algorithm label */}
      <div className="font-orbitron" style={{
        color: "var(--electric)", fontSize: "0.85rem",
        letterSpacing: "0.2em", textAlign: "center",
      }}>
        RUNNING {algorithm} CIRCUIT
      </div>

      {/* Qubit wire animation */}
      <div style={{
        width: "100%", maxWidth: 400,
        background: "rgba(10,22,40,0.8)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        fontFamily: "'Space Grotesk', monospace",
        fontSize: "0.75rem",
        color: "var(--text-dim)",
      }}>
        {QUBIT_LABELS.map((q, i) => (
          <div key={q} style={{
            display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem",
          }}>
            <span style={{ color: "var(--electric)", minWidth: 32, fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>{q}</span>
            <div style={{ flex: 1, height: 2, background: "var(--border)", borderRadius: 1, position: "relative", overflow: "hidden" }}>
              <motion.div
                style={{
                  position: "absolute", height: "100%",
                  background: `linear-gradient(90deg, transparent, ${["#0ea5e9","#06b6d4","#a855f7","#10b981","#f59e0b","#38bdf8","#818cf8","#0ea5e9"][i]}, transparent)`,
                  width: "40%",
                }}
                animate={{ x: ["-40%", "140%"] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "linear" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        color: "var(--text-muted)", fontSize: "0.8rem",
        textAlign: "center", maxWidth: 360,
        animation: "electric-flicker 4s infinite",
      }}>
        Executing quantum circuit on 8 qubits...
        <br />This may take 30–60 seconds for deep circuits.
      </div>
    </motion.div>
  );
}
