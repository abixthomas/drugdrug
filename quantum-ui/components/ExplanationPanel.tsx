"use client";
// components/ExplanationPanel.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  text: string;
}

const SECTION_ICONS: Record<string, string> = {
  "Molecule Name": "🔬",
  "Pharmacological Purpose": "💊",
  "Field of Application": "🏥",
  "Quantum ML Analysis": "⚛",
};

function parseMarkdownSections(text: string) {
  // Split by ## headings
  const parts = text.split(/^## /m).filter(Boolean);
  return parts.map((part) => {
    const lines = part.split("\n");
    const heading = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();
    return { heading, content };
  });
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 12);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <span>{displayed}</span>;
}

export default function ExplanationPanel({ text }: Props) {
  const sections = parseMarkdownSections(text);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: "rgba(10,22,40,0.85)",
        border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 0 40px rgba(168,85,247,0.15), 0 0 80px rgba(168,85,247,0.05)",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "1.25rem 1.75rem",
        borderBottom: "1px solid rgba(168,85,247,0.2)",
        background: "linear-gradient(90deg, rgba(168,85,247,0.08), rgba(14,165,233,0.05))",
        display: "flex", alignItems: "center", gap: "0.75rem",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "linear-gradient(135deg, #a855f7, #0ea5e9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, boxShadow: "0 0 15px rgba(168,85,247,0.4)",
        }}>🤖</div>
        <div>
          <div className="font-orbitron" style={{ color: "#a855f7", fontSize: "0.8rem", letterSpacing: "0.15em" }}>
            GROQ AI ANALYSIS
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
            llama-3.3-70b-versatile · Medicinal Chemistry Expert
          </div>
        </div>
        {/* Pulsing live indicator */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#a855f7",
            boxShadow: "0 0 8px #a855f7", animation: "glow-pulse 1.5s infinite",
          }} />
          <span className="font-orbitron" style={{ fontSize: "0.6rem", color: "#a855f7", letterSpacing: "0.2em" }}>LIVE</span>
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <AnimatePresence>
          {sections.length > 0 ? sections.map((sec, i) => (
            <motion.div
              key={sec.heading}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              {/* Heading */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                marginBottom: "0.5rem",
              }}>
                <span style={{ fontSize: 18 }}>
                  {SECTION_ICONS[sec.heading] || "📌"}
                </span>
                <h4 className="font-orbitron" style={{
                  fontSize: "0.75rem", color: "#a855f7",
                  letterSpacing: "0.1em",
                  textAlign: "center"
                }}>
                  {sec.heading.toUpperCase()}
                </h4>
              </div>
              {/* Content centered */}
              <div style={{
                paddingLeft: "0",
                color: "var(--text-dim)",
                lineHeight: 1.7,
                fontSize: "0.9rem",
                textAlign: "center",
              }}>
                <TypewriterText text={sec.content} delay={i * 400} />
              </div>
            </motion.div>
          )) : (
            <div style={{
              color: "var(--text-dim)", lineHeight: 1.7, fontSize: "0.9rem",
              whiteSpace: "pre-wrap",
            }}>
              <TypewriterText text={text} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer disclaimer */}
      <div style={{
        padding: "0.75rem 1.75rem",
        borderTop: "1px solid rgba(168,85,247,0.15)",
        background: "rgba(0,0,0,0.2)",
        color: "var(--text-muted)",
        fontSize: "0.7rem",
        display: "flex", alignItems: "center", gap: "0.5rem",
      }}>
        <span>⚠</span>
        For research and presentation purposes only. Not for clinical use.
      </div>
    </motion.div>
  );
}
