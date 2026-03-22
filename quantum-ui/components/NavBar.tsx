"use client";
// components/NavBar.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "#algorithms", label: "Algorithms" },
  { href: "#generator",  label: "Generator"  },
  { href: "#metrics",    label: "Metrics"    },
  { href: "#tech-stack", label: "Tech Stack" },
];

export default function NavBar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
        background: scrolled
          ? "rgba(0, 6, 15, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0, 212, 255, 0.18)"
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 4px 40px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 212, 255, 0.04)"
          : "none",
      }}
    >
      {/* ── Logo ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #00d4ff 0%, #0047ab 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 24px rgba(0, 212, 255, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
          }} />
          <Atom size={20} color="#00060f" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--qb-primary)",
            letterSpacing: "0.2em",
            textShadow: "0 0 16px rgba(0, 212, 255, 0.4)",
            textAlign: "center",
          }}>
            QUANTUM ML
          </div>
          <div style={{
            fontSize: "0.6rem",
            color: "var(--text-muted)",
            letterSpacing: "0.15em",
            fontFamily: "'Orbitron', monospace",
            textAlign: "center",
          }}>
            DRUG DISCOVERY
          </div>
        </div>
      </div>

      {/* ── Desktop Links ────────────────────────────────────── */}
      <div
        style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}
        className="hidden md:flex"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              color: "var(--text-dim)",
              textDecoration: "none",
              fontSize: "0.72rem",
              fontFamily: "'Orbitron', monospace",
              letterSpacing: "0.12em",
              fontWeight: 500,
              transition: "color 0.25s, text-shadow 0.25s",
              position: "relative",
            }}
            onMouseEnter={e => {
              const t = e.currentTarget;
              t.style.color = "var(--qb-primary)";
              t.style.textShadow = "0 0 12px rgba(0,212,255,0.5)";
            }}
            onMouseLeave={e => {
              const t = e.currentTarget;
              t.style.color = "var(--text-dim)";
              t.style.textShadow = "none";
            }}
          >
            {link.label}
          </a>
        ))}

        <a
          href="#generator"
          className="btn-quantum"
          style={{ padding: "0.5rem 1.25rem", fontSize: "0.65rem", textDecoration: "none" }}
        >
          <Zap size={12} style={{ marginRight: 4 }} />
          LAUNCH DEMO
        </a>
      </div>

      {/* ── Mobile toggle ────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden"
        style={{
          background: "rgba(0, 212, 255, 0.08)",
          border: "1px solid var(--qb-border)",
          color: "var(--qb-primary)",
          cursor: "pointer",
          borderRadius: 8,
          width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.15)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(0,212,255,0.3)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.08)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ── Mobile Menu ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: "1rem", right: "1rem",
              background: "rgba(0, 8, 20, 0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--qb-border)",
              borderRadius: 16,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.06)",
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  color: "var(--text-dim)",
                  textDecoration: "none",
                  fontFamily: "'Orbitron', monospace",
                  letterSpacing: "0.1em",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  padding: "0.875rem 1rem",
                  borderRadius: 10,
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  const t = e.currentTarget as HTMLElement;
                  t.style.background = "rgba(0,212,255,0.08)";
                  t.style.color = "var(--qb-primary)";
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget as HTMLElement;
                  t.style.background = "transparent";
                  t.style.color = "var(--text-dim)";
                }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
