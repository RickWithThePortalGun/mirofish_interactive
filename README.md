# MiroFish Interactive Tutorial

An interactive web explainer for [MiroFish](https://github.com/666ghj/MiroFish) — an open-source AI swarm intelligence engine that simulates how opinions spread through social networks using multi-agent systems.

## What it does

The tutorial walks users through a personalized 5-step wizard:

1. **Overview** — How the MiroFish pipeline works end-to-end
2. **Knowledge Graph** — D3.js force-directed graph showing how events, actors, and concepts are structured
3. **Agent Swarm** — The 6 agent archetypes and how their traits shape behavior
4. **Simulation** — A live opinion dynamics simulation across 20 agents in 3 clusters over 8 rounds, with deterministic influence propagation
5. **Report & Chat** — AI-generated analysis and an interactive chat with any of the 6 agents

A short personalization Q&A at the start uses GPT-4o-mini to generate level-appropriate explanations (beginner / intermediate / expert) for every step.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript)
- [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com) v4
- [D3.js](https://d3js.org) — force-directed knowledge graph
- [Recharts](https://recharts.org) — opinion trend line chart
- [Framer Motion](https://www.framer.com/motion) — step transitions
- [OpenAI](https://platform.openai.com) GPT-4o-mini — personalization + agent chat
- [next-themes](https://github.com/pacocoursey/next-themes) — light / dark mode

## Getting started

```bash
git clone https://github.com/your-username/mirofish-tutorial
cd mirofish-tutorial
npm install
```

Copy the example env file and add your OpenAI key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Optimized for [Vercel](https://vercel.com). After connecting your repository:

1. Add `OPENAI_API_KEY` as an environment variable in the Vercel project settings
2. Deploy — Next.js is auto-detected, API routes run as serverless functions

## Project structure

```
src/
  app/
    api/
      chat/route.ts         # Streaming agent chat (6 agent personas)
      personalize/route.ts  # Generates personalized step content via GPT-4o-mini
    globals.css             # Void Space (dark) + Alabaster Pure (light) theme variables
    layout.tsx
    page.tsx                # Main wizard — onboarding gate + 5 steps
  components/
    onboarding.tsx          # 3-question Q&A → personalization profile
    explanation-panel.tsx   # Level-aware content renderer (beginner/intermediate/expert)
    steps/
      step1-overview.tsx
      step2-knowledge-graph.tsx   # D3 force-directed graph
      step3-agents.tsx
      step4-simulation.tsx        # Opinion dynamics simulation
      step5-report.tsx            # Report + multi-agent chat
```

## License

MIT
