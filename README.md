# Glass-Box AI — Transparent Generation Interface

> **HCI Research Project** — Does exposing an AI's internal generation parameters through visual controls improve user trust and steerability compared to a traditional chat interface?

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## Overview

Most generative AI tools function as opaque "black boxes" — users input text and receive text back with no visibility into the system's behavior. **Glass-Box AI** introduces a novel interface paradigm where users can:

- **See confidence levels** on each segment of AI-generated output (color-coded: green/yellow/red)
- **Directly manipulate generation parameters** (Efficiency, Readability, Detail, Creativity) via tactile sliders
- **Observe real-time output changes** as parameters shift, with a transparency panel explaining parameter influence

This project implements a **within-subjects A/B experiment** comparing:

| | Condition A (Control) | Condition B (Experimental) |
|---|---|---|
| **Interface** | Standard text chat | Glass-Box with sliders + confidence highlights |
| **User control** | Natural language prompts | Direct parameter manipulation |
| **Transparency** | None (black-box) | Full (confidence scores, influence maps) |

## Live Demo

🔗 **[glassbox-hci.vercel.app](https://glassbox-hci.vercel.app)** *(update with your actual URL after deployment)*

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
git clone https://github.com/aayushhks/glassbox-hci.git
cd glassbox-hci
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview    # preview the build locally
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
│   ├── ConditionA.jsx                    # Standard chat experiment
│   ├── ConditionB.jsx                    # Glass-Box experiment
│   └── Results.jsx                       # Data table + CSV/JSON export
│
├── components/
│   ├── GlassBox/                         # Condition B — Experimental
│   │   ├── GlassBox.jsx                  # Main interface: output + control panel
│   │   ├── ParameterSlider.jsx           # Slider with live value + highlight
│   │   └── ConfidenceSegment.jsx         # Color-coded text segment with tooltip
│   │
│   ├── ChatControl/                      # Condition A — Control
│   │   └── ChatControl.jsx               # Standard chatbot with suggestions
│   │
│   ├── Experiment/                       # Experiment framework
│   │   ├── ExperimentWrapper.jsx         # 3-phase flow: instructions → task → survey
│   │   ├── TaskInstructions.jsx          # Pre-task briefing
│   │   └── PostSurvey.jsx               # 6 Likert + 2 open-ended questions
│   │
│   └── shared/
│       └── Header.jsx                    # Navigation bar
│
├── data/
│   └── responses.js                      # Hardcoded AI response variants
│
├── hooks/
│   └── useExperiment.js                  # Session timing + interaction logging
│
├── utils/
│   └── confidence.js                     # Confidence color/label helpers
│
└── styles/
    └── index.css                         # Tailwind v4 theme + animations
```

---

## Experiment Design

### Task

Participants generate and refine a **leader election algorithm for a 5-node distributed system** using each interface.

### Metrics Collected

**Quantitative (automatic)**
- Task completion time (ms)
- Number of interactions (slider adjustments / messages sent)
- Interaction log with timestamps

**Qualitative (post-task survey)**
- Trust, Control, Understanding, Satisfaction, Efficiency, Willingness (5-point Likert)
- Open-ended feedback on most useful/frustrating aspects

### Data Export

Navigate to `/results` to view all recorded sessions. Export as:
- **CSV** — for statistical analysis (R, Python, Excel)
- **JSON** — full interaction logs with timestamps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Animation | Framer Motion |
| Fonts | DM Sans, JetBrains Mono |

---

## Research Context

This project investigates the HCI concept of **algorithmic transparency** — whether giving users direct visual controls over AI behavior improves their sense of agency and trust. It builds on existing work in explainable AI (XAI) but takes a novel approach by focusing on **real-time, tactile manipulation** rather than post-hoc explanations.

**Key references:**
- Raft Consensus Algorithm (Ongaro & Ousterhout, 2014)
- Guidelines for Human-AI Interaction (Amershi et al., 2019)
- Explainable AI: A Brief Survey (Arrieta et al., 2020)

---

## License

MIT

---

## Author

**Aayush Kumar** — MS Computer Science, Boston University