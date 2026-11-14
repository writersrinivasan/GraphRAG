import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KeyProvider } from "@/components/KeyProvider";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GraphRAG Academy: Knowledge Graphs & Graph RAG for AI",
  description:
    "A visual, hands-on 5-hour course on Knowledge Graphs, Neo4j, Cypher, Graph RAG and agentic AI with LangGraph, plus a BYOK Groq AI assistant.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <KeyProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t border-white/10 py-6 text-center text-xs text-white/40">
            GraphRAG Academy · Knowledge Graphs &amp; Graph RAG for AI · Built with Next.js, LangGraph.js &amp; Groq (BYOK)
          </footer>
        </KeyProvider>
      </body>
    </html>
  );
}
