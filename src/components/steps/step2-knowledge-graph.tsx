"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { ExplanationPanel } from "@/components/explanation-panel";
import type { StepContent, PersonalizationProfile } from "@/components/onboarding";

type NodeType = "event" | "actor" | "concept" | "impact";

// Plain types — D3 mutates these with x/y/vx/vy
type RawNode = { id: string; label: string; type: NodeType };
type RawLink = { id: string; label: string; source: string; target: string };

// D3 will replace source/target strings with node references after forceLink
type SimNode = RawNode & d3.SimulationNodeDatum;
type SimLink = { id: string; label: string; source: SimNode; target: SimNode; index?: number };

const NODE_COLORS: Record<NodeType, { fill: string; stroke: string; text: string }> = {
  event:   { fill: "rgba(59,130,246,0.15)",  stroke: "#3b82f6", text: "#3b82f6" },
  actor:   { fill: "rgba(139,92,246,0.15)",  stroke: "#8b5cf6", text: "#8b5cf6" },
  concept: { fill: "rgba(16,185,129,0.15)",  stroke: "#10b981", text: "#10b981" },
  impact:  { fill: "rgba(245,158,11,0.15)",  stroke: "#f59e0b", text: "#f59e0b" },
};

const NODE_R: Record<NodeType, number> = { event: 40, actor: 32, concept: 30, impact: 26 };

const RAW_NODES: RawNode[] = [
  { id: "eu-ai-act",     label: "EU AI Act",      type: "event"   },
  { id: "eu-parliament", label: "EU Parliament",  type: "actor"   },
  { id: "openai",        label: "OpenAI",         type: "actor"   },
  { id: "meta",          label: "Meta AI",        type: "actor"   },
  { id: "compliance",    label: "AI Compliance",  type: "concept" },
  { id: "risk-tiers",    label: "Risk Tiers",     type: "concept" },
  { id: "banned-uses",   label: "Banned Uses",    type: "concept" },
  { id: "jobs",          label: "Tech Jobs",      type: "impact"  },
  { id: "innovation",    label: "Innovation",     type: "impact"  },
  { id: "privacy",       label: "Data Privacy",   type: "impact"  },
];

const RAW_LINKS: RawLink[] = [
  { id: "e1",  source: "eu-parliament", target: "eu-ai-act",   label: "passed"    },
  { id: "e2",  source: "eu-ai-act",     target: "openai",      label: "regulates" },
  { id: "e3",  source: "eu-ai-act",     target: "meta",        label: "regulates" },
  { id: "e4",  source: "eu-ai-act",     target: "risk-tiers",  label: "defines"   },
  { id: "e5",  source: "eu-ai-act",     target: "banned-uses", label: "prohibits" },
  { id: "e6",  source: "risk-tiers",    target: "compliance",  label: "requires"  },
  { id: "e7",  source: "compliance",    target: "jobs",        label: "affects"   },
  { id: "e8",  source: "risk-tiers",    target: "innovation",  label: "slows"     },
  { id: "e9",  source: "banned-uses",   target: "privacy",     label: "protects"  },
  { id: "e10", source: "openai",        target: "compliance",  label: "must meet" },
];

const LEGEND: { type: NodeType; label: string }[] = [
  { type: "event",   label: "Event"   },
  { type: "actor",   label: "Actor"   },
  { type: "concept", label: "Concept" },
  { type: "impact",  label: "Impact"  },
];

type Props = {
  content?: StepContent;
  level?: PersonalizationProfile["level"];
};

