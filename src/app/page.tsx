"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Onboarding, type PersonalizationProfile } from "@/components/onboarding";
import { Step1Overview } from "@/components/steps/step1-overview";
import { Step3Agents } from "@/components/steps/step3-agents";
import { Step4Simulation } from "@/components/steps/step4-simulation";
import { Step5Report } from "@/components/steps/step5-report";
import { Step6Potential } from "@/components/steps/step6-potential";

const Step2KnowledgeGraph = dynamic(
  () => import("@/components/steps/step2-knowledge-graph").then((m) => ({ default: m.Step2KnowledgeGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        Loading graph…
      </div>
    ),
  }
);

const STEPS = [
  {
    id: 1,
    label: "Overview",
    title: "What is MiroFish?",
    description: "A swarm-intelligence engine that simulates how information spreads through society.",
  },
  {
    id: 2,
    label: "Knowledge Graph",
    title: "Extracting structure from news",
    description: "The EU AI Act article is parsed into a graph of entities, actors, and relationships.",
  },
  {
    id: 3,
    label: "Agent Swarm",
    title: "Building the agent population",
    description: "20 AI personas are generated — each with a unique background, stance, and influence score.",
  },
  {
    id: 4,
    label: "Simulation",
    title: "Running the social simulation",
    description: "Agents interact across 8 rounds, shifting opinions and forming ideological clusters.",
  },
  {
    id: 5,
    label: "Report + Chat",
    title: "Insight report & agent interview",
    description: "A structured summary of what happened — plus a live chat with any of the agents.",
  },
  {
    id: 6,
    label: "Uses & Potential",
    title: "Applications, implications & what's next",
    description: "Where swarm intelligence applies today, the responsibilities it carries, and where the technology is heading.",
  },
];

export default function Home() {
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  function getContent(stepId: number) {
    return profile?.steps.find((s) => s.id === stepId);
  }

  function go(index: number) {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }

  function next() { if (current < STEPS.length - 1) go(current + 1); }
  function prev() { if (current > 0) go(current - 1); }

  // Show onboarding first
  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Onboarding onComplete={setProfile} />
      </div>
    );
  }

  const step = STEPS[current];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Personalised greeting — shown once at top */}
      {profile.greeting && current === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground border border-border rounded px-3 py-2 bg-muted flex items-center gap-2"
        >
          <span className="text-xs border border-border rounded px-1.5 py-0.5 bg-card capitalize">
            {profile.level}
          </span>
          {profile.greeting}
        </motion.div>
      )}

      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => go(i)}
              className={`flex items-center gap-2 transition-colors ${
                i === current ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-semibold transition-colors shrink-0 ${
                  i < current
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === current
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {i < current ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors ${i < current ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="pb-4 border-b border-border space-y-1">
        <div className="text-xs font-mono text-muted-foreground">Step {step.id} of {STEPS.length}</div>
        <h1 className="text-lg font-semibold">{step.title}</h1>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {current === 0 && <Step1Overview content={getContent(1)} level={profile.level} />}
          {current === 1 && <Step2KnowledgeGraph content={getContent(2)} level={profile.level} />}
          {current === 2 && <Step3Agents content={getContent(3)} level={profile.level} />}
          {current === 3 && <Step4Simulation content={getContent(4)} level={profile.level} />}
          {current === 4 && <Step5Report content={getContent(5)} level={profile.level} />}
          {current === 5 && <Step6Potential content={getContent(6)} level={profile.level} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={prev}
          disabled={current === 0}
          className="text-sm px-4 py-2 rounded border border-border bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? "bg-primary" : "bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        {current < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="text-sm px-4 py-2 rounded border border-primary bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        ) : (
          <a
            href="https://github.com/666ghj/MiroFish"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded border border-border bg-card hover:bg-muted transition-colors"
          >
            View on GitHub →
          </a>
        )}
      </div>
    </div>
  );
}
