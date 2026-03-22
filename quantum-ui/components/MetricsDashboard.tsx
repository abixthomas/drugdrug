"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BarChart3, TrendingUp, CheckCircle, Crosshair, Activity } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface MetricsDashboardProps {
  selectedAlgorithm: string | null;
}

const METRICS_DATA: Record<string, {
  acc: string; f1: string; rec: string; pre: string;
  img: string; accNum: number; f1Num: number; recNum: number; preNum: number;
}> = {
  QAOA:   { acc: "98.2%", f1: "97.5%", rec: "96.8%", pre: "98.1%", img: "/qaoa_test_confusion_matrix.png",   accNum: 98.2, f1Num: 97.5, recNum: 96.8, preNum: 98.1 },
  VQE:    { acc: "96.4%", f1: "95.8%", rec: "94.2%", pre: "97.3%", img: "/vqe_test_confusion_matrix.png",    accNum: 96.4, f1Num: 95.8, recNum: 94.2, preNum: 97.3 },
  QPCA:   { acc: "94.1%", f1: "93.0%", rec: "92.5%", pre: "93.8%", img: "/qpca_test_confusion_matrix.png",   accNum: 94.1, f1Num: 93.0, recNum: 92.5, preNum: 93.8 },
  Grover: { acc: "99.1%", f1: "98.9%", rec: "98.5%", pre: "99.3%", img: "/grover_test_confusion_matrix.png", accNum: 99.1, f1Num: 98.9, recNum: 98.5, preNum: 99.3 },
  QGA:    { acc: "97.8%", f1: "97.1%", rec: "96.0%", pre: "98.2%", img: "/qga_test_confusion_matrix.png",    accNum: 97.8, f1Num: 97.1, recNum: 96.0, preNum: 98.2 },
};

const CARD_META = [
  { key: "acc",  title: "Accuracy",  icon: CheckCircle, color: "#00d4ff",  numKey: "accNum" },
  { key: "f1",   title: "F1 Score",  icon: TrendingUp,  color: "#00aaff",  numKey: "f1Num"  },
  { key: "rec",  title: "Recall",    icon: BarChart3,   color: "#7b2ff7",  numKey: "recNum" },
  { key: "pre",  title: "Precision", icon: Crosshair,   color: "#10b981",  numKey: "preNum" },
] as const;

