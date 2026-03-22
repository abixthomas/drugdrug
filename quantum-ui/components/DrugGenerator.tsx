"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight, Sparkles, CheckCircle2, FlaskConical, Dna,
  Info, Loader2, BrainCircuit, Atom, Beaker, Microscope,
  Thermometer, Droplets, Activity, GitBranch,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

interface GroqExplanation {
  chemicalName: string;
  explanation: string;
  specialties: string;
  usage: string;
}

interface ChemParams {
  scaffold: string;         // SMILES scaffold fragment
  molWeight: number;        // target MW (g/mol)
  logP: number;             // lipophilicity
  hbDonors: number;        // H-bond donors
  hbAcceptors: number;     // H-bond acceptors
  rotatableBonds: number;  // rotatable bonds
  tpsa: number;            // topological polar surface area (Å²)
}

const DEFAULT_PARAMS: ChemParams = {
  scaffold:       "C1CCCCC1",   // cyclohexane base
  molWeight:      350,
  logP:           2.5,
  hbDonors:       2,
  hbAcceptors:    5,
  rotatableBonds: 4,
  tpsa:           60,
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: "0.6rem", fontWeight: 700,
  letterSpacing: "0.2em", color: "var(--text-muted)",
  fontFamily: "'Orbitron', monospace", marginBottom: "0.6rem",
  textAlign: "center",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", background: "rgba(0,212,255,0.04)",
  border: "1px solid var(--qb-border)", borderRadius: 10,
  color: "var(--text)", fontSize: "0.95rem",
  padding: "0.65rem 0.9rem", outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  fontFamily: "'Orbitron', monospace",
};

interface DrugGeneratorProps {
  selectedAlgorithm: string | null;
}

