"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { ExplanationPanel } from "@/components/explanation-panel";
import type { StepContent, PersonalizationProfile } from "@/components/onboarding";

// Same hex values used in step 4 simulation so the report matches
const STANCE_HEX = {
  supportive: "#10b981",
  neutral:    "#94a3b8",
  skeptical:  "#f59e0b",
  opposed:    "#ef4444",
};

// Round 8 convergence: simulation trends to these counts for 20 agents
// (matches the round=8 probabilities in step4: 35% sup, 13% neu, 30% ske, 22% opp)
const reportData = [
  { stance: "Supportive", count: 7, color: STANCE_HEX.supportive },
  { stance: "Neutral",    count: 3, color: STANCE_HEX.neutral    },
  { stance: "Skeptical",  count: 6, color: STANCE_HEX.skeptical  },
  { stance: "Opposed",    count: 4, color: STANCE_HEX.opposed    },
];

function makeBarTooltip(isDark: boolean) {
  const bg     = isDark ? "#1c2333" : "#ffffff";
  const border = isDark ? "#30363d" : "#e2e8f0";
  const muted  = isDark ? "#8b949e" : "#64748b";

  return function BarTooltip({ active, payload }: {
    active?: boolean;
    payload?: { value: number; payload: { stance: string; color: string } }[];
  }) {
    if (!active || !payload?.length) return null;
    const { stance, color } = payload[0].payload;
    const count = payload[0].value;
    return (
      <div style={{
        background: bg, border: `1px solid ${border}`, borderRadius: 5,
        padding: "7px 11px", fontSize: 12,
      }}>
        <span style={{ color }}>{stance}</span>
        <span style={{ color: muted, marginLeft: 8 }}>
          {count} agent{count !== 1 ? "s" : ""}
        </span>
      </div>
    );
  };
}

const keyFindings = [
  { label: "Polarization index",   value: "0.74",          note: "High — agents converged into two camps with little middle ground."         },
  { label: "Most influential",     value: "Riku Virtanen", note: "Shifted 3 neutral agents to skeptical over 5 rounds."                      },
  { label: "Dominant narrative",   value: "Compliance burden", note: "Skeptical framing around startup costs spread fastest."                },
  { label: "Resilient cluster",    value: "Policy advocates",  note: "6 agents stayed supportive despite sustained opposition pressure."      },
];

type Stance = "supportive" | "neutral" | "skeptical" | "opposed";

type AgentOption = {
  id: string;
  name: string;
  initials: string;
  occupation: string;
  location: string;
  stance: Stance;
  openingStatement: string;
  suggestedQuestions: string[];
};

const stanceConfig: Record<Stance, { label: string; color: string; bg: string }> = {
  supportive: { label: "Supportive", color: "hsl(160 55% 40%)", bg: "hsl(160 55% 40% / 0.1)" },
  neutral:    { label: "Neutral",    color: "hsl(215 14% 50%)", bg: "hsl(215 14% 50% / 0.1)" },
  skeptical:  { label: "Skeptical",  color: "hsl(30 75% 48%)",  bg: "hsl(30 75% 48% / 0.1)"  },
  opposed:    { label: "Opposed",    color: "hsl(0 62% 52%)",   bg: "hsl(0 62% 52% / 0.1)"   },
};

const AGENTS: AgentOption[] = [
  {
    id: "agent-1",
    name: "Priya Nair",
    initials: "PN",
    occupation: "ML Engineer",
    location: "Berlin, Germany",
    stance: "supportive",
    openingStatement: "Finally some structure. The Wild West era of AI needed to end.",
    suggestedQuestions: [
      "What specific parts of the Act do you find most useful?",
      "Did you face pushback from your engineering team?",
      "What would you change about the Act?",
    ],
  },
  {
    id: "agent-2",
    name: "Tom Buchanan",
    initials: "TB",
    occupation: "Venture Capitalist",
    location: "London, UK",
    stance: "skeptical",
    openingStatement: "Good intentions, but compliance costs will crush European startups.",
    suggestedQuestions: [
      "Which of your portfolio companies is most affected?",
      "What would acceptable AI regulation look like to you?",
      "Did any pro-regulation arguments change your view?",
    ],
  },
  {
    id: "agent-3",
    name: "Fatima Al-Rashid",
    initials: "FA",
    occupation: "Policy Analyst",
    location: "Brussels, Belgium",
    stance: "supportive",
    openingStatement: "This is a landmark moment for democratic governance of technology.",
    suggestedQuestions: [
      "What's the biggest implementation risk you see?",
      "How do you respond to the startup cost argument?",
      "Which article in the Act is most important?",
    ],
  },
  {
    id: "agent-4",
    name: "Riku Virtanen",
    initials: "RV",
    occupation: "CTO, AI Startup",
    location: "Helsinki, Finland",
    stance: "opposed",
    openingStatement: "Vague definitions, heavy penalties. We're moving our EU operation to Switzerland.",
    suggestedQuestions: [
      "Why are you moving to Switzerland?",
      "What specific definitions concern you most?",
      "Did talking to Fatima change your mind at all?",
    ],
  },
  {
    id: "agent-5",
    name: "Elena Vasquez",
    initials: "EV",
    occupation: "Retired Educator",
    location: "Madrid, Spain",
    stance: "neutral",
    openingStatement: "If it stops AI from making decisions about my pension, I'm for it.",
    suggestedQuestions: [
      "What do you wish you understood better about the Act?",
      "Did any conversation in the simulation reassure you?",
      "What would you tell EU regulators if you could?",
    ],
  },
  {
    id: "agent-6",
    name: "Kwame Asante",
    initials: "KA",
    occupation: "CS Student",
    location: "Amsterdam, Netherlands",
    stance: "skeptical",
    openingStatement: "Will this kill open-source AI development in Europe?",
    suggestedQuestions: [
      "Which open-source exemptions do you think are too weak?",
      "Did your views shift after 8 rounds?",
      "What would you add to the Act to protect open source?",
    ],
  },
];

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  content?: StepContent;
  level?: PersonalizationProfile["level"];
};

