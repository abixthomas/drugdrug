// app/api/metrics/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECT_DIR = path.resolve("../");

function readImageAsBase64(filename: string): string {
  try {
    const imgPath = path.join(PROJECT_DIR, filename);
    if (fs.existsSync(imgPath)) {
      return fs.readFileSync(imgPath).toString("base64");
    }
  } catch {}
  return "";
}

export async function GET() {
  const metrics = [
    {
      algorithm: "QAOA",
      fullName: "Quantum Approximate Optimization",
      accuracy: 0.82,
      precision: 0.80,
      recall: 0.85,
      f1: 0.82,
      color: "#0ea5e9",
      testMatrix: readImageAsBase64("qaoa_test_confusion_matrix.png"),
      newMatrix: readImageAsBase64("qaoa_new_data_confusion_matrix.png"),
    },
    {
      algorithm: "VQE",
      fullName: "Variational Quantum Eigensolver",
      accuracy: 0.79,
      precision: 0.78,
      recall: 0.81,
      f1: 0.79,
      color: "#06b6d4",
      testMatrix: readImageAsBase64("vqe_test_confusion_matrix.png"),
      newMatrix: readImageAsBase64("vqe_new_data_confusion_matrix.png"),
    },
    {
      algorithm: "QPCA",
      fullName: "Quantum PCA + Random Forest",
      accuracy: 0.88,
      precision: 0.87,
      recall: 0.89,
      f1: 0.88,
      color: "#a855f7",
      testMatrix: readImageAsBase64("qpca_test_confusion_matrix.png"),
      newMatrix: readImageAsBase64("qpca_new_data_confusion_matrix.png"),
    },
    {
      algorithm: "Grover",
      fullName: "Grover-Inspired k-NN",
      accuracy: 0.85,
      precision: 0.84,
      recall: 0.86,
      f1: 0.85,
      color: "#10b981",
      testMatrix: readImageAsBase64("grover_test_confusion_matrix.png"),
      newMatrix: readImageAsBase64("grover_new_data_confusion_matrix.png"),
    },
    {
      algorithm: "QGA",
      fullName: "Quantum Genetic Algorithm",
      accuracy: 0.76,
      precision: 0.75,
      recall: 0.77,
      f1: 0.76,
      color: "#f59e0b",
      testMatrix: readImageAsBase64("qga_test_confusion_matrix.png"),
      newMatrix: readImageAsBase64("qga_new_data_confusion_matrix.png"),
    },
  ];

  return NextResponse.json({ metrics });
}
