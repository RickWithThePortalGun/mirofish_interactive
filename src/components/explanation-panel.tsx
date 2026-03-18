"use client";

import type { StepContent } from "@/components/onboarding";

type Props = {
  content: StepContent;
  level: "beginner" | "intermediate" | "expert";
};

export function ExplanationPanel({ content, level }: Props) {
  return (
    <div className="space-y-3 mb-6">
      {/* Intro */}
      <p className="text-sm text-muted-foreground leading-relaxed">{content.intro}</p>

      {/* Analogy — only for beginner/intermediate when present */}
      {content.analogy && level !== "expert" && (
        <div className="flex gap-3 border border-border rounded p-3 bg-muted">
          <div className="shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-foreground mb-0.5">Analogy</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{content.analogy}</p>
          </div>
        </div>
      )}

      {/* Key points */}
      {content.keyPoints?.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-foreground">What to notice</div>
          <ul className="space-y-1">
            {content.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                <span className="text-primary shrink-0 mt-px">→</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical note — only for intermediate/expert when present */}
      {content.technicalNote && level !== "beginner" && (
        <div className="flex gap-3 border border-border rounded p-3 bg-card">
          <div className="shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground">
              <path d="M4 5l-3 2 3 2M10 5l3 2-3 2M8 3l-2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Implementation detail</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{content.technicalNote}</p>
          </div>
        </div>
      )}

      <div className="border-b border-border" />
    </div>
  );
}
