// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import AlgorithmSelector from "@/components/AlgorithmSelector";
import DrugGenerator from "@/components/DrugGenerator";
import MetricsDashboard from "@/components/MetricsDashboard";
import TechStack from "@/components/TechStack";

// Load canvas components client-side only
const QuantumBackground = dynamic(
  () => import("@/components/QuantumBackground"),
  { ssr: false }
);

export default function Home() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>("QGA");

  return (
    <>
      <Script
        src="https://unpkg.com/smiles-drawer@2.1.7/dist/smiles-drawer.min.js"
        strategy="afterInteractive"
      />

      <QuantumBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar />
        
        <main>
          <HeroSection />

          <AlgorithmSelector
            selected={selectedAlgorithm}
            onSelect={(id) => {
              setSelectedAlgorithm(id);
              // Smooth scroll to generator
              setTimeout(() => {
                document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
              }, 300);
            }}
          />

          <DrugGenerator selectedAlgorithm={selectedAlgorithm} />

          <MetricsDashboard selectedAlgorithm={selectedAlgorithm} />

          <TechStack />
        </main>
      </div>
    </>
  );
}
