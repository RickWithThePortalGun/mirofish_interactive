"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExplanationPanel } from "@/components/explanation-panel";
import type { StepContent, PersonalizationProfile } from "@/components/onboarding";

type Stance = "supportive" | "neutral" | "skeptical" | "opposed";

type Agent = {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  stance: Stance;
  influence: number;
  traits: string[];
  openingStatement: string;
};

const stanceConfig: Record<Stance, { label: string; color: string; bg: string }> = {
  supportive: { label: "Supportive", color: "hsl(160 55% 40%)", bg: "hsl(160 55% 40% / 0.1)" },
  neutral:    { label: "Neutral",    color: "hsl(215 14% 50%)", bg: "hsl(215 14% 50% / 0.1)" },
  skeptical:  { label: "Skeptical",  color: "hsl(30 75% 48%)",  bg: "hsl(30 75% 48% / 0.1)"  },
  opposed:    { label: "Opposed",    color: "hsl(0 62% 52%)",   bg: "hsl(0 62% 52% / 0.1)"   },
};

const agents: Agent[] = [
  {
    id: "agent-1",
    name: "Priya Nair",
    age: 34,
    location: "Berlin, Germany",
    occupation: "ML Engineer",
    stance: "supportive",
    influence: 8,
    traits: ["pragmatic", "pro-regulation", "risk-aware"],
    openingStatement: "Finally some structure. The Wild West era of AI needed to end — this gives companies a clear playbook.",
  },
  {
    id: "agent-2",
    name: "Tom Buchanan",
    age: 51,
    location: "London, UK",
    occupation: "Venture Capitalist",
    stance: "skeptical",
    influence: 7,
    traits: ["growth-focused", "cautious of bureaucracy", "market-driven"],
    openingStatement: "Good intentions, but compliance costs will crush European startups. Silicon Valley is laughing.",
  },
  {
    id: "agent-3",
    name: "Fatima Al-Rashid",
    age: 29,
    location: "Brussels, Belgium",
    occupation: "Policy Analyst",
    stance: "supportive",
    influence: 6,
    traits: ["analytical", "institutional", "human-rights focused"],
    openingStatement: "This is a landmark moment for democratic governance of technology. Imperfect but necessary.",
  },
  {
    id: "agent-4",
    name: "Riku Virtanen",
    age: 44,
    location: "Helsinki, Finland",
    occupation: "CTO at AI startup",
    stance: "opposed",
    influence: 9,
    traits: ["technical depth", "libertarian lean", "competitive mindset"],
    openingStatement: "Vague definitions, heavy penalties. We're moving our EU operation to Switzerland.",
  },
  {
    id: "agent-5",
    name: "Elena Vasquez",
    age: 67,
    location: "Madrid, Spain",
    occupation: "Retired Educator",
    stance: "neutral",
    influence: 3,
    traits: ["skeptical of tech hype", "values fairness", "practical"],
    openingStatement: "I don't understand half of it, but if it stops AI from making decisions about my pension, I'm for it.",
  },
  {
    id: "agent-6",
    name: "Kwame Asante",
    age: 26,
    location: "Amsterdam, Netherlands",
    occupation: "Computer Science Student",
    stance: "skeptical",
    influence: 4,
    traits: ["curious", "idealistic", "open source advocate"],
    openingStatement: "Will this kill open-source AI development in Europe? That's what I'm worried about.",
  },
];

type Props = {
  content?: StepContent;
  level?: PersonalizationProfile["level"];
};

export function Step3Agents({ content, level = "intermediate" }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Stance | "all">("all");

  const visible = filter === "all" ? agents : agents.filter((a) => a.stance === filter);
  const selectedAgent = agents.find((a) => a.id === selected);

  return (
    <div className="space-y-5">
      {content ? (
        <ExplanationPanel content={content} level={level} />
      ) : (
        <p className="text-sm text-muted-foreground">
          MiroFish generates a diverse swarm of AI personas — each with a unique background, stance on the topic, and influence score. These agents will interact and shape each other&apos;s opinions in the simulation.
        </p>
      )}

      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "supportive", "neutral", "skeptical", "opposed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {f === "all" ? "All agents" : stanceConfig[f].label}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((agent, i) => {
          const sc = stanceConfig[agent.stance];
          const isSelected = selected === agent.id;
          return (
            <motion.button
              key={agent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(isSelected ? null : agent.id)}
              className={`text-left p-4 rounded border transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold text-sm">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.age} · {agent.location}</div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded border shrink-0"
                  style={{ background: sc.bg, borderColor: sc.color + "44", color: sc.color }}
                >
                  {sc.label}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-3">{agent.occupation}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Influence</span>
                  <span className="text-muted-foreground">{agent.influence}/10</span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${agent.influence * 10}%` }}
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border rounded p-4 bg-card space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{selectedAgent.name}</span>
            <span className="text-xs text-muted-foreground">— {selectedAgent.occupation}</span>
          </div>
          <blockquote className="text-sm text-foreground border-l-2 border-primary pl-3 italic">
            &ldquo;{selectedAgent.openingStatement}&rdquo;
          </blockquote>
          <div className="flex flex-wrap gap-1.5">
            {selectedAgent.traits.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="text-xs text-muted-foreground border border-border rounded p-3 bg-muted">
        In a full MiroFish run, dozens to hundreds of agents are generated. Each persona is synthesized by an LLM conditioned on the knowledge graph, ensuring their beliefs and language are grounded in the specific topic.
      </div>
    </div>
  );
}
