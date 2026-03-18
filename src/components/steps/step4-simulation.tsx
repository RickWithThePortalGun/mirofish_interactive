"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ExplanationPanel } from "@/components/explanation-panel";
import type { StepContent, PersonalizationProfile } from "@/components/onboarding";

type Stance = "supportive" | "neutral" | "skeptical" | "opposed";

interface SimAgent {
  id: number;
  stance: Stance;
  name: string;
  cluster: "tech" | "policy" | "public";
}

const STANCE_COLOR: Record<Stance, string> = {
  supportive: "#10b981",
  neutral:    "#94a3b8",
  skeptical:  "#f59e0b",
  opposed:    "#ef4444",
};
const STANCE_FILL: Record<Stance, string> = {
  supportive: "rgba(16,185,129,0.18)",
  neutral:    "rgba(148,163,184,0.18)",
  skeptical:  "rgba(245,158,11,0.18)",
  opposed:    "rgba(239,68,68,0.18)",
};

const BASE_POS: { x: number; y: number; cluster: SimAgent["cluster"] }[] = [
  { x: 110, y:  75, cluster: "tech"   },
  { x: 185, y: 135, cluster: "tech"   },
  { x:  55, y: 160, cluster: "tech"   },
  { x: 155, y:  45, cluster: "tech"   },
  { x: 240, y:  70, cluster: "tech"   },
  { x:  90, y: 225, cluster: "tech"   },
  { x: 195, y: 195, cluster: "tech"   },
  { x: 410, y:  60, cluster: "policy" },
  { x: 490, y: 130, cluster: "policy" },
  { x: 360, y: 140, cluster: "policy" },
  { x: 535, y:  55, cluster: "policy" },
  { x: 450, y: 200, cluster: "policy" },
  { x: 320, y:  75, cluster: "policy" },
  { x: 130, y: 300, cluster: "public" },
  { x: 240, y: 290, cluster: "public" },
  { x: 340, y: 310, cluster: "public" },
  { x: 430, y: 300, cluster: "public" },
  { x: 510, y: 285, cluster: "public" },
  { x: 290, y: 340, cluster: "public" },
  { x: 385, y: 340, cluster: "public" },
];

const NAMES = [
  "Priya","Tom","Kwame","Riku","Jana","Marco","Sofia",
  "Fatima","Anders","Leila","Piet","Hanna","Carlos",
  "Elena","Nora","Alexei","Yuki","Ines","Omar","Lena",
];

const NETWORK_EDGES: [number, number][] = [
  [0,1],[0,2],[0,3],[1,4],[1,6],[2,5],[3,4],[4,6],[5,6],
  [7,8],[7,9],[8,10],[9,11],[10,12],[11,12],[7,12],
  [13,14],[14,15],[15,16],[16,17],[13,18],[18,19],[14,19],
  [1,7],[0,9],[3,12],[6,13],[11,14],[5,18],[9,15],[2,16],
];

const ROUND_INFLUENCES: Record<number, [number, number][]> = {
  1: [[3,4],[0,1],[7,9],[1,7]],
  2: [[1,6],[13,14],[11,14],[9,11]],
  3: [[3,12],[0,9],[7,12],[2,5]],
  4: [[1,7],[12,9],[4,6],[16,17]],
  5: [[3,1],[9,15],[0,2],[11,12],[5,18]],
  6: [[3,4],[7,8],[13,18],[10,12]],
  7: [[1,7],[0,9],[3,12],[14,19],[16,17]],
  8: [[0,1],[7,9],[5,6],[11,14],[2,16]],
};

const ROUND_EVENTS: Record<number, string> = {
  1: "Round 1: High-influence tech agents broadcast supportive stance",
  2: "Round 2: Neutral agents begin absorbing nearby opinions",
  3: "Round 3: Tech bridges into policy — cross-cluster persuasion begins",
  4: "Round 4: Tech cluster nears consensus; public skepticism grows",
  5: "Round 5: Cross-cluster bridges reduce neutrality in public",
  6: "Round 6: Tech fully supportive; policy nodes split under pressure",
  7: "Round 7: Two camps solidify — skeptics and supporters",
  8: "Round 8: Tech adopts, public skepticism persists — opinions stable",
};