export function Step5Report({ content, level = "intermediate" }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const BarTooltip = makeBarTooltip(isDark);

  const [selectedAgent, setSelectedAgent] = useState<AgentOption>(AGENTS[3]); // default Riku
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chat when agent changes
  function switchAgent(agent: AgentOption) {
    setSelectedAgent(agent);
    setMessages([]);
    setInput("");
    setNoKey(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...next, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, agentId: selectedAgent.id }),
      });

      if (res.status === 500) {
        setNoKey(true);
        setMessages([...next, { role: "assistant", content: "[OpenAI API key not configured. Add OPENAI_API_KEY to .env.local to enable live chat.]" }]);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: full }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "[Connection error — check your API key and network.]" }]);
    }

    setStreaming(false);
    inputRef.current?.focus();
  }

  const sc = stanceConfig[selectedAgent.stance];

  return (
    <div className="space-y-6">
      {content ? (
        <ExplanationPanel content={content} level={level} />
      ) : (
        <p className="text-sm text-muted-foreground">
          After the simulation ends, MiroFish synthesizes the results into a structured report — and lets you interview any agent directly.
        </p>
      )}

      {/* Report */}
      <div className="border border-border rounded bg-card divide-y divide-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Simulation Report</span>
          <span className="text-xs text-muted-foreground font-mono">EU AI Act · 20 agents · 8 rounds</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-muted-foreground mb-3">Final opinion distribution</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={reportData} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#30363d" : "#e2e8f0"} vertical={false} />
                <XAxis dataKey="stance" tick={{ fontSize: 11, fill: isDark ? "#8b949e" : "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? "#8b949e" : "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
                <Bar
                  dataKey="count"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => (
                    <rect
                      x={props.x}
                      y={props.y}
                      width={props.width}
                      height={props.height}
                      fill={reportData[props.index]?.color ?? "#6366f1"}
                      rx={3}
                    />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Key findings</div>
            {keyFindings.map((f) => (
              <div key={f.label} className="space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                  <span className="text-xs font-semibold text-foreground">{f.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 space-y-1">
          <div className="text-xs text-muted-foreground">AI-generated summary</div>
          <p className="text-sm text-foreground leading-relaxed">
            The EU AI Act simulation revealed strong polarization between tech operators and policy advocates. Compliance cost framing was the most viral narrative, adopted by 45% of agents within 4 rounds. The regulation&apos;s risk-tier system was the most contested concept — attracting both the strongest support and the strongest opposition. Neutral agents disproportionately moved toward skepticism.
          </p>
        </div>
      </div>

      {/* Agent picker */}
      <div className="space-y-3">
        <div className="text-sm font-semibold">Interview an agent</div>
        <p className="text-xs text-muted-foreground">
          Choose any agent from the simulation to interview. Each has their own perspective shaped by 8 rounds of debate.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AGENTS.map((agent) => {
            const asc = stanceConfig[agent.stance];
            const isActive = selectedAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => switchAgent(agent)}
                className={`text-left p-3 rounded border transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded border flex items-center justify-center text-xs font-semibold"
                    style={{ borderColor: asc.color + "66", background: asc.bg, color: asc.color }}>
                    {agent.initials}
                  </div>
                  <span className="text-xs font-medium truncate">{agent.name}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{agent.occupation}</div>
                <div
                  className="text-xs mt-1.5 px-1.5 py-0.5 rounded inline-block border"
                  style={{ background: asc.bg, borderColor: asc.color + "44", color: asc.color }}
                >
                  {asc.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat panel */}
      <div className="border border-border rounded bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded border flex items-center justify-center text-xs font-semibold"
              style={{ borderColor: sc.color + "66", background: sc.bg, color: sc.color }}
            >
              {selectedAgent.initials}
            </div>
            <div>
              <div className="text-sm font-semibold">{selectedAgent.name}</div>
              <div className="text-xs text-muted-foreground">{selectedAgent.occupation} · {selectedAgent.location}</div>
            </div>
          </div>
          <span
            className="text-xs border rounded px-2 py-0.5"
            style={{ background: sc.bg, borderColor: sc.color + "44", color: sc.color }}
          >
            {sc.label}
          </span>
        </div>

        {noKey && (
          <div className="px-4 py-2 bg-muted text-xs text-muted-foreground border-b border-border">
            Add <code className="font-mono">OPENAI_API_KEY</code> to <code className="font-mono">.env.local</code> to enable live chat.
          </div>
        )}

        {/* Opening statement */}
        {messages.length === 0 && (
          <div className="px-4 pt-4">
            <div className="flex gap-2">
              <div
                className="w-6 h-6 rounded border flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
                style={{ borderColor: sc.color + "66", background: sc.bg, color: sc.color }}
              >
                {selectedAgent.initials}
              </div>
              <div className="text-sm text-foreground bg-muted border border-border rounded px-3 py-2 leading-relaxed">
                <em>&ldquo;{selectedAgent.openingStatement}&rdquo;</em>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="min-h-[140px] max-h-64 overflow-y-auto px-4 py-3 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] text-sm rounded px-3 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1 items-center py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {selectedAgent.suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-2.5 py-1 rounded border border-border hover:bg-muted transition-colors text-muted-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-border flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={`Ask ${selectedAgent.name.split(" ")[0]} a question…`}
            className="flex-1 text-sm border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            disabled={streaming}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="text-sm px-4 py-2 rounded border border-primary bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
