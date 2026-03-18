"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExplanationPanel } from "@/components/explanation-panel";
import type { StepContent, PersonalizationProfile } from "@/components/onboarding";

type Tab = "applications" | "implications" | "future";

type Application = {
  id: string;
  title: string;
  domain: string;
  summary: string;
  points: string[];
  icon: React.ReactNode;
};

type ImplicationItem = { label: string; detail: string };

type FutureItem = {
  title: string;
  timeframe: string;
  description: string;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "applications", label: "Applications" },
  { id: "implications", label: "Implications" },
  { id: "future",       label: "What's Next" },
];

// ─── icons (inline SVG, 18×18) ───────────────────────────────────────────────
const Icon = {
  Newspaper: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x={1} y={2} width={14} height={12} rx={1.5} />
      <path d="M4 6h8M4 9h5M4 12h3" />
    </svg>
  ),
  Health: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14s-6-3.5-6-7.5A4 4 0 0 1 8 3.5a4 4 0 0 1 6 3c0 4-6 7.5-6 7.5z" />
      <path d="M6 8h4M8 6v4" />
    </svg>
  ),
  Policy: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
    </svg>
  ),
  Crisis: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={8} cy={8} r={6} />
      <path d="M8 5v3.5M8 11v.5" />
    </svg>
  ),
  Research: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={6.5} cy={6.5} r={4} />
      <path d="M9.5 9.5l3.5 3.5" />
    </svg>
  ),
  Brand: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l3-6 3 4 2-2 4 4" />
    </svg>
  ),
};

const APPLICATIONS: Application[] = [
  {
    id: "journalism",
    title: "Journalism & Media",
    domain: "newsrooms",
    icon: Icon.Newspaper,
    summary: "Predict how a breaking story will polarise audiences before publishing.",
    points: [
      "Run simulations on draft articles to anticipate public reaction across demographics",
      "Identify which narratives resonate with specific ideological clusters",
      "Track how misinformation might mutate as it spreads through synthetic social graphs",
    ],
  },
  {
    id: "health",
    title: "Public Health",
    domain: "campaigns",
    icon: Icon.Health,
    summary: "Test vaccination messaging or outbreak communication strategies at scale.",
    points: [
      "Simulate how vaccine hesitancy spreads and which messengers can shift opinion",
      "Model compliance with public health mandates across socioeconomic personas",
      "Identify trusted intermediaries within synthetic communities before deploying real campaigns",
    ],
  },
  {
    id: "policy",
    title: "Policy Design",
    domain: "government",
    icon: Icon.Policy,
    summary: "Run synthetic public consultations to stress-test policy proposals.",
    points: [
      "Generate representative citizen personas from demographic data before legislation passes",
      "Simulate how controversial regulations (e.g. carbon tax, AI regulation) will be received",
      "Identify high-resistance segments early so policy communication can be tailored",
    ],
  },
  {
    id: "crisis",
    title: "Crisis Communication",
    domain: "corporate & public sector",
    icon: Icon.Crisis,
    summary: "Simulate reputational damage and recovery before a crisis hits.",
    points: [
      "Model how a corporate scandal propagates across employee, investor, and public clusters",
      "Test different apology or correction strategies against synthetic audience reactions",
      "Identify the cascade point — where misinformation reaches critical mass — and where to intervene",
    ],
  },
  {
    id: "research",
    title: "Academic Research",
    domain: "social science",
    icon: Icon.Research,
    summary: "Generate reproducible data on opinion dynamics without human participants.",
    points: [
      "Run thousands of simulation variants to study polarisation under different network topologies",
      "Model historical information cascades (elections, pandemics) with known outcomes as benchmarks",
      "Provide ethically sourced datasets for NLP and social contagion research",
    ],
  },
  {
    id: "brand",
    title: "Brand Intelligence",
    domain: "marketing",
    icon: Icon.Brand,
    summary: "Understand how product launches or controversies will land across audiences.",
    points: [
      "Simulate consumer reaction to pricing changes, new features, or rebrand announcements",
      "Model influencer impact — which personas carry the most cross-cluster persuasion weight",
      "Test ad messaging variants against synthetic audiences before spending media budget",
    ],
  },
];

const OPPORTUNITIES: ImplicationItem[] = [
  {
    label: "Low-cost foresight",
    detail: "Teams can run hundreds of social scenarios for the cost of a few API calls — compressing what once required expensive surveys or focus groups.",
  },
  {
    label: "Ethical research at scale",
    detail: "Synthetic personas remove the need for human participant recruitment, IRB delays, and privacy concerns in large-scale social dynamics studies.",
  },
  {
    label: "Democratic policy testing",
    detail: "Governments can stress-test laws against diverse simulated publics before enacting them, surfacing resistance early and improving communication.",
  },
  {
    label: "Open-source accountability",
    detail: "MiroFish is open source — anyone can audit the persona generation and simulation logic, reducing the risk of proprietary black-box influence models.",
  },
];

const RISKS: ImplicationItem[] = [
  {
    label: "Synthetic consensus manufacturing",
    detail: "The same tool that models opinion spread can be used to design manipulation campaigns — identifying the minimal nudges needed to shift public opinion artificially.",
  },
  {
    label: "Persona fidelity limits",
    detail: "LLM-generated agents may reflect training biases rather than true population demographics, leading to systematically skewed simulation outputs.",
  },
  {
    label: "Overconfidence in predictions",
    detail: "Simulations are models, not forecasts. Decision-makers may treat synthetic outputs as ground truth, especially under pressure.",
  },
  {
    label: "Data sovereignty",
    detail: "If real social graph data is used to seed personas, privacy risks emerge — particularly when agents are modelled on identifiable communities.",
  },
];