const CLUSTER_LABEL: Record<SimAgent["cluster"], string> = {
  tech: "Tech / Startup",
  policy: "Policy / Regulation",
  public: "General Public",
};

const TOTAL_ROUNDS = 8;

// ─── deterministic influence propagation ─────────────────────────────────────
// Stance encoded as 0=supportive, 1=neutral, 2=skeptical, 3=opposed
const SCORE_TO_STANCE: Stance[] = ["supportive", "neutral", "skeptical", "opposed"];

// Fixed starting stances — tech leans supportive, policy mixed, public neutral
const INITIAL_SCORES: number[] = [
  0, 1, 1, 0, 2, 1, 0,   // tech:   3 supportive, 3 neutral, 1 skeptical
  2, 1, 1, 3, 2, 1,       // policy: 3 neutral, 2 skeptical, 1 opposed
  1, 1, 1, 2, 1, 2, 1,   // public: 5 neutral, 2 skeptical
];

function applyInfluences(scores: number[], edges: [number, number][]): number[] {
  const next = [...scores];
  const sum   = new Array(scores.length).fill(0);
  const count = new Array(scores.length).fill(0);

  for (const [a, b] of edges) {
    sum[b]   += scores[a];
    count[b] += 1;
  }
  for (let i = 0; i < scores.length; i++) {
    if (count[i] > 0) {
      const avg = sum[i] / count[i];
      if (avg < scores[i] - 0.4)       next[i] = Math.max(0, scores[i] - 1);
      else if (avg > scores[i] + 0.4)  next[i] = Math.min(3, scores[i] + 1);
    }
  }
  return next;
}

// Pre-compute all 9 round states (round 0 = initial, rounds 1–8 = after influence)
function buildSimulation(): number[][] {
  const rounds: number[][] = [INITIAL_SCORES];
  for (let r = 1; r <= TOTAL_ROUNDS; r++) {
    rounds.push(applyInfluences(rounds[r - 1], ROUND_INFLUENCES[r] ?? []));
  }
  return rounds;
}
const SIM_ROUNDS = buildSimulation();

function scoresToAgents(scores: number[]): SimAgent[] {
  return scores.map((score, i) => ({
    id: i,
    cluster: BASE_POS[i].cluster,
    stance: SCORE_TO_STANCE[score],
    name: NAMES[i],
  }));
}

function countStances(agents: SimAgent[]) {
  const c: Record<Stance, number> = { supportive: 0, neutral: 0, skeptical: 0, opposed: 0 };
  agents.forEach((a) => c[a.stance]++);
  return c;
}

// ─── node position offsets ───────────────────────────────────────────────────
type NodeOffsets = Record<number, { dx: number; dy: number }>;

function computeOffsets(prev: NodeOffsets, edges: [number, number][]): NodeOffsets {
  const next: NodeOffsets = {};
  for (let i = 0; i < BASE_POS.length; i++) {
    next[i] = {
      dx: (prev[i]?.dx ?? 0) * 0.55,
      dy: (prev[i]?.dy ?? 0) * 0.55,
    };
  }
  for (const [a, b] of edges) {
    const ax = BASE_POS[a].x, ay = BASE_POS[a].y;
    const bx = BASE_POS[b].x, by = BASE_POS[b].y;
    const dx = ax - bx, dy = ay - by;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    next[b].dx += (dx / dist) * 22;
    next[b].dy += (dy / dist) * 22;
    next[a].dx -= (dx / dist) * 5;
    next[a].dy -= (dy / dist) * 5;
  }
  return next;
}

