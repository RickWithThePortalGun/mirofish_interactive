"use client";

import { motion } from "framer-motion";
import { ExplanationPanel } from "@/components/explanation-panel";
import type { StepContent, PersonalizationProfile } from "@/components/onboarding";

const pipelineSteps = [
  {
    number: "01",
    title: "News Ingestion",
    description: "MiroFish takes any news article or topic as its seed — a bill passing, a product launch, a crisis.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7h10M5 10h7M5 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Knowledge Graph",
    description: "An LLM extracts entities, relationships, and sentiment from the article and builds a structured graph.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="3" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="17" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="3" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="17" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4.5 5.5L7.5 8.5M12.5 8.5L15.5 5.5M4.5 14.5L7.5 11.5M12.5 11.5L15.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Agent Swarm",
    description: "Dozens of AI personas are generated — each with unique backgrounds, political views, and emotional profiles.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 16c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 11c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: "04",
    title: "Social Simulation",
    description: "Agents interact on a synthetic social network, exchanging opinions and influencing each other over time.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10c0-3.866 3.134-7 7-7s7 3.134 7 7-3.134 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 3v7l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="4" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    number: "05",
    title: "Insight Report",
    description: "A final AI report synthesizes how opinions evolved, who was most influenced, and what it means.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 14l3-3 2 2 3-4 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

type Props = {
  content?: StepContent;
  level?: PersonalizationProfile["level"];
};

export function Step1Overview({ content, level = "intermediate" }: Props) {
  return (
    <div className="space-y-8">
      {content ? (
        <ExplanationPanel content={content} level={level} />
      ) : (
        <div className="space-y-2 max-w-2xl">
          <p className="text-muted-foreground text-sm">
            MiroFish is an open-source framework that simulates how information spreads through society. It builds a swarm of AI personas and runs them through a synthetic social network — letting you observe opinion formation, polarization, and influence in real time.
          </p>
          <p className="text-muted-foreground text-sm">
            This tour walks through each stage with a live example: <strong className="text-foreground">the EU AI Act becoming law</strong>.
          </p>
        </div>
      )}

      {/* Pipeline steps */}
      <div className="space-y-0">
        {pipelineSteps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.22 }}
            className="flex gap-5"
          >
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded border border-border bg-card flex items-center justify-center text-primary shrink-0 mt-1">
                {step.icon}
              </div>
              {i < pipelineSteps.length - 1 && (
                <div className="w-px flex-1 bg-border my-2" />
              )}
            </div>
            <div className="pb-7">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">{step.number}</span>
                <span className="text-sm font-semibold">{step.title}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Architecture note */}
      <div className="border border-border rounded p-4 bg-card">
        <div className="text-xs font-mono text-muted-foreground mb-2">Architecture</div>
        <div className="flex flex-wrap gap-2">
          {["Next.js frontend", "LLM (OpenAI GPT-4o)", "NetworkX graph", "Mesa simulation", "FastAPI"].map((t) => (
            <span key={t} className="text-xs border border-border rounded px-2 py-1 text-muted-foreground bg-muted">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