const FUTURE_ITEMS: FutureItem[] = [
  {
    title: "Real-time data ingestion",
    timeframe: "Near-term",
    description: "Connect live RSS feeds, social APIs, or news wires so the knowledge graph updates continuously — running simulations on unfolding events rather than static articles.",
  },
  {
    title: "Thousand-agent swarms",
    timeframe: "Mid-term",
    description: "Batch LLM calls and sparse graph optimisations will enable 1 000+ agent simulations within practical cost and latency budgets, approaching real population scales.",
  },
  {
    title: "Multi-event causal chains",
    timeframe: "Mid-term",
    description: "Chain multiple news events together — simulate how opinion built from Event A shifts the starting conditions for Event B, modelling long-running narratives.",
  },
  {
    title: "Fine-grained persona calibration",
    timeframe: "Research frontier",
    description: "Train small persona models on demographic survey data to produce statistically calibrated agent distributions — moving from plausible to representative populations.",
  },
  {
    title: "Intervention testing",
    timeframe: "Research frontier",
    description: "Introduce counter-messaging agents, fact-checkers, or platform moderation rules mid-simulation and observe whether they dampen or entrench polarisation.",
  },
];

type Props = { content?: StepContent; level?: PersonalizationProfile["level"] };

export function Step6Potential({ content, level = "intermediate" }: Props) {
  const [tab, setTab]             = useState<Tab>("applications");
  const [expanded, setExpanded]   = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {content ? (
        <ExplanationPanel content={content} level={level} />
      ) : (
        <p className="text-sm text-muted-foreground">
          MiroFish is a general-purpose swarm intelligence engine. Below is a survey of where it applies today, the responsibilities that come with it, and where the technology is heading.
        </p>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-sm px-4 py-2.5 transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* ── Applications ── */}
          {tab === "applications" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Click any card to see concrete use-cases in that domain.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {APPLICATIONS.map((app) => {
                  const isOpen = expanded === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setExpanded(isOpen ? null : app.id)}
                      className={`rounded border p-4 cursor-pointer transition-colors ${
                        isOpen
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-muted-foreground/40"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`mt-0.5 shrink-0 transition-colors ${
                          isOpen ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {app.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm leading-tight">{app.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{app.domain}</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{app.summary}</p>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="mt-3 space-y-1.5 overflow-hidden"
                          >
                            {app.points.map((pt, i) => (
                              <li key={i} className="flex gap-2 text-xs text-foreground">
                                <span className="text-primary mt-0.5 shrink-0">→</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Implications ── */}
          {tab === "implications" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Swarm intelligence at this level of fidelity is a dual-use capability. Understanding both sides is essential.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opportunities */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-foreground">What this enables</span>
                  </div>
                  <div className="space-y-2">
                    {OPPORTUNITIES.map((item) => (
                      <div key={item.label} className="p-3 rounded border border-border bg-card">
                        <div className="text-xs font-medium text-foreground mb-1">{item.label}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-xs font-medium text-foreground">What to watch for</span>
                  </div>
                  <div className="space-y-2">
                    {RISKS.map((item) => (
                      <div key={item.label} className="p-3 rounded border border-border bg-card">
                        <div className="text-xs font-medium text-foreground mb-1">{item.label}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground border border-border rounded p-3 bg-muted">
                Like any powerful modelling tool, MiroFish is neutral — the ethical weight sits entirely with its operators. Open-sourcing the codebase is the first step toward community-governed norms.
              </div>
            </div>
          )}

          {/* ── Future ── */}
          {tab === "future" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                The current demo shows a single article, 20 agents, 8 rounds. Here is where the research and engineering roadmap points.
              </p>
              <div className="space-y-2">
                {FUTURE_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-4 p-4 rounded border border-border bg-card"
                  >
                    <div className="shrink-0 pt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                          {item.timeframe}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 rounded border border-border bg-card">
                <div className="shrink-0 mt-0.5">
                  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M8 1C4.1 1 1 4.1 1 8c0 3.1 2 5.7 4.8 6.6.4.1.5-.2.5-.4v-1.4C4.1 13.3 3.6 11 3.6 11c-.3-.8-.8-1-8-1 1-.1.1 0 .2-.1.1-.2.2-.7 0-.3-.5C5 9.5 5.5 8.7 5.5 8.7c-.3-.2-.8-1.3 0-2.6 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4 1 0 2 .1 2.9.4 2.3-1.5 3.3-1.2 3.3-1.2.8 1.3.3 2.4 0 2.6 0 0 .5.8 1.2 1.6.1.2.1.5.2.1.3.1-.1.5-.5.4C13 13.7 15 11.1 15 8c0-3.9-3.1-7-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground mb-1">MiroFish is open source</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The engine, prompts, and simulation logic are fully available. You can extend the persona schema, swap in your own LLM, or build a domain-specific front-end on top of the core simulation loop.
                  </p>
                  <a
                    href="https://github.com/666ghj/MiroFish"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-primary hover:underline"
                  >
                    github.com/DeepPolitika/mirofish →
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