// ─── theme colors ─────────────────────────────────────────────────────────────
function useColors(isDark: boolean) {
  return isDark
    ? {
        border:         "#30363d",
        mutedFg:        "#8b949e",
        edgeDim:        "rgba(150,160,180,0.2)",
        techZoneFill:   "rgba(96,165,250,0.05)",
        techZoneEdge:   "rgba(96,165,250,0.2)",
        techLabel:      "rgba(96,165,250,0.75)",
        policyZoneFill: "rgba(167,139,250,0.05)",
        policyZoneEdge: "rgba(167,139,250,0.2)",
        policyLabel:    "rgba(167,139,250,0.75)",
        pubZoneFill:    "rgba(52,211,153,0.05)",
        pubZoneEdge:    "rgba(52,211,153,0.2)",
        pubLabel:       "rgba(52,211,153,0.75)",
      }
    : {
        border:         "#e2e8f0",
        mutedFg:        "#64748b",
        edgeDim:        "rgba(100,116,139,0.2)",
        techZoneFill:   "rgba(59,130,246,0.04)",
        techZoneEdge:   "rgba(59,130,246,0.2)",
        techLabel:      "rgba(37,99,235,0.8)",
        policyZoneFill: "rgba(139,92,246,0.04)",
        policyZoneEdge: "rgba(139,92,246,0.2)",
        policyLabel:    "rgba(109,40,217,0.8)",
        pubZoneFill:    "rgba(16,185,129,0.04)",
        pubZoneEdge:    "rgba(16,185,129,0.2)",
        pubLabel:       "rgba(5,150,105,0.8)",
      };
}

// ─── recharts tooltip ─────────────────────────────────────────────────────────
function makeTooltip(isDark: boolean) {
  const bg     = isDark ? "#1c2333" : "#ffffff";
  const border = isDark ? "#30363d" : "#e2e8f0";
  const fg     = isDark ? "#c9d1d9" : "#1e293b";
  const muted  = isDark ? "#8b949e" : "#64748b";

  return function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: number;
  }) {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: bg, border: `1px solid ${border}`, borderRadius: 4,
        padding: "8px 12px", fontSize: 12, color: fg, minWidth: 140,
        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.08)",
      }}>
        <div style={{ color: muted, marginBottom: 6, fontSize: 11, fontWeight: 500 }}>
          Round {label}
        </div>
        {payload.map((e) => (
          <div key={e.name} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: 16, lineHeight: "1.9",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: e.color, flexShrink: 0,
              }} />
              <span style={{ color: fg, textTransform: "capitalize" }}>{e.name}</span>
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: e.color }}>
              {e.value}
            </span>
          </div>
        ))}
      </div>
    );
  };
}

// ─── component ───────────────────────────────────────────────────────────────
type Props = { content?: StepContent; level?: PersonalizationProfile["level"] };

