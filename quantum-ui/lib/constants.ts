// lib/constants.ts
import { AlgorithmInfo } from "./types";

export const ALGORITHMS: AlgorithmInfo[] = [
  {
    id: "QAOA",
    name: "QAOA",
    fullName: "Quantum Approximate Optimization Algorithm",
    description:
      "Uses CNOT + RZ/RX gate layers to find approximate solutions to combinatorial optimization. Encodes molecular features into quantum rotations for activity prediction.",
    color: "#0ea5e9",
    glowColor: "rgba(14, 165, 233, 0.4)",
    seedSmiles: "c1ccccc1",
    category: "Quantum Circuit",
    qubits: 8,
    layers: "2 QAOA Layers",
    icon: "⚛",
  },
  {
    id: "VQE",
    name: "VQE",
    fullName: "Variational Quantum Eigensolver",
    description:
      "Applies Strongly Entangling Layers to minimize energy expectation values. Generates aspirin-derivative candidates with high bioactivity potential.",
    color: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.4)",
    seedSmiles: "CC(=O)Oc1ccccc1C(=O)O",
    category: "Variational Circuit",
    qubits: 8,
    layers: "2 Entangling Layers",
    icon: "🌀",
  },
  {
    id: "QPCA",
    name: "QPCA",
    fullName: "Quantum Principal Component Analysis",
    description:
      "Quantum-inspired PCA compresses 1024-bit fingerprints to 8 quantum features. A Random Forest ensemble predicts molecular bioactivity on this compressed space.",
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.4)",
    seedSmiles: "CCO",
    category: "Hybrid Classical-Quantum",
    qubits: 8,
    layers: "PCA + Random Forest",
    icon: "📊",
  },
  {
    id: "Grover",
    name: "Grover",
    fullName: "Grover-Inspired k-NN Search",
    description:
      "Inspired by Grover's quantum search algorithm, uses cosine-metric k-NN to find structurally similar bioactive molecules in quantum feature space.",
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.4)",
    seedSmiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    category: "Quantum Search",
    qubits: 8,
    layers: "5-NN Cosine Search",
    icon: "🔍",
  },
  {
    id: "QGA",
    name: "QGA",
    fullName: "Quantum Genetic Algorithm",
    description:
      "Evolves quantum circuit parameters over generations using selection, crossover, and mutation. Fitness evaluated on quantum expectation values.",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.4)",
    seedSmiles: "C1CCCCC1",
    category: "Evolutionary Quantum",
    qubits: 8,
    layers: "10 Gens × 20 Pop",
    icon: "🧬",
  },
];

export const GROQ_MODEL = "llama-3.3-70b-versatile";
