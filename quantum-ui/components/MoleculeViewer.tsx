"use client";
// components/MoleculeViewer.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GenerationResult } from "@/lib/types";

interface Props {
  result: GenerationResult;
  onExplain?: () => void;
  explaining?: boolean;
  hideControls?: boolean;
}

export default function MoleculeViewer({ result, onExplain, explaining, hideControls }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [smilesError, setSmilesError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result.smiles || !canvasRef.current) return;
    setSmilesError(false);
    // Render with smiles-drawer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SmilesDrawer = (window as any).SmilesDrawer;
    if (SmilesDrawer) {
      const drawer = new SmilesDrawer.Drawer({
        width: 380,
        height: 280,
        bondThickness: 1.4,
        shortBondWidth: 0.85,
        bondLength: 22,
        atomVisualization: "default",
        isomeric: true,
        debug: false,
        terminalCarbons: false,
        explicitHydrogens: false,
        overlapSensitivity: 0.42,
        overlapResolutionIterations: 3,
        compactDrawing: false,
        fontSizeLarge: 8,
        fontSizeSmall: 5,
      });
      SmilesDrawer.parse(
        result.smiles,
        (tree: unknown) => {
          const canvas = canvasRef.current;
          if (canvas) drawer.draw(tree, canvas, "dark");
        },
        () => setSmilesError(true)
      );
    }
  }, [result.smiles]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.smiles);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor =
    result.score > 0.8 ? "#10b981" : result.score > 0.6 ? "#0ea5e9" : "#f59e0b";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* SMILES + Image dual panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Molecule Canvas */}
        <div
          style={{
            background: "rgba(10,22,40,0.9)",
            border: "1px solid var(--border-bright)",
            borderRadius: 12,
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--electric)", letterSpacing: "0.2em" }}>
            2D STRUCTURE
          </div>
          {!smilesError ? (
            <canvas
              ref={canvasRef}
              width={380}
              height={280}
              style={{ borderRadius: 8, maxWidth: "100%", height: "auto" }}
            />
          ) : result.image ? (
            <img
              src={`data:image/png;base64,${result.image}`}
              alt="Generated molecule"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          ) : (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem", fontSize: "0.85rem" }}>
              Molecule image unavailable
            </div>
          )}
        </div>

        {/* Pre-generated image fallback */}
        {result.image && (
          <div
            style={{
              background: "rgba(10,22,40,0.9)",
              border: "1px solid var(--border-bright)",
              borderRadius: 12,
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--cyan)", letterSpacing: "0.2em" }}>
              RDKit RENDER
            </div>
            <img
              src={`data:image/png;base64,${result.image}`}
              alt="RDKit molecule"
              style={{ maxWidth: "100%", borderRadius: 8, background: "#fff", padding: 4 }}
            />
          </div>
        )}
      </div>

      {/* SMILES string */}
      <div
        style={{
          background: "rgba(10,22,40,0.8)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="font-orbitron" style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: "0.3rem" }}>
            SMILES NOTATION
          </div>
          <code style={{ color: "var(--electric)", fontSize: "0.9rem", wordBreak: "break-all", fontFamily: "monospace" }}>
            {result.smiles}
          </code>
        </div>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? "rgba(16,185,129,0.15)" : "rgba(14,165,233,0.1)",
            border: `1px solid ${copied ? "#10b981" : "rgba(14,165,233,0.3)"}`,
            borderRadius: 8,
            padding: "0.5rem 1rem",
            cursor: "pointer",
            color: copied ? "#10b981" : "var(--electric)",
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { label: "ALGORITHM", value: result.algorithm, color: "var(--electric)" },
          { label: "SEED MOLECULE", value: result.seed, color: "var(--cyan)" },
          { label: "MUTATION", value: result.mutation, color: "var(--text-dim)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1, minWidth: 140,
              background: "rgba(10,22,40,0.6)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0.75rem",
            }}
          >
            <div className="font-orbitron" style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: "0.3rem" }}>
              {item.label}
            </div>
            <div style={{ color: item.color, fontSize: "0.82rem", wordBreak: "break-all" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Score + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* Predicted score */}
        <div style={{
          flex: 1, minWidth: 200,
          background: "rgba(10,22,40,0.8)",
          border: `1px solid ${scoreColor}40`,
          borderRadius: 10,
          padding: "1rem 1.25rem",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <div>
            <div className="font-orbitron" style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: "0.3rem" }}>
              PREDICTED BIOACTIVITY
            </div>
            <div style={{
              fontSize: "1.75rem", fontWeight: 800,
              color: scoreColor, fontFamily: "'Orbitron', monospace",
              textShadow: `0 0 15px ${scoreColor}80`,
            }}>
              {(result.score * 100).toFixed(1)}%
            </div>
          </div>
          {/* Bar */}
          <div style={{ flex: 1, height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.score * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`,
                borderRadius: 3,
                boxShadow: `0 0 8px ${scoreColor}`,
              }}
            />
          </div>
        </div>

        {/* Explain button */}
        <button
          className="btn-quantum"
          onClick={onExplain}
          disabled={explaining}
          style={{
            background: explaining
              ? "rgba(14,165,233,0.2)"
              : "linear-gradient(135deg, #a855f7, #0ea5e9)",
            whiteSpace: "nowrap",
          }}
        >
          {explaining ? "⚡ ANALYZING..." : "🤖 EXPLAIN WITH GROQ AI"}
        </button>
      </div>
    </motion.div>
  );
}