export function Step2KnowledgeGraph({ content, level = "intermediate" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [selected, setSelected] = useState<RawNode | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width  = containerRef.current.clientWidth || 680;
    const height = 460;

    const edgeColor  = isDark ? "#3a4060" : "#94a3b8";
    const labelColor = isDark ? "#94a3b8" : "#64748b";
    const labelBg    = isDark ? "#1a2035" : "#f8fafc";

    // Deep-copy so D3 can annotate with x/y
    const nodes: SimNode[] = RAW_NODES.map((n) => ({ ...n }));
    // D3's forceLink will replace string ids with node references
    const links = RAW_LINKS.map((l) => ({ ...l })) as unknown as SimLink[];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "kg-arrow")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 8).attr("refY", 0)
      .attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", edgeColor);

    const g = svg.append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 2.5])
        .on("zoom", (e) => g.attr("transform", e.transform))
    );

    const sim = d3.forceSimulation<SimNode>(nodes)
      .force("link",    d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(140).strength(0.8))
      .force("charge",  d3.forceManyBody().strength(-500))
      .force("center",  d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<SimNode>().radius((d) => NODE_R[d.type] + 14));

    // Link lines
    const linkLine = g.append("g").selectAll<SVGLineElement, SimLink>("line")
      .data(links).join("line")
      .attr("stroke", edgeColor)
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#kg-arrow)");

    // Link label backgrounds + text
    const linkLabelG = g.append("g").selectAll<SVGGElement, SimLink>("g")
      .data(links.filter((l) => l.label)).join("g");

    linkLabelG.append("rect")
      .attr("fill", labelBg).attr("rx", 2).attr("opacity", 0.85);

    const linkLabelText = linkLabelG.append("text")
      .text((d) => d.label)
      .attr("font-size", 9).attr("fill", labelColor).attr("text-anchor", "middle")
      .attr("dominant-baseline", "central");

    // Node groups
    const nodeG = g.append("g").selectAll<SVGGElement, SimNode>("g")
      .data(nodes).join("g")
      .attr("cursor", "pointer")
      .on("click", (_, d) => setSelected((prev) => prev?.id === d.id ? null : d))
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

    nodeG.append("circle")
      .attr("r", (d) => NODE_R[d.type])
      .attr("fill", (d) => NODE_COLORS[d.type].fill)
      .attr("stroke", (d) => NODE_COLORS[d.type].stroke)
      .attr("stroke-width", 1.8);

    // Multi-line node labels
    nodeG.each(function (d) {
      const el = d3.select<SVGGElement, SimNode>(this);
      const words = d.label.split(" ");
      if (words.length <= 1) {
        el.append("text")
          .text(d.label)
          .attr("text-anchor", "middle").attr("dominant-baseline", "central")
          .attr("font-size", 10).attr("font-weight", 600)
          .attr("fill", NODE_COLORS[d.type].text).attr("pointer-events", "none");
      } else {
        const mid = Math.ceil(words.length / 2);
        el.append("text").text(words.slice(0, mid).join(" "))
          .attr("text-anchor", "middle").attr("y", -6)
          .attr("font-size", 10).attr("font-weight", 600)
          .attr("fill", NODE_COLORS[d.type].text).attr("pointer-events", "none");
        el.append("text").text(words.slice(mid).join(" "))
          .attr("text-anchor", "middle").attr("y", 8)
          .attr("font-size", 10).attr("font-weight", 600)
          .attr("fill", NODE_COLORS[d.type].text).attr("pointer-events", "none");
      }
    });

    sim.on("tick", () => {
      linkLine
        .attr("x1", (d) => {
          const sx = d.source.x ?? 0, sy = d.source.y ?? 0;
          const tx = d.target.x ?? 0, ty = d.target.y ?? 0;
          const dx = tx - sx, dy = ty - sy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          return sx + (dx / dist) * (NODE_R[d.source.type] + 2);
        })
        .attr("y1", (d) => {
          const sx = d.source.x ?? 0, sy = d.source.y ?? 0;
          const tx = d.target.x ?? 0, ty = d.target.y ?? 0;
          const dx = tx - sx, dy = ty - sy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          return sy + (dy / dist) * (NODE_R[d.source.type] + 2);
        })
        .attr("x2", (d) => {
          const sx = d.source.x ?? 0, sy = d.source.y ?? 0;
          const tx = d.target.x ?? 0, ty = d.target.y ?? 0;
          const dx = tx - sx, dy = ty - sy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          // extra 6px gap so the arrowhead tip sits flush at the node edge
          return tx - (dx / dist) * (NODE_R[d.target.type] + 6);
        })
        .attr("y2", (d) => {
          const sx = d.source.x ?? 0, sy = d.source.y ?? 0;
          const tx = d.target.x ?? 0, ty = d.target.y ?? 0;
          const dx = tx - sx, dy = ty - sy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          return ty - (dy / dist) * (NODE_R[d.target.type] + 6);
        });

      linkLabelG.attr("transform", (d) => {
        const mx = ((d.source.x ?? 0) + (d.target.x ?? 0)) / 2;
        const my = ((d.source.y ?? 0) + (d.target.y ?? 0)) / 2;
        return `translate(${mx},${my})`;
      });

      // Size the bg rect around the text after first tick
      linkLabelText.each(function () {
        const bbox = (this as SVGTextElement).getBBox?.();
        if (bbox && bbox.width > 0) {
          d3.select(this.parentNode as SVGGElement).select("rect")
            .attr("x", -bbox.width / 2 - 2).attr("y", -bbox.height / 2 - 1)
            .attr("width", bbox.width + 4).attr("height", bbox.height + 2);
        }
      });

      nodeG.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { sim.stop(); };
  }, [isDark]);

  useEffect(() => {
    const cleanup = buildGraph();
    return cleanup;
  }, [buildGraph]);

  // Edge count per node for the inspector
  const edgeCount: Record<string, number> = {};
  RAW_LINKS.forEach((l) => {
    edgeCount[l.source] = (edgeCount[l.source] ?? 0) + 1;
    edgeCount[l.target] = (edgeCount[l.target] ?? 0) + 1;
  });

  const selectedEdges = selected
    ? RAW_LINKS.filter((l) => l.source === selected.id || l.target === selected.id)
    : [];

  return (
    <div className="space-y-4">
      {content ? (
        <ExplanationPanel content={content} level={level} />
      ) : (
        <p className="text-sm text-muted-foreground">
          MiroFish feeds the article through an LLM which extracts entities and relationships into a force-directed knowledge graph. Drag nodes, scroll to zoom, click to inspect.
        </p>
      )}

      <div className="flex gap-4 flex-wrap items-center">
        {LEGEND.map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border"
              style={{ background: NODE_COLORS[type].fill, borderColor: NODE_COLORS[type].stroke }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
        <span className="text-xs text-muted-foreground">· drag · scroll to zoom · click to inspect</span>
      </div>

      <div ref={containerRef} className="border border-border rounded bg-card overflow-hidden" style={{ height: 460 }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {selected && (
        <div className="border border-border rounded p-4 bg-card space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-xs border"
              style={{
                background: NODE_COLORS[selected.type].fill,
                borderColor: NODE_COLORS[selected.type].stroke,
                color: NODE_COLORS[selected.type].text,
              }}
            >
              {selected.type}
            </span>
            <span className="font-semibold">{selected.label}</span>
            <span className="text-xs text-muted-foreground ml-auto">{edgeCount[selected.id] ?? 0} connections</span>
          </div>
          {selectedEdges.length > 0 && (
            <div className="flex flex-col gap-1">
              {selectedEdges.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{RAW_NODES.find((n) => n.id === e.source)?.label ?? e.source}</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted border border-border">{e.label}</span>
                  <span className="font-medium text-foreground">{RAW_NODES.find((n) => n.id === e.target)?.label ?? e.target}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