export default function MetricsDashboard({ selectedAlgorithm }: MetricsDashboardProps) {
  const currentAlgorithm = selectedAlgorithm || "QGA";
  const data = METRICS_DATA[currentAlgorithm];
  const containerRef  = useRef<HTMLDivElement>(null);
  const imgRef        = useRef<HTMLImageElement>(null);
  const prevAlgoRef   = useRef<string>(currentAlgorithm);

  // ── Animate confusion matrix image on algorithm change ──────────────────────
  useEffect(() => {
    if (prevAlgoRef.current === currentAlgorithm) return;
    prevAlgoRef.current = currentAlgorithm;

    if (!imgRef.current) return;
    // Fade out → swap src → fade in
    gsap.to(imgRef.current, {
      opacity: 0, scale: 0.92, duration: 0.25, ease: "power2.in",
      onComplete: () => {
        if (imgRef.current) {
          imgRef.current.src = data.img;
          imgRef.current.alt = `${currentAlgorithm} Confusion Matrix`;
        }
        gsap.to(imgRef.current, {
          opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)",
        });
      },
    });

    // Animate metric numbers — brief pop
    gsap.fromTo(
      ".metric-value",
      { opacity: 0.3, y: 8, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: "back.out(1.6)" }
    );

    // Re-animate bars
    gsap.fromTo(
      ".metric-bar-fill",
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2, stagger: 0.08, ease: "power2.out", transformOrigin: "left center" }
    );
  }, [currentAlgorithm, data]);

  // ── Initial scroll entrance ─────────────────────────────────────────────────
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(".metrics-header", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
      .fromTo(".matrix-panel",   { opacity: 0, x: -50, rotationY: 8 }, { opacity: 1, x: 0, rotationY: 0, duration: 1.1, ease: "power3.out" }, "-=0.6")
      .fromTo(".metric-stat",    { opacity: 0, scale: 0.75, y: 30 },   { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "back.out(1.8)" }, "-=0.7");

    gsap.fromTo(
      ".metric-bar-fill",
      { scaleX: 0 },
      {
        scaleX: 1, duration: 1.5, stagger: 0.1, ease: "power2.out", transformOrigin: "left center",
        scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none none" },
      }
    );
  }, { scope: containerRef });

  return (
    <section id="metrics" className="section-container" ref={containerRef}>
      {/* Header */}
      <div className="metrics-header opacity-0 text-center mb-14">
        <div className="section-label mx-auto" style={{ width: "fit-content" }}>
          <Activity size={10} />
          <span>Validation Results</span>
        </div>
        <h2 className="apple-heading text-5xl md:text-6xl mb-5" style={{ color: "var(--text)" }}>
          Performance <span className="text-gradient-quantum">Metrics</span>
        </h2>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <p className="apple-subheading text-lg text-center" style={{ maxWidth: 672, textAlign: "center", width: "100%" }}>
            Quantitative superiority of the{" "}
            <span style={{ color: "var(--qb-primary)", fontFamily: "'Orbitron', monospace", fontSize: "0.9em" }}>
              {currentAlgorithm}
            </span>{" "}
            algorithm using pre-calculated testing validations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Confusion Matrix Panel */}
        <div
          className="matrix-panel opacity-0 glass-panel p-8 flex flex-col items-center relative overflow-hidden"
          style={{ perspective: "1000px" }}
        >
          {/* Corner accents */}
          <div style={{
            position: "absolute", top: 0, right: 0, width: 140, height: 140,
            background: "radial-gradient(circle at top right, rgba(0,212,255,0.12), transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, width: 100, height: 100,
            background: "radial-gradient(circle at bottom left, rgba(123,47,247,0.08), transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Panel header */}
          <div style={{
            width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
            marginBottom: "1.5rem", paddingBottom: "1rem",
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
              <BarChart3 size={18} style={{ color: "var(--qb-primary)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                Confusion Matrix Analysis
              </h3>
              <div style={{
                fontFamily: "'Orbitron', monospace", fontSize: "0.55rem",
                letterSpacing: "0.15em", color: "var(--qb-primary)", marginTop: 2,
                textAlign: "center"
              }}>
                {currentAlgorithm} · QM9 VALIDATION
              </div>
            </div>
          </div>

          {/* Matrix image — ref-based for GSAP transitions */}
          <div style={{
            width: "100%", maxWidth: 380, aspectRatio: "1",
            background: "rgba(0, 8, 20, 0.6)", borderRadius: 20, overflow: "hidden",
            border: "1px solid var(--qb-border)",
            boxShadow: "0 0 40px rgba(0,212,255,0.06), inset 0 0 40px rgba(0,0,0,0.5)",
          }}>
            <img
              ref={imgRef}
              src={data.img}
              alt={`${currentAlgorithm} Confusion Matrix`}
              style={{
                width: "100%", height: "100%", objectFit: "contain", padding: "1rem",
                transition: "transform 0.5s ease",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1.04)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
              onError={e => {
                e.currentTarget.src = "https://via.placeholder.com/600x600/000e1e/00d4ff?text=Matrix+Not+Found";
              }}
            />
          </div>

          <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", width: "100%" }}>
            Validated iteratively against the QM9 chemical subset dataset.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-5">
          {CARD_META.map(({ key, title, icon: Icon, color, numKey }) => (
            <div
              key={key}
              className="metric-stat opacity-0 glass-panel border-glow-animated"
              style={{ padding: "1.75rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", textAlign: "center" }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em",
                  color: "var(--text-muted)", fontFamily: "'Orbitron', monospace",
                  textAlign: "center"
                }}>
                  {title.toUpperCase()}
                </span>
              </div>

              {/* Value — uses class for GSAP targeting */}
              <div
                className="metric-value"
                style={{
                  fontFamily: "'Orbitron', monospace", fontSize: "2.2rem",
                  fontWeight: 800, color, textShadow: `0 0 20px ${color}50`, lineHeight: 1,
                }}
              >
                {data[key as keyof typeof data] as string}
              </div>

              {/* Progress bar */}
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div
                  className="metric-bar-fill"
                  style={{
                    height: "100%",
                    width: `${data[numKey as keyof typeof data] as number}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    borderRadius: 2, boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
