# Glass-Box AI - Direct-Manipulation Interface for Transparent AI Steering

> **HCI System Contribution** — A novel interface that replaces prompt engineering with continuous visual controls (prompt preset sliders) and generation stability indicators, enabling users to steer and audit AI output through direct manipulation.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## Problem

Most generative AI interfaces are **opaque by design**: users type a prompt, receive output, and have no visibility into *why* the AI generated what it did, *how consistent* that output is, or *what tradeoffs* were made. When the output isn't right, the only recourse is trial-and-error prompt rewording — a slow, frustrating process with no feedback loop.

This project asks: **what if users could see and directly manipulate the factors that shape AI output?**

## Approach

Glass-Box introduces two novel interface elements:

### 1. Prompt Preset Sliders (Direct Manipulation)

Instead of writing and rewriting prompts, users adjust **continuous sliders** — Efficiency, Readability, Detail Level, Creativity — that map to different system prompt configurations. This is analogous to how products like ChatGPT Custom Instructions or Claude's style settings work, but exposed as **real-time, continuous, visual controls** rather than hidden dropdowns or free-text boxes.

Each slider position translates to a prompt template behind the scenes:
- Readability at 30% → `"Use formal notation and technical shorthand"`
- Readability at 80% → `"Explain step-by-step in plain language"`

The output updates live as sliders move, giving users an immediate feedback loop.

### 2. Generation Stability Indicators (Transparency)

Each segment of the AI's output is annotated with a **stability score** — a heuristic measuring how much that segment would vary across regenerations at the same parameter settings:

| Level | Score | Meaning |
|-------|-------|---------|
| 🟢 High | 85–99% | Well-established pattern — output is consistent across regenerations |
| 🟡 Medium | 65–84% | Parameter-sensitive — output may change with different settings |
| 🔴 Low | 15–64% | Novel/speculative — output varies significantly across regenerations |

**Why "stability" and not "confidence"?** LLMs do not have a reliable internal sense of factual correctness. A model can produce a wrong answer with high fluency. Stability instead measures *output variance* — whether the same input reliably produces the same output — which maps to real, measurable LLM behavior (token entropy, temperature sensitivity, consensus across samples).

### 3. X-Ray Transparency Overlay

Hovering any segment reveals which prompt preset sliders most influence its content, with visual weight bars. This closes the loop: users can see *what* changed, *why* it changed, and *which control to adjust next*.

## Evaluation Strategy

Following Ledo et al. (CHI 2018) and UIST holistic evaluation guidelines:

| Strategy | What it demonstrates |
|----------|---------------------|
| **Demonstration** | Novel examples showing capabilities the baseline chat cannot match (real-time parameter steering, stability-guided auditing, transparency overlays) |
| **Heuristic evaluation** | Systematic assessment against Nielsen's 10 heuristics and Amershi et al.'s Guidelines for Human-AI Interaction (2019) |
| **Comparative usage study** | Within-subjects A/B comparison (Glass-Box vs. standard chat) with timed tasks and Likert survey |

## Live Demo

🔗 **[glassbox-hci.vercel.app](https://glassbox-hci.vercel.app)** *(update with your actual URL after deployment)*

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+

### Install & Run

```bash
git clone https://github.com/aayushhks/glassbox-hci.git
cd glassbox-hci
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Production Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── main.jsx                              # Entry point
├── App.jsx                               # Router (4 routes)
│
├── pages/
│   ├── Home.jsx                          # Landing — condition selection
│   ├── ConditionA.jsx                    # Standard chat (baseline)
│   ├── ConditionB.jsx                    # Glass-Box (experimental)
│   └── Results.jsx                       # Data table + CSV/JSON export
│
├── components/
│   ├── GlassBox/                         # Condition B — The system contribution
│   │   ├── GlassBox.jsx                  # Main interface: output + control panel
│   │   ├── ParameterSlider.jsx           # Slider with axis labels + highlight
│   │   └── StabilitySegment.jsx          # Stability-annotated text segment
│   │
│   ├── ChatControl/                      # Condition A — Baseline
│   │   └── ChatControl.jsx               # Standard chatbot with suggestions
│   │
│   ├── Experiment/                       # Experiment framework
│   │   ├── ExperimentWrapper.jsx         # 3-phase: instructions → task → survey
│   │   ├── TaskInstructions.jsx          # Pre-task briefing
│   │   └── PostSurvey.jsx               # 8 Likert + 2 open-ended questions
│   │
│   └── shared/
│       └── Header.jsx                    # Navigation
│
├── data/
│   └── responses.js                      # Hardcoded response variants + rationale
│
├── hooks/
│   └── useExperiment.js                  # Session timing + interaction logging
│
├── utils/
│   └── confidence.js                     # Stability scoring + color mapping
│
└── styles/
    └── index.css                         # Tailwind v4 theme + animations
```

---

## Design Decisions

### Why hardcoded responses?

The prototype uses hardcoded response variants rather than a live LLM backend. This is an intentional design choice, not a shortcut:

1. **Isolates the UI variable** — We're studying whether the *interface paradigm* (direct manipulation + transparency) changes user behavior, not whether a particular LLM follows prompt instructions well
2. **Ensures reproducibility** — Every participant sees deterministic output for the same slider positions, eliminating confounds from LLM non-determinism
3. **Simulates ideal behavior** — The variants represent the best-case output of a well-tuned prompt-to-model pipeline, letting us study the ceiling of this interaction paradigm

### Why "stability" not "confidence"?

See the detailed rationale in `src/utils/confidence.js`. The short answer: LLMs don't reliably know when they're wrong (the calibration problem). Stability measures *output consistency* — whether the same input produces the same output — which is measurable, honest, and useful to users without making claims about factual correctness.

### Why sliders, not buttons or dropdowns?

Continuous sliders enable *exploration* — users can discover the parameter space by dragging, observing changes in real-time. Discrete options (buttons, dropdowns) force users into predefined categories. The slider paradigm treats AI steering as a *design space* rather than a *multiple choice question*.

---

## Metrics Collected

**Quantitative (automatic)**
- Task completion time (ms)
- Interaction count and types (slider changes, messages, hovers)
- Timestamped interaction log

**Qualitative (post-task survey)**
- 8 Likert-scale items: Trust, Control, Understanding, Satisfaction, Efficiency, Willingness, Agency, Transparency
- 2 open-ended feedback questions

**Export:** Navigate to `/results` → CSV or JSON download

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Animation | Framer Motion |
| Fonts | DM Sans + JetBrains Mono |
| Deployment | Vercel |

---

## References

- Amershi, S. et al. (2019). Guidelines for Human-AI Interaction. *CHI 2019*
- Ledo, D. et al. (2018). Evaluation Strategies for HCI Toolkit Research. *CHI 2018*
- Ongaro, D. & Ousterhout, J. (2014). In Search of an Understandable Consensus Algorithm. *USENIX ATC*
- Olsen, D. (2007). Evaluating User Interface Systems Research. *UIST 2007*
- Greenberg, S. & Buxton, B. (2008). Usability Evaluation Considered Harmful. *CHI 2008*

---

## Author

**Aayush Kumar** — MS Computer Science, Boston University