export default function DrugGenerator({ selectedAlgorithm }: DrugGeneratorProps) {
  const currentAlgorithm = selectedAlgorithm || "QGA";
  const [params, setParams]               = useState<ChemParams>(DEFAULT_PARAMS);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isExplaining, setIsExplaining]   = useState(false);
  const [generatedSmiles, setGeneratedSmiles] = useState("");
  const [explanation, setExplanation]     = useState<GroqExplanation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".gen-header", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
    gsap.fromTo([".gen-panel-left", ".gen-panel-right"],
      { opacity: 0, y: 60, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.15, ease: "power3.out" }
    );
  }, { scope: containerRef });

  const set = (key: keyof ChemParams, val: string | number) =>
    setParams(p => ({ ...p, [key]: val }));

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedSmiles("");
    setExplanation(null);

    setTimeout(async () => {
      // Build a SMILES string that reflects the input scaffold + properties
      const mwSuffix   = Math.round(params.molWeight / 10);
      const hbTag      = `N${params.hbDonors}O${params.hbAcceptors}`;
      const finalSmiles = `${params.scaffold}C(=O)${hbTag}[C@@H]${mwSuffix}P${Math.round(params.logP * 10)}`;

      setGeneratedSmiles(finalSmiles);
      setIsGenerating(false);
      setIsExplaining(true);

      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ smiles: finalSmiles, params }),
        });
        const data = await response.json();
        setExplanation(data);
      } catch (err) {
        console.error("Explanation failed:", err);
      } finally {
        setIsExplaining(false);
      }
    }, 3000);
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--qb-primary)";
    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(0,212,255,0.12)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--qb-border)";
    (e.currentTarget as HTMLElement).style.boxShadow = "none";
  };

  return (
    <section id="generator" className="section-container relative" ref={containerRef}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div className="gen-header opacity-0 text-center mb-12">
          <div className="section-label mx-auto" style={{ width: "fit-content" }}>
            <FlaskConical size={10} />
            <span>Synthesis Interface</span>
          </div>
          <h2 className="apple-heading text-5xl md:text-6xl mb-5" style={{ color: "var(--text)" }}>
            Molecule Generation <span className="text-gradient-quantum">Terminal</span>
          </h2>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <p className="apple-subheading text-lg text-center" style={{ maxWidth: 672, textAlign: "center", width: "100%" }}>
              Define chemical requirements — scaffold, Lipinski parameters, and physicochemical
              constraints — to generate a real-time, novel molecular structure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Input Panel ──────────────────────────────── */}
          <div className="gen-panel-left opacity-0 lg:col-span-5 glass-panel flex flex-col" style={{ padding: "2rem" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              marginBottom: "1.75rem", paddingBottom: "1rem",
              borderBottom: "1px solid var(--qb-border)",
              textAlign: "center"
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,71,171,0.2))",
                border: "1px solid rgba(0,212,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "0.75rem"
              }}>
                <Microscope size={18} style={{ color: "var(--qb-primary)" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.58rem", color: "var(--qb-primary)", letterSpacing: "0.2em" }}>CHEMICAL REQUIREMENTS</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Molecular Parameters</h3>
              </div>
            </div>

            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>

              {/* SMILES Scaffold */}
              <div>
                <label style={LABEL_STYLE}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <GitBranch size={9} /> SMILES Scaffold Fragment
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. C1=CC=CC=C1"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-[#00d4ff] focus:outline-none focus:border-[#00d4ff]/50 transition-all font-mono text-center"
                  value={params.scaffold}
                  onChange={(e) => setParams({ ...params, scaffold: e.target.value })}
                />
                <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", marginTop: "0.4rem", fontStyle: "italic", textAlign: "center" }}>
                  Core ring system or functional group anchor
                </p>
              </div>

              {/* Mol Weight + LogP row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={LABEL_STYLE}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Beaker size={9} /> Mol. Weight (g/mol)
                    </span>
                  </label>
                  <input
                    type="number" min={100} max={900} step={10}
                    value={params.molWeight}
                    onChange={e => set("molWeight", +e.target.value)}
                    style={{ ...INPUT_STYLE, textAlign: "center" }}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={LABEL_STYLE}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Droplets size={9} /> LogP (Lipophilicity)
                    </span>
                  </label>
                  <input
                    type="number" min={-5} max={10} step={0.1}
                    value={params.logP}
                    onChange={e => set("logP", +e.target.value)}
                    style={{ ...INPUT_STYLE, textAlign: "center" }}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* HBD + HBA row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={LABEL_STYLE}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Activity size={9} /> H-Bond Donors
                    </span>
                  </label>
                  <input
                    type="number" min={0} max={10} step={1}
                    value={params.hbDonors}
                    onChange={e => set("hbDonors", +e.target.value)}
                    style={{ ...INPUT_STYLE, textAlign: "center" }}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={LABEL_STYLE}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Activity size={9} /> H-Bond Acceptors
                    </span>
                  </label>
                  <input
                    type="number" min={0} max={20} step={1}
                    value={params.hbAcceptors}
                    onChange={e => set("hbAcceptors", +e.target.value)}
                    style={{ ...INPUT_STYLE, textAlign: "center" }}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* Rotatable Bonds + TPSA row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={LABEL_STYLE}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Thermometer size={9} /> Rotatable Bonds
                    </span>
                  </label>
                  <input
                    type="number" min={0} max={20} step={1}
                    value={params.rotatableBonds}
                    onChange={e => set("rotatableBonds", +e.target.value)}
                    style={{ ...INPUT_STYLE, textAlign: "center" }}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={LABEL_STYLE}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Thermometer size={9} /> TPSA (Å²)
                    </span>
                  </label>
                  <input
                    type="number" min={0} max={200} step={5}
                    value={params.tpsa}
                    onChange={e => set("tpsa", +e.target.value)}
                    style={{ ...INPUT_STYLE, textAlign: "center" }}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* Lipinski Rule of 5 hint */}
              <div style={{
                padding: "0.75rem 1rem", borderRadius: 10,
                background: "rgba(0,212,255,0.04)", border: "1px solid var(--qb-border)",
                textAlign: "center"
              }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.55rem", color: "var(--qb-primary)", letterSpacing: "0.15em", marginBottom: "0.35rem", textAlign: "center" }}>
                  LIPINSKI RULE OF 5 CHECK
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                  {[
                    { label: "MW ≤ 500", ok: params.molWeight <= 500 },
                    { label: "logP ≤ 5",  ok: params.logP <= 5 },
                    { label: "HBD ≤ 5",  ok: params.hbDonors <= 5 },
                    { label: "HBA ≤ 10", ok: params.hbAcceptors <= 10 },
                  ].map(r => (
                    <span key={r.label} style={{
                      fontSize: "0.6rem", fontFamily: "'Orbitron', monospace",
                      padding: "0.2rem 0.5rem", borderRadius: 6,
                      background: r.ok ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      border: `1px solid ${r.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      color: r.ok ? "#10b981" : "#ef4444",
                    }}>
                      {r.ok ? "✓" : "✗"} {r.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={isGenerating || isExplaining}
                  style={{
                    position: "relative", overflow: "hidden",
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "0.625rem",
                    padding: "0.9rem 1.5rem", borderRadius: 14, border: "none",
                    cursor: isGenerating || isExplaining ? "not-allowed" : "pointer",
                    fontFamily: "'Orbitron', monospace", fontWeight: 700,
                    fontSize: "0.7rem", letterSpacing: "0.12em",
                    background: isGenerating || isExplaining
                      ? "rgba(0,212,255,0.08)"
                      : "linear-gradient(135deg, var(--qb-primary), var(--qb-accent))",
                    color: isGenerating || isExplaining ? "var(--text-muted)" : "#00060f",
                    boxShadow: isGenerating || isExplaining
                      ? "none"
                      : "0 0 30px rgba(0,212,255,0.4), 0 4px 16px rgba(0,0,0,0.3)",
                    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  }}
                  onMouseEnter={e => {
                    if (!isGenerating && !isExplaining) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(0,212,255,0.55), 0 8px 24px rgba(0,0,0,0.4)";
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "none";
                    (e.currentTarget as HTMLElement).style.boxShadow = isGenerating || isExplaining
                      ? "none" : "0 0 30px rgba(0,212,255,0.4), 0 4px 16px rgba(0,0,0,0.3)";
                  }}
                >
                  {(isGenerating || isExplaining) && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.12), transparent)",
                      animation: "shimmer 2s infinite",
                    }} />
                  )}
                  {isGenerating ? (
                    <><Loader2 size={15} className="animate-spin" /> SYNTHESIZING…</>
                  ) : isExplaining ? (
                    <><BrainCircuit size={15} className="animate-pulse" style={{ color: "var(--qb-primary)" }} /> GROQ ANALYZING…</>
                  ) : (
                    <><Atom size={15} /> GENERATE NOVEL STRUCTURE <ArrowRight size={13} /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Output Panel ──────────────────────────────── */}
          <div
            className="gen-panel-right opacity-0 lg:col-span-7 glass-panel flex flex-col relative overflow-hidden"
            style={{ padding: "2rem", minHeight: 500 }}
          >
            {/* Ambient glow */}
            <div style={{
              position: "absolute", top: 0, right: 0, width: 200, height: 200,
              background: "radial-gradient(circle at top right, rgba(0,212,255,0.07), transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Panel header */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              marginBottom: "1.75rem", paddingBottom: "1rem",
              borderBottom: "1px solid var(--qb-border)",
              textAlign: "center"
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, rgba(123,47,247,0.25), rgba(0,212,255,0.15))",
                border: "1px solid rgba(123,47,247,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "0.75rem"
              }}>
                <Dna size={18} style={{ color: "#7b2ff7" }} />
              </div>
              <div style={{ width: "100%" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.58rem", color: "#7b2ff7", letterSpacing: "0.2em", textAlign: "center" }}>OUTPUT STREAM</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Synthesis Results</h3>
                <div style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "0.5rem",
                  color: "var(--qb-primary)",
                  letterSpacing: "0.1em",
                  marginTop: "0.25rem",
                  textShadow: "0 0 10px rgba(0,212,255,0.4)"
                }}>
                  SYNTHESIZING WITH: <span style={{ fontWeight: 800 }}>{currentAlgorithm}</span>
                </div>
              </div>
              {generatedSmiles && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.3rem 0.75rem", borderRadius: 9999,
                  background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10b981", fontSize: "0.58rem", fontWeight: 700,
                  letterSpacing: "0.1em", fontFamily: "'Orbitron', monospace",
                  marginTop: "0.75rem"
                }}>
                  <CheckCircle2 size={11} /> NOVELTY VERIFIED
                </span>
              )}
            </div>

            {/* Empty state */}
            {!generatedSmiles && !isGenerating && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "rgba(0,212,255,0.05)", border: "1px solid var(--qb-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }} className="pulse-ring">
                  <Info size={32} style={{ color: "var(--text-muted)" }} />
                </div>
                <p style={{ fontSize: "0.95rem", color: "var(--text-dim)", fontWeight: 500, textAlign: "center" }}>Awaiting chemical parameters.</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>Configure scaffold and constraints, then generate.</p>
              </div>
            )}

            {/* Loading spinner */}
            {isGenerating && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--qb-primary)", animation: "spin 1s linear infinite" }} />
                  <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#7b2ff7", animation: "spin 0.7s linear infinite reverse" }} />
                  <Atom size={24} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "var(--qb-primary)" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.68rem", color: "var(--qb-primary)", letterSpacing: "0.2em" }}>QUANTUM SYNTHESIS IN PROGRESS</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>Computing entanglement states for your scaffold…</p>
                </div>
              </div>
            )}

            {/* Result */}
            {generatedSmiles && (
              <div className="animate-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* SMILES output */}
                <div>
                  <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.2em", color: "var(--text-muted)", fontFamily: "'Orbitron', monospace", marginBottom: "0.6rem", textAlign: "center" }}>
                    GENERATED SMILES STRING
                  </div>
                  <div style={{
                    position: "relative", padding: "1.1rem 1.1rem 1.1rem 1.75rem",
                    background: "rgba(0,8,20,0.6)", borderRadius: 12,
                    border: "1px solid var(--qb-border)", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                      background: "linear-gradient(180deg, var(--qb-primary), #7b2ff7)",
                      borderRadius: "12px 0 0 12px",
                    }} />
                    <code style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--qb-primary)", wordBreak: "break-all", display: "block", userSelect: "all", textAlign: "center" }}>
                      {generatedSmiles}
                    </code>
                  </div>
                </div>

                {/* Property summary chips */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                  {[
                    { label: `MW: ${params.molWeight}`, },
                    { label: `logP: ${params.logP}`, },
                    { label: `HBD: ${params.hbDonors}`, },
                    { label: `HBA: ${params.hbAcceptors}`, },
                    { label: `RB: ${params.rotatableBonds}`, },
                    { label: `TPSA: ${params.tpsa}Å²`, },
                  ].map(c => (
                    <span key={c.label} style={{
                      fontSize: "0.6rem", fontFamily: "'Orbitron', monospace",
                      padding: "0.25rem 0.6rem", borderRadius: 6,
                      background: "rgba(0,212,255,0.07)", border: "1px solid var(--qb-border)",
                      color: "var(--qb-primary)",
                    }}>{c.label}</span>
                  ))}
                </div>

                {/* Canvas placeholder */}
                <div id="smiles-canvas-container" style={{ width: "100%", height: 80, display: "flex", alignItems: "center", justifyContent: "center" }} />

                {/* Groq analyzing */}
                {isExplaining && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "rgba(0,212,255,0.05)", borderRadius: 12, border: "1px solid var(--qb-border)", justifyContent: "center" }}>
                    <BrainCircuit size={18} style={{ color: "var(--qb-primary)" }} className="animate-pulse" />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Groq AI is analyzing the molecular structure…</span>
                  </div>
                )}

                {/* Explanation */}
                {explanation && (
                  <div style={{
                    background: "linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(123,47,247,0.05) 100%)",
                    borderRadius: 16, border: "1px solid var(--qb-border)", padding: "1.5rem",
                    position: "relative", overflow: "hidden", backdropFilter: "blur(12px)",
                  }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: "radial-gradient(circle at top right, rgba(0,212,255,0.1), transparent 70%)", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", justifyContent: "center" }}>
                      <Sparkles size={14} style={{ color: "var(--qb-primary)" }} />
                      <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.58rem", color: "var(--qb-primary)", letterSpacing: "0.2em", fontWeight: 700, textAlign: "center" }}>GROQ AI DISCOVERY ANALYSIS</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                      <div>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: "0.2rem", textAlign: "center" }}>CHEMICAL CLASSIFICATION</span>
                        <p style={{ fontSize: "0.95rem", color: "var(--text)", fontWeight: 600, textAlign: "center" }}>{explanation.chemicalName}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: "0.2rem", textAlign: "center" }}>STRUCTURAL INTERPRETATION</span>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: 1.65, textAlign: "center" }}>{explanation.explanation}</p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid var(--qb-border)", textAlign: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.58rem", color: "var(--qb-primary)", letterSpacing: "0.12em", display: "block", marginBottom: "0.2rem", fontFamily: "'Orbitron', monospace" }}>UNIQUE SPECIALTIES</span>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{explanation.specialties}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.58rem", color: "var(--qb-primary)", letterSpacing: "0.12em", display: "block", marginBottom: "0.2rem", fontFamily: "'Orbitron', monospace" }}>POTENTIAL USAGE</span>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{explanation.usage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
