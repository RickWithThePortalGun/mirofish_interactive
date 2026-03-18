import { OpenAI } from "openai";
import { NextRequest } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STEP_CONTEXT = [
  {
    id: 1,
    name: "Overview",
    topic: "What MiroFish is — an open-source AI swarm intelligence engine that simulates how news and opinions spread through society by generating AI personas and running them through a synthetic social network.",
  },
  {
    id: 2,
    name: "Knowledge Graph",
    topic: "How MiroFish parses a news article (the EU AI Act becoming law) using an LLM to extract entities (EU Parliament, OpenAI, Meta), relationships (regulates, prohibits, affects), and sentiment into a structured knowledge graph that seeds the agents' beliefs.",
  },
  {
    id: 3,
    name: "Agent Swarm",
    topic: "How MiroFish generates a diverse population of AI personas — each with a unique background, occupation, location, political stance, influence score, and personality traits — conditioned on the knowledge graph so their views are grounded in the topic.",
  },
  {
    id: 4,
    name: "Social Simulation",
    topic: "How the agents interact on a synthetic social network over 8 rounds, influencing neighbours based on stance strength and proximity, causing opinion clusters to form and the population to polarise over time.",
  },
  {
    id: 5,
    name: "Report & Chat",
    topic: "How MiroFish synthesises the simulation results into a structured insight report (polarization index, most influential node, dominant narrative) and enables live interviews with any simulated agent via OpenAI.",
  },
  {
    id: 6,
    name: "Uses & Potential",
    topic: "The real-world applications of MiroFish across journalism, public health, policy design, crisis communication, academic research, and brand intelligence — alongside the ethical implications (manipulation risk, persona bias, overconfidence in predictions) and future directions (real-time data ingestion, thousand-agent swarms, multi-event causal chains, intervention testing).",
  },
];

export async function POST(req: NextRequest) {
  const { answers } = await req.json();

  const prompt = `You are writing personalised educational content for an interactive web demo about MiroFish — an open-source AI swarm intelligence engine.

The user answered 3 onboarding questions:
- Background: ${answers.background}
- Familiarity with AI agents: ${answers.familiarity}
- Why they're here: ${answers.goal}

Your job: for each of the 6 wizard steps below, write level-appropriate content. Adapt completely to the user's level:

BEGINNER (non-technical / no AI familiarity):
  - Use plain English. No jargon.
  - Lead with a real-world analogy that makes the concept click (e.g. "Think of this like...")
  - keyPoints should be simple observations, not technical facts
  - Skip technicalNote entirely

INTERMEDIATE (some tech / knows AI basics):
  - Use correct terminology but explain it briefly on first use
  - Analogy optional — only if it genuinely clarifies
  - keyPoints should explain what's happening and why it matters
  - technicalNote can mention the tech stack briefly

EXPERT (developer / AI-ML practitioner):
  - Be precise. Use technical terms freely.
  - No analogy needed
  - keyPoints should surface non-obvious implementation details
  - technicalNote should go deep: prompting strategies, data structures, Mesa framework, graph theory, etc.

Steps to cover:
${STEP_CONTEXT.map((s) => `Step ${s.id} — ${s.name}: ${s.topic}`).join("\n")}

Return ONLY valid JSON in exactly this shape:
{
  "level": "beginner" | "intermediate" | "expert",
  "greeting": "One personalised sentence acknowledging who they are and what they'll get from this tour",
  "steps": [
    {
      "id": 1,
      "intro": "2-3 sentences introducing this step at their level",
      "analogy": "One concrete real-world metaphor (omit this field entirely for experts)",
      "keyPoints": ["string", "string", "string"],
      "technicalNote": "One sentence of implementation depth (omit this field for beginners)"
    }
  ]
}

Write all 6 steps. Be specific and genuinely useful — not generic filler.`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1500,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = res.choices[0].message.content ?? "{}";
  return Response.json(JSON.parse(content));
}
