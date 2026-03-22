// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantum ML — Drug Discovery",
  description: "Quantum Machine Learning for High-Performance Molecule Generation.",
  keywords: ["quantum ml", "drug discovery", "molecule generation", "quantum blue"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} ${orbitron.variable} ${inter.className} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