export function Step4Simulation({ content, level = "intermediate" }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colors = useColors(isDark);

  const [round, setRound]             = useState(0);
  const [running, setRunning]         = useState(false);
  const [agents, setAgents]           = useState<SimAgent[]>(() => scoresToAgents(SIM_ROUNDS[0]));
  const [activeEdges, setActiveEdges] = useState<[number, number][]>([]);
  const [offsets, setOffsets]         = useState<NodeOffsets>({});
  const [history, setHistory]         = useState<({ round: number } & Record<Stance, number>)[]>([
    { round: 0, ...countStances(scoresToAgents(SIM_ROUNDS[0])) },
  ]);
  const [hovered, setHovered]         = useState<number | null>(null);
  const [mousePos, setMousePos]       = useState<{ x: number; y: number } | null>(null);

  const roundRef    = useRef(round);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { roundRef.current = round; }, [round]);

  const advanceRound = useCallback((r: number) => {
    const next = r + 1;
    const edges     = ROUND_INFLUENCES[next] ?? [];
    const newAgents = scoresToAgents(SIM_ROUNDS[next]);
    setAgents(newAgents);
    setActiveEdges(edges);
    setOffsets((prev) => computeOffsets(prev, edges));
    setHistory((h) => [...h, { round: next, ...countStances(newAgents) }]);
    setRound(next);
    if (next >= TOTAL_ROUNDS) setRunning(false);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const r = roundRef.current;
        if (r >= TOTAL_ROUNDS) { setRunning(false); return; }
        advanceRound(r);
      }, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, advanceRound]);

  function handleStart() {
    if (round >= TOTAL_ROUNDS) {
      const initial = scoresToAgents(SIM_ROUNDS[0]);
      setRound(0);
      setAgents(initial);
      setHistory([{ round: 0, ...countStances(initial) }]);
      setActiveEdges([]);
      setOffsets({});
    }
    setRunning(true);
  }

  function nodePos(id: number) {
    const b = BASE_POS[id], o = offsets[id] ?? { dx: 0, dy: 0 };
    return { x: b.x + o.dx, y: b.y + o.dy };
  }

  const activeSet   = new Set(activeEdges.map(([a, b]) => `${a}-${b}`));
  const activeNodes = new Set(activeEdges.flatMap(([a, b]) => [a, b]));
  const ChartTooltip = makeTooltip(isDark);
  const hoveredAgent = hovered !== null ? agents[hovered] : null;

  return (
    <div className="space-y-5">
      {content ? (
        <ExplanationPanel content={content} level={level} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Agents are placed on a social network. Each round, influence propagates along active edges — stances shift toward the influencer&apos;s position, and nodes drift to show the pull.
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={running ? () => setRunning(false) : handleStart}
          className="text-sm px-4 py-2 rounded border border-border bg-card hover:bg-muted transition-colors font-medium"
        >
          {running ? "Pause" : round >= TOTAL_ROUNDS ? "Restart" : round === 0 ? "Run Simulation" : "Resume"}
        </button>
        <div className="text-xs text-muted-foreground tabular-nums">
          Round {round} / {TOTAL_ROUNDS}
        </div>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
          />
        </div>
      </div>

      {/* Round event */}
      <AnimatePresence mode="wait">
        {round > 0 && (
          <motion.div
            key={round}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground border border-border rounded px-3 py-2 bg-muted"
          >
            {ROUND_EVENTS[round] ?? `Round ${round}: Simulation running…`}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Network canvas */}
        <div
          className="border border-border rounded bg-card overflow-hidden relative"
          style={{ height: 360 }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseLeave={() => { setHovered(null); setMousePos(null); }}
        >
          <svg width="100%" height="100%" viewBox="0 0 600 370">
            <defs>
              <marker id="sim-arrow-active" viewBox="0 -3 6 6" refX={6} refY={0}
                markerWidth={5} markerHeight={5} orient="auto">
                <path d="M0,-3L6,0L0,3" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Cluster zones */}
            <ellipse cx={155} cy={135} rx={145} ry={115}
              fill={colors.techZoneFill} stroke={colors.techZoneEdge}
              strokeWidth={1} strokeDasharray="4 3" />
            <ellipse cx={430} cy={125} rx={145} ry={100}
              fill={colors.policyZoneFill} stroke={colors.policyZoneEdge}
              strokeWidth={1} strokeDasharray="4 3" />
            <ellipse cx={320} cy={318} rx={210} ry={50}
              fill={colors.pubZoneFill} stroke={colors.pubZoneEdge}
              strokeWidth={1} strokeDasharray="4 3" />

            <text x={22}  y={20}  fontSize={9} fill={colors.techLabel}   fontWeight={500}>{CLUSTER_LABEL.tech}</text>
            <text x={350} y={20}  fontSize={9} fill={colors.policyLabel} fontWeight={500}>{CLUSTER_LABEL.policy}</text>
            <text x={265} y={368} fontSize={9} fill={colors.pubLabel}    fontWeight={500}>{CLUSTER_LABEL.public}</text>

            {/* Persistent dim edges */}
            {NETWORK_EDGES.map(([a, b], i) => {
              if (activeSet.has(`${a}-${b}`) || activeSet.has(`${b}-${a}`)) return null;
              const pa = nodePos(a), pb = nodePos(b);
              return (
                <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={colors.edgeDim} strokeWidth={1} />
              );
            })}

            {/* Active influence edges */}
            {activeEdges.map(([a, b], i) => {
              const pa = nodePos(a), pb = nodePos(b);
              const dx = pb.x - pa.x, dy = pb.y - pa.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const ex = pb.x - (dx / dist) * 17;
              const ey = pb.y - (dy / dist) * 17;
              return (
                <g key={`act-${i}`}>
                  <line x1={pa.x} y1={pa.y} x2={ex} y2={ey}
                    stroke="#f59e0b" strokeWidth={6} opacity={0.10} strokeLinecap="round" />
                  <line x1={pa.x} y1={pa.y} x2={ex} y2={ey}
                    stroke="#f59e0b" strokeWidth={1.8} opacity={0.9}
                    strokeLinecap="round" markerEnd="url(#sim-arrow-active)" />
                </g>
              );
            })}

            {/* Agent nodes */}
            {agents.map((agent) => {
              const pos      = nodePos(agent.id);
              const isActive = activeNodes.has(agent.id);
              const isHov    = hovered === agent.id;
              const r        = isActive ? 15 : 12;
              return (
                <g
                  key={agent.id}
                  style={{
                    transform: `translate(${pos.x}px,${pos.y}px)`,
                    transition: "transform 0.75s cubic-bezier(0.34,1.3,0.64,1)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHovered(agent.id)}
                >
                  {isActive && (
                    <circle cx={0} cy={0} r={r + 7} fill="none"
                      stroke={STANCE_COLOR[agent.stance]} strokeWidth={1} opacity={0.25} />
                  )}
                  {isHov && (
                    <circle cx={0} cy={0} r={r + 4} fill="none"
                      stroke={STANCE_COLOR[agent.stance]} strokeWidth={1.5} opacity={0.5} />
                  )}
                  <circle cx={0} cy={0} r={r}
                    fill={STANCE_FILL[agent.stance]}
                    stroke={STANCE_COLOR[agent.stance]}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <text x={0} y={4} textAnchor="middle" fontSize={8}
                    fill={STANCE_COLOR[agent.stance]} fontWeight={600}
                    style={{ pointerEvents: "none", userSelect: "none" }}>
                    {agent.name.slice(0, 3)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* HTML tooltip */}
          {hoveredAgent && mousePos && (
            <div
              style={{
                position: "absolute",
                left: Math.min(mousePos.x + 14, 600 - 172),
                top: Math.max(mousePos.y - 78, 4),
                pointerEvents: "none",
                zIndex: 10,
                width: 158,
              }}
            >
              <div className="bg-card border border-border rounded text-xs shadow-md overflow-hidden">
                <div style={{ height: 3, background: STANCE_COLOR[hoveredAgent.stance] }} />
                <div className="p-2.5 space-y-1.5">
                  <div className="font-semibold text-foreground leading-none">{hoveredAgent.name}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: STANCE_COLOR[hoveredAgent.stance] }} />
                    <span className="capitalize font-medium"
                      style={{ color: STANCE_COLOR[hoveredAgent.stance] }}>
                      {hoveredAgent.stance}
                    </span>
                  </div>
                  <div className="text-muted-foreground leading-none">
                    {CLUSTER_LABEL[hoveredAgent.cluster]}
                  </div>
                  {activeNodes.has(hoveredAgent.id) && (
                    <div className="text-[10px] font-medium" style={{ color: "#f59e0b" }}>
                      Active this round
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opinion chart */}
        <div className="border border-border rounded bg-card p-4" style={{ height: 360 }}>
          <div className="text-xs font-medium text-foreground mb-1">Opinion distribution</div>
          <div className="text-xs text-muted-foreground mb-3">Agents per stance across rounds</div>
          <ResponsiveContainer width="100%" height="82%" key={isDark ? "dark" : "light"}>
            <LineChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="round"
                tick={{ fontSize: 11, fill: colors.mutedFg }}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: colors.mutedFg }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4, color: colors.mutedFg }} />
              <Line type="monotone" dataKey="supportive" stroke={STANCE_COLOR.supportive} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="neutral"    stroke={STANCE_COLOR.neutral}    strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="skeptical"  stroke={STANCE_COLOR.skeptical}  strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="opposed"    stroke={STANCE_COLOR.opposed}     strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 flex-wrap text-xs items-center">
        {(Object.entries(STANCE_COLOR) as [Stance, string][]).map(([stance, color]) => (
          <div key={stance} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border"
              style={{ background: STANCE_FILL[stance], borderColor: color }} />
            <span className="text-muted-foreground capitalize">{stance}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-5 h-px" style={{ background: "#f59e0b" }} />
          <span className="text-muted-foreground">active influence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-px" style={{ borderTop: `1px dashed ${colors.edgeDim}` }} />
          <span className="text-muted-foreground">network edge</span>
        </div>
      </div>
    </div>
  );
}
