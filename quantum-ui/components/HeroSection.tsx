"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDownRight, Atom, Sparkles } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    // Label badge
    tl.fromTo(
      ".hero-badge",
      { opacity: 0, y: -20, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 }
    )
      // Main headline lines
      .fromTo(
        ".hero-line",
        { opacity: 0, y: 60, rotationX: 15, transformOrigin: "top center" },
        { opacity: 1, y: 0, rotationX: 0, duration: 1.2, stagger: 0.18 },
        "-=0.4"
      )
      // Subtitle
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0 },
        "-=0.8"
      )
      // Stat pills
      .fromTo(
        ".hero-stat",
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.7 },
        "-=0.7"
      )
      // CTA button
      .fromTo(
        ".hero-btn",
        { opacity: 0, scale: 0.85, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9 },
        "-=0.5"
      );

    // Floating orbs
    gsap.to(".orb-1", { y: -25, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-2", { y: 20, x: -15, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
    gsap.to(".orb-3", { y: -15, x: 20, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
  }, { scope: containerRef });

  const scrollToAlgorithms = () => {
    document.getElementById("algorithms")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="section-container min-h-[92vh] flex flex-col justify-center items-center text-center relative overflow-hidden pt-28"
    >
      {/* ── Floating orbs ────────────────────────────────────── */}
      <div className="orb-1 absolute top-[15%] left-[8%] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div className="orb-2 absolute bottom-[20%] right-[6%] w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(123,47,247,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div className="orb-3 absolute top-[40%] right-[20%] w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,170,255,0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* ── Central glow backplane ───────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, rgba(0,71,171,0.06) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* ── Badge ─────────────────────────────────────────────── */}
      <div className="hero-badge section-label opacity-0 mb-6">
        <Sparkles size={10} />
        <span>AI · Quantum · Drug Design</span>
      </div>

      {/* ── Headline ──────────────────────────────────────────── */}
      <h1 className="apple-heading text-6xl md:text-8xl lg:text-9xl mb-8 tracking-tighter w-full text-center" style={{ perspective: "1000px", lineHeight: 1.1 }}>
        <span className="hero-line block text-gradient-quantum opacity-0 w-full text-center">
          Quantum Machine Learning
        </span>
        <span className="hero-line block opacity-0 w-full text-center" style={{ color: "var(--text-dim)", fontSize: "0.4em", letterSpacing: "0.1em", fontFamily: "'Orbitron', monospace", marginTop: "0.2em" }}>
          FOR DRUG DISCOVERY
        </span>
      </h1>

      {/* ── Subtitle ──────────────────────────────────────────── */}
      <p className="hero-subtitle apple-subheading text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-0 text-center" style={{ textAlign: "center" }}>
        Harnessing pre-trained quantum algorithms to discover strictly novel,
        non-repetitive molecular structures with unprecedented precision.
      </p>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {[
          { value: "99.1%", label: "Peak Accuracy" },
          { value: "130K", label: "Training Molecules" },
          { value: "5", label: "Quantum Algorithms" },
        ].map((s) => (
          <div
            key={s.label}
            className="hero-stat opacity-0 glass-panel px-5 py-3 flex flex-col items-center"
            style={{ borderRadius: 14, minWidth: 110 }}
          >
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "var(--qb-primary)",
              textShadow: "0 0 16px rgba(0,212,255,0.4)",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.1em", marginTop: 2 }}>
              {s.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <button
        onClick={scrollToAlgorithms}
        className="hero-btn btn-apple-primary flex items-center gap-3 group opacity-0"
        style={{ fontSize: "0.78rem" }}
      >
        <Atom size={16} />
        <span>Explore Quantum Algorithms</span>
        <ArrowDownRight
          size={16}
          className="group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300"
        />
      </button>

      {/* ── Scroll hint ───────────────────────────────────────── */}
      <div className="hero-btn absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 flex flex-col items-center gap-2" style={{ cursor: "default" }}>
        <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "var(--text-muted)", fontFamily: "'Orbitron', monospace" }}>
          SCROLL
        </div>
        <div style={{
          width: 1, height: 48,
          background: "linear-gradient(180deg, var(--qb-primary), transparent)",
          animation: "float 2s ease-in-out infinite",
        }} />
      </div>
    </section>
  );
}
