"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type StepContent = {
  id: number;
  intro: string;
  analogy?: string;        // plain-English metaphor, shown for beginners
  keyPoints: string[];     // 2–3 things to notice in this step
  technicalNote?: string;  // deeper implementation detail, shown for experts
};

export type PersonalizationProfile = {
  level: "beginner" | "intermediate" | "expert";
  greeting: string;
  steps: StepContent[];
};

type Answers = {
  background: string;
  familiarity: string;
  goal: string;
};

const QUESTIONS = [
  {
    key: "background" as const,
    question: "What best describes your background?",
    options: [
      { value: "non-technical", label: "No tech background", sub: "I work outside of technology" },
      { value: "some-tech", label: "Some tech experience", sub: "I understand the basics but don't code" },
      { value: "developer", label: "Software developer", sub: "I build software professionally" },
      { value: "ai-ml", label: "AI / ML practitioner", sub: "I work with models and data pipelines" },
    ],
  },
  {
    key: "familiarity" as const,
    question: "How familiar are you with AI agents?",
    options: [
      { value: "never-heard", label: "Completely new", sub: "I've never heard the term before" },
      { value: "heard-about", label: "Heard about it", sub: "I know it's a thing but not how it works" },
      { value: "know-basics", label: "Know the basics", sub: "I understand the general concept" },
      { value: "build-them", label: "Build with them", sub: "I use or build agent systems regularly" },
    ],
  },
  {
    key: "goal" as const,
    question: "What brings you here?",
    options: [
      { value: "just-curious", label: "Just curious", sub: "I want to understand what MiroFish is" },
      { value: "research", label: "Research / study", sub: "I'm studying AI, policy, or social dynamics" },
      { value: "building", label: "Building something", sub: "I'm evaluating MiroFish for a project" },
      { value: "policy-business", label: "Policy or business", sub: "I care about the implications, not the code" },
    ],
  },
];

type Props = {
  onComplete: (profile: PersonalizationProfile) => void;
};

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const q = QUESTIONS[step];
  const totalQuestions = QUESTIONS.length;
  const isLast = step === totalQuestions - 1;

  async function select(value: string) {
    const updated = { ...answers, [q.key]: value };
    setAnswers(updated);

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    // All answered — call AI
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: updated }),
      });

      if (!res.ok) throw new Error();
      const profile: PersonalizationProfile = await res.json();
      onComplete(profile);
    } catch {
      setError(true);
      // Fall back to a generic intermediate profile so the user can still continue
      onComplete({
        level: "intermediate",
        greeting: "Welcome! Let's walk through how MiroFish works step by step.",
        steps: [
          {
            id: 1,
            intro: "MiroFish is an open-source framework that simulates how information spreads through society using a swarm of AI personas running on a synthetic social network.",
            keyPoints: [
              "Takes any news article as input",
              "Creates AI personas that argue, persuade, and shift opinions",
              "Produces a report showing how narratives spread and who was influenced",
            ],
          },
          {
            id: 2,
            intro: "MiroFish parses the article through an LLM to extract entities, actors, and relationships into a structured knowledge graph.",
            keyPoints: [
              "Nodes represent people, organisations, laws, and concepts",
              "Edges capture how they relate (regulates, affects, passed)",
              "This graph seeds the agents' initial beliefs",
            ],
          },
          {
            id: 3,
            intro: "MiroFish generates a diverse population of AI personas — each with a unique background, stance, and influence score.",
            keyPoints: [
              "Personas are conditioned on the knowledge graph so their views are grounded",
              "Influence score controls how far their opinions spread",
              "Stances range from strongly supportive to strongly opposed",
            ],
          },
          {
            id: 4,
            intro: "Agents interact on a synthetic social network over multiple rounds, influencing each other and shifting opinions.",
            keyPoints: [
              "Each round agents exchange arguments with their network neighbours",
              "High-influence nodes pull more agents toward their stance",
              "The chart tracks how opinion distribution changes over time",
            ],
          },
          {
            id: 5,
            intro: "After the simulation, MiroFish produces a structured report and lets you interview any agent about their experience.",
            keyPoints: [
              "Polarization index measures how split the population became",
              "Most influential node shows who drove the narrative",
              "Live chat lets you interrogate any agent's reasoning directly",
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Personalising your tour…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-xl space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {step + 1} of {totalQuestions}</span>
            <span>{Math.round(((step) / totalQuestions) * 100)}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalQuestions) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <h2 className="text-lg font-semibold">{q.question}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => select(opt.value)}
                  className="text-left p-4 rounded border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">
                    {opt.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="text-xs text-destructive">
            Couldn&apos;t reach the API — using default explanations.
          </p>
        )}

        {/* Back button */}
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
