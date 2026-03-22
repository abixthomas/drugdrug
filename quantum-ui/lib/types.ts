// lib/types.ts
export interface AlgorithmInfo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  color: string;
  glowColor: string;
  seedSmiles: string;
  category: string;
  qubits: number;
  layers: string;
  icon: string;
}

export interface GenerationResult {
  smiles: string;
  score: number;
  image?: string; // base64 PNG
  algorithm: string;
  seed?: string;
  mutation?: string;
  properties?: {
    MolecularWeight: number;
    LogP: number;
    TPSA: number;
    SAScore: number;
  };
  error?: string;
}

export interface ExplanationResult {
  text: string;
}

export interface MetricEntry {
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  testMatrix?: string; // base64
  newMatrix?: string;  // base64
}
