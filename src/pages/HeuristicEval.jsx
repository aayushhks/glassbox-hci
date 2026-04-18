import { useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// EVALUATION 1: TASK SCENARIO WALKTHROUGHS
// Concrete step-by-step comparison of identical goals across both conditions
// ═══════════════════════════════════════════════════════════════════════════════

const TASK_SCENARIOS = [
    {
        id: 'ts1',
        goal: 'Make the output more concise',
        stepsA: [
            { action: 'Type', detail: '"Can you make the response more concise?"', time: 8 },
            { action: 'Wait', detail: 'AI regenerates full response (~2s)', time: 2 },
            { action: 'Read', detail: 'Re-read entire response to find what changed', time: 15 },
            { action: 'Evaluate', detail: 'Decide if it\'s concise enough — still too verbose', time: 5 },
            { action: 'Type', detail: '"Make it even shorter, use compact notation"', time: 10 },
            { action: 'Wait', detail: 'AI regenerates again', time: 2 },
            { action: 'Read', detail: 'Re-read to verify', time: 12 },
        ],
        stepsB: [
            { action: 'Drag', detail: 'Efficiency slider from 50% → 80%', time: 1.5 },
            { action: 'Observe', detail: 'Output updates live — see pseudocode switch to compact form', time: 3 },
            { action: 'Fine-tune', detail: 'Adjust to 70% — find the sweet spot', time: 2 },
        ],
        insight: 'Chat requires full regeneration cycles with no preview. Glass-Box provides continuous, reversible adjustment with instant visual feedback.',
    },
    {
        id: 'ts2',
        goal: 'Explore a creative/novel approach',
        stepsA: [
            { action: 'Type', detail: '"Can you suggest a more creative or novel approach?"', time: 10 },
            { action: 'Wait', detail: 'AI generates response', time: 2 },
            { action: 'Read', detail: 'Read new approach', time: 10 },
            { action: 'Evaluate', detail: 'No indication of how reliable this novel approach is', time: 8 },
            { action: 'Type', detail: '"How confident are you in this approach?"', time: 8 },
            { action: 'Wait', detail: 'AI responds (but can\'t self-assess reliably)', time: 2 },
            { action: 'Read', detail: 'Read meta-response', time: 5 },
        ],
        stepsB: [
            { action: 'Drag', detail: 'Creativity slider from 40% → 75%', time: 1.5 },
            { action: 'Observe', detail: 'New "Novel Optimization" section appears — immediately see RED stability indicator (58%)', time: 3 },
            { action: 'Hover', detail: 'X-Ray shows Creativity has 95% influence on this segment', time: 2 },
            { action: 'Decide', detail: 'Stability indicator tells user: "this is speculative, verify independently"', time: 2 },
        ],
        insight: 'In Chat, users must explicitly ask about reliability (and the AI can\'t self-assess well). In Glass-Box, stability indicators automatically flag speculative content the moment it appears.',
    },
    {
        id: 'ts3',
        goal: 'Switch between technical and plain English',
        stepsA: [
            { action: 'Type', detail: '"Rewrite this in simpler language for a non-technical audience"', time: 12 },
            { action: 'Wait', detail: 'Full regeneration', time: 2 },
            { action: 'Read', detail: 'Check if tone is right', time: 10 },
            { action: 'Type', detail: '"Actually, keep the pseudocode technical but simplify the explanation"', time: 15 },
            { action: 'Wait', detail: 'Regeneration', time: 2 },
            { action: 'Read', detail: 'Verify partial change', time: 10 },
        ],
        stepsB: [
            { action: 'Drag', detail: 'Readability slider from 40% → 80%', time: 1.5 },
            { action: 'Observe', detail: 'Explanations switch to plain English. Pseudocode stays (controlled by Efficiency slider independently)', time: 3 },
        ],
        insight: 'Chat requires precise prompt engineering to request partial changes. Glass-Box parameters are orthogonal — Readability affects explanations without touching code style.',
    },
    {
        id: 'ts4',
        goal: 'Understand which parts of the output to trust',
        stepsA: [
            { action: 'Read', detail: 'Read entire output — all text looks the same, no visual differentiation', time: 15 },
            { action: 'Think', detail: 'Mentally assess each section based on personal knowledge', time: 20 },
            { action: 'Type', detail: '"Which parts are you most/least sure about?"', time: 8 },
            { action: 'Wait', detail: 'AI responds (but self-assessment is unreliable)', time: 2 },
            { action: 'Read', detail: 'Read meta-commentary', time: 8 },
        ],
        stepsB: [
            { action: 'Glance', detail: 'Green/yellow/red color coding immediately visible — zero effort', time: 2 },
            { action: 'Focus', detail: 'Identify the 2 red/yellow segments that need scrutiny', time: 3 },
            { action: 'Hover', detail: 'X-Ray on low-stability segment reveals it\'s driven by high Creativity setting', time: 2 },
        ],
        insight: 'Chat provides no visual signal for output reliability. Glass-Box uses pre-attentive color coding — users identify uncertain content before even reading it.',
    },
]

// ═══════════════════════════════════════════════════════════════════════════════
// EVALUATION 2: HEURISTIC EVALUATION (PRE-FILLED)
// Scored by the researcher based on systematic analysis
// ═══════════════════════════════════════════════════════════════════════════════

const HEURISTICS = [
    {
        name: 'Visibility of System Status',
        source: 'Nielsen #1',
        scoreA: 2, scoreB: 5,
        justA: 'Only feedback is a typing indicator. No insight into generation parameters or output reliability.',
        justB: 'Stability scores per segment, slider positions show current state, X-Ray reveals parameter influence. User always knows what the system is doing and why.',
    },
    {
        name: 'User Control and Freedom',
        source: 'Nielsen #3',
        scoreA: 2, scoreB: 5,
        justA: 'Can send a new message, but cannot partially undo or selectively adjust. Each change requires full regeneration.',
        justB: 'Sliders are continuously adjustable and instantly reversible. Users can undo any change by dragging back. Non-destructive exploration.',
    },
    {
        name: 'Match Between System and Real World',
        source: 'Nielsen #2',
        scoreA: 4, scoreB: 4,
        justA: 'Natural language input is intuitive and mirrors real conversation.',
        justB: 'Labeled sliders with domain-relevant terms (Efficiency, Readability). Axis labels show concrete mapping. Slightly less natural than free-form text.',
    },
    {
        name: 'Consistency and Standards',
        source: 'Nielsen #4',
        scoreA: 4, scoreB: 4,
        justA: 'Standard chat UI — message bubbles, send button, familiar to all users.',
        justB: 'Standard slider controls, universal color coding (green=good, red=caution). Consistent visual language throughout.',
    },
    {
        name: 'Error Prevention',
        source: 'Nielsen #5',
        scoreA: 1, scoreB: 4,
        justA: 'No guardrails. Bad prompts produce bad output silently. No way to know if output is unreliable.',
        justB: 'Low-stability indicators warn before users act on unreliable content. Slider ranges prevent extreme combinations.',
    },
    {
        name: 'Recognition over Recall',
        source: 'Nielsen #6',
        scoreA: 2, scoreB: 5,
        justA: 'Users must recall prompt engineering techniques from memory ("be more concise", "add edge cases").',
        justB: 'All options visible as labeled sliders with descriptions. No need to recall specific prompt phrases.',
    },
    {
        name: 'Flexibility and Efficiency of Use',
        source: 'Nielsen #7',
        scoreA: 3, scoreB: 5,
        justA: 'Experts can craft precise prompts. Novices struggle with vague or ineffective prompts.',
        justB: 'Novices explore by dragging sliders. Experts use X-Ray overlay to make precise parameter adjustments. Both skill levels supported.',
    },
    {
        name: 'Make clear what the system can do',
        source: 'Amershi G1',
        scoreA: 1, scoreB: 4,
        justA: 'Capabilities discovered through trial and error only.',
        justB: 'Slider ranges and stability scores communicate capability boundaries. Low stability signals "edge of reliable capability."',
    },
    {
        name: 'Make clear why the system did what it did',
        source: 'Amershi G11',
        scoreA: 1, scoreB: 5,
        justA: 'No explanation. Output is a black-box response.',
        justB: 'X-Ray overlay shows per-segment parameter influence. Users see exactly why Readability=80 produced plain English.',
    },
    {
        name: 'Support efficient correction',
        source: 'Amershi G13',
        scoreA: 2, scoreB: 5,
        justA: 'Correction requires typing a new message and waiting for full regeneration.',
        justB: 'Single slider drag instantly reshapes output. Correction is continuous, visual, and immediate.',
    },
    {
        name: 'Convey consequences of user actions',
        source: 'Amershi G5',
        scoreA: 1, scoreB: 5,
        justA: 'User sends message, waits for response. No preview of what will change.',
        justB: 'Output updates in real-time as sliders move. Stability scores shift live, showing tradeoffs immediately.',
    },
]

// ═══════════════════════════════════════════════════════════════════════════════
// EVALUATION 3: INTERACTION EFFICIENCY METRICS
// Quantitative comparison of actions, information, and time
// ═══════════════════════════════════════════════════════════════════════════════

const EFFICIENCY_METRICS = [
    {
        metric: 'Actions to adjust output style',
        condA: { value: '2–4 messages', numeric: 3 },
        condB: { value: '1 slider drag', numeric: 1 },
        unit: 'actions',
        explanation: 'Chat requires iterative prompt refinement. Glass-Box provides direct manipulation.',
    },
    {
        metric: 'Time to see result of a change',
        condA: { value: '~4–6 sec', numeric: 5 },
        condB: { value: '< 0.5 sec', numeric: 0.5 },
        unit: 'seconds',
        explanation: 'Chat regenerates the full response. Glass-Box updates live as sliders move.',
    },
    {
        metric: 'Feedback signals per screen',
        condA: { value: '1 (text)', numeric: 1 },
        condB: { value: '4+ (stability, color, category, influence)', numeric: 4 },
        unit: 'signals',
        explanation: 'Chat shows only text. Glass-Box layers color coding, stability scores, category labels, and transparency overlays.',
    },
    {
        metric: 'Reversibility of changes',
        condA: { value: 'Not possible', numeric: 0 },
        condB: { value: 'Fully reversible', numeric: 1 },
        unit: 'boolean',
        explanation: 'Chat messages cannot be unsent. Sliders can be dragged back to any previous position.',
    },
    {
        metric: 'Discoverable output variations',
        condA: { value: '~3 (depends on prompt skill)', numeric: 3 },
        condB: { value: 'Continuous 4D space', numeric: 100 },
        unit: 'variations',
        explanation: 'Chat relies on user creativity in prompt phrasing. Glass-Box exposes the full parameter space for exploration.',
    },
    {
        metric: 'Reliability indicators visible',
        condA: { value: '0', numeric: 0 },
        condB: { value: '1 per segment (5–7 total)', numeric: 6 },
        unit: 'indicators',
        explanation: 'Chat gives no reliability signal. Glass-Box shows stability score on every segment.',
    },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionHeader({ title, subtitle }) {
    return (
        <div style={{ marginBottom: 20, marginTop: 40 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>{title}</h3>
            <p style={{ fontSize: 13, color: '#7a8a9a', lineHeight: 1.5 }}>{subtitle}</p>
        </div>
    )
}

function ScenarioCard({ scenario, index }) {
    const [expanded, setExpanded] = useState(false)
    const totalTimeA = scenario.stepsA.reduce((s, step) => s + step.time, 0)
    const totalTimeB = scenario.stepsB.reduce((s, step) => s + step.time, 0)
    const speedup = ((totalTimeA - totalTimeB) / totalTimeA * 100).toFixed(0)

    return (
        <div style={{
            marginBottom: 16, borderRadius: 12,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
        }}>
            {/* Header - always visible */}
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: '18px 22px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#5a6a7a', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                        SCENARIO {index + 1}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#d0dce8' }}>
                        {scenario.goal}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#5a6a7a' }}>Chat (A)</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#8899aa' }}>
                            {scenario.stepsA.length} steps
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5a6a7a' }}>{totalTimeA}s</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#5a6a7a' }}>Glass-Box (B)</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#00d4aa' }}>
                            {scenario.stepsB.length} steps
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5a6a7a' }}>{totalTimeB}s</div>
                    </div>
                    <div style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
                        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#00d4aa',
                    }}>
                        {speedup}% faster
                    </div>
                    <span style={{ color: '#5a6a7a', fontSize: 14 }}>{expanded ? '▾' : '▸'}</span>
                </div>
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div style={{ padding: '0 22px 20px 22px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                        {/* Condition A steps */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                Chat (A) — {scenario.stepsA.length} steps, {totalTimeA}s
                            </div>
                            {scenario.stepsA.map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5a6a7a',
                                    }}>{i + 1}</div>
                                    <div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#8899aa' }}>{step.action}</span>
                                        <span style={{ fontSize: 11, color: '#5a6a7a' }}> — {step.detail}</span>
                                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4a5a6a', marginLeft: 6 }}>{step.time}s</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Condition B steps */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#00d4aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                Glass-Box (B) — {scenario.stepsB.length} steps, {totalTimeB}s
                            </div>
                            {scenario.stepsB.map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00d4aa',
                                    }}>{i + 1}</div>
                                    <div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#00d4aa' }}>{step.action}</span>
                                        <span style={{ fontSize: 11, color: '#6a8a7a' }}> — {step.detail}</span>
                                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4a6a5a', marginLeft: 6 }}>{step.time}s</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insight */}
                    <div style={{
                        padding: '12px 16px', borderRadius: 8,
                        background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.1)',
                        fontSize: 12, color: '#7a9a8a', lineHeight: 1.6,
                    }}>
                        <strong style={{ color: '#00d4aa' }}>Finding: </strong>{scenario.insight}
                    </div>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function HeuristicEval() {
    // Compute heuristic averages
    const avgA = (HEURISTICS.reduce((s, h) => s + h.scoreA, 0) / HEURISTICS.length).toFixed(1)
    const avgB = (HEURISTICS.reduce((s, h) => s + h.scoreB, 0) / HEURISTICS.length).toFixed(1)
    const nielsenH = HEURISTICS.filter((h) => h.source.startsWith('Nielsen'))
    const amershiH = HEURISTICS.filter((h) => h.source.startsWith('Amershi'))
    const nielsenAvgA = (nielsenH.reduce((s, h) => s + h.scoreA, 0) / nielsenH.length).toFixed(1)
    const nielsenAvgB = (nielsenH.reduce((s, h) => s + h.scoreB, 0) / nielsenH.length).toFixed(1)
    const amershiAvgA = (amershiH.reduce((s, h) => s + h.scoreA, 0) / amershiH.length).toFixed(1)
    const amershiAvgB = (amershiH.reduce((s, h) => s + h.scoreB, 0) / amershiH.length).toFixed(1)

    // Task scenario totals
    const totalTimeA = TASK_SCENARIOS.reduce((s, sc) => s + sc.stepsA.reduce((a, st) => a + st.time, 0), 0)
    const totalTimeB = TASK_SCENARIOS.reduce((s, sc) => s + sc.stepsB.reduce((a, st) => a + st.time, 0), 0)
    const totalStepsA = TASK_SCENARIOS.reduce((s, sc) => s + sc.stepsA.length, 0)
    const totalStepsB = TASK_SCENARIOS.reduce((s, sc) => s + sc.stepsB.length, 0)

    const exportAll = () => {
        const data = {
            taskScenarios: TASK_SCENARIOS.map((sc) => ({
                goal: sc.goal,
                stepsA: sc.stepsA.length,
                stepsB: sc.stepsB.length,
                timeA: sc.stepsA.reduce((s, st) => s + st.time, 0),
                timeB: sc.stepsB.reduce((s, st) => s + st.time, 0),
                insight: sc.insight,
            })),
            heuristicScores: HEURISTICS.map((h) => ({
                heuristic: h.name, source: h.source,
                scoreA: h.scoreA, scoreB: h.scoreB,
                delta: h.scoreB - h.scoreA,
            })),
            efficiencyMetrics: EFFICIENCY_METRICS.map((m) => ({
                metric: m.metric,
                conditionA: m.condA.value,
                conditionB: m.condB.value,
            })),
            summary: {
                heuristicAvgA: avgA, heuristicAvgB: avgB,
                totalTaskTimeA: totalTimeA, totalTaskTimeB: totalTimeB,
                totalTaskStepsA: totalStepsA, totalTaskStepsB: totalStepsB,
            },
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob); const a = document.createElement('a')
        a.href = url; a.download = 'glassbox_full_evaluation.json'; a.click(); URL.revokeObjectURL(url)
    }

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 32px 80px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
                Evaluation
            </h2>
            <p style={{ fontSize: 14, color: '#7a8a9a', marginBottom: 0 }}>
                Three evaluation strategies following Ledo et al. (CHI 2018): task scenario analysis, heuristic evaluation, and interaction efficiency benchmarks.
            </p>

            {/* ─── OVERVIEW STAT CARDS ─── */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28, marginBottom: 8, flexWrap: 'wrap' }}>
                {[
                    { label: 'Heuristic Score', a: avgA, b: avgB, sub: '/5.0' },
                    { label: 'Total Task Steps', a: totalStepsA, b: totalStepsB, sub: 'across 4 scenarios' },
                    { label: 'Total Task Time', a: `${totalTimeA}s`, b: `${totalTimeB}s`, sub: 'estimated' },
                    { label: 'Speed Improvement', a: '', b: `${((totalTimeA - totalTimeB) / totalTimeA * 100).toFixed(0)}%`, sub: 'Glass-Box faster' },
                ].map((card) => (
                    <div key={card.label} style={{
                        flex: 1, minWidth: 140, padding: '16px 18px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ fontSize: 10, color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                            {card.label}
                        </div>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                            {card.a && (
                                <div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#8899aa' }}>{card.a}</span>
                                    {card.sub && <span style={{ fontSize: 10, color: '#4a5a6a', marginLeft: 2 }}>{!card.b ? '' : ''}</span>}
                                </div>
                            )}
                            <div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#00d4aa' }}>{card.b}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: 10, color: '#4a5a6a', marginTop: 4 }}>{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* ═══ EVALUATION 1: TASK SCENARIOS ═══ */}
            <SectionHeader
                title="1. Task Scenario Analysis"
                subtitle="Four identical steering goals executed in both conditions. Each step is timed using Keystroke-Level Model (KLM) estimates. Click a scenario to expand the step-by-step comparison."
            />

            {TASK_SCENARIOS.map((sc, i) => (
                <ScenarioCard key={sc.id} scenario={sc} index={i} />
            ))}

            {/* ═══ EVALUATION 2: HEURISTIC EVALUATION ═══ */}
            <SectionHeader
                title="2. Heuristic Evaluation"
                subtitle="11 heuristics from Nielsen's Usability Heuristics (7) and Amershi et al.'s Guidelines for Human-AI Interaction (4). Scored 1–5 per condition with justification."
            />

            {/* Heuristic summary row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                    { label: 'Overall', a: avgA, b: avgB },
                    { label: 'Nielsen (7)', a: nielsenAvgA, b: nielsenAvgB },
                    { label: 'Amershi HAI (4)', a: amershiAvgA, b: amershiAvgB },
                ].map((g) => (
                    <div key={g.label} style={{
                        flex: 1, padding: '12px 16px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: 12, color: '#7a8a9a' }}>{g.label}</span>
                        <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>
                            <span style={{ color: '#8899aa' }}>A: {g.a}</span>
                            <span style={{ color: '#00d4aa' }}>B: {g.b}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Heuristic detail table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                    <tr>
                        {['Heuristic', 'Source', 'A', 'B', 'Δ', 'Chat (A) Justification', 'Glass-Box (B) Justification'].map((h) => (
                            <th key={h} style={{
                                padding: '10px 8px', textAlign: 'left',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                color: '#5a6a7a', fontWeight: 600, fontSize: 10,
                                textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                            }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {HEURISTICS.map((h) => {
                        const delta = h.scoreB - h.scoreA
                        return (
                            <tr key={h.name}>
                                <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 500, color: '#c8d6e5', maxWidth: 160 }}>{h.name}</td>
                                <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#5a6a7a', whiteSpace: 'nowrap' }}>
                    <span style={{
                        padding: '2px 6px', borderRadius: 3, fontSize: 10,
                        background: h.source.startsWith('Amershi') ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.05)',
                        border: h.source.startsWith('Amershi') ? '1px solid rgba(0,212,170,0.15)' : '1px solid rgba(255,255,255,0.08)',
                    }}>{h.source}</span>
                                </td>
                                <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#8899aa', textAlign: 'center' }}>{h.scoreA}</td>
                                <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00d4aa', textAlign: 'center' }}>{h.scoreB}</td>
                                <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: delta > 0 ? '#00d4aa' : delta < 0 ? '#ff6b6b' : '#5a6a7a', textAlign: 'center' }}>
                                    {delta > 0 ? '+' : ''}{delta}
                                </td>
                                <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#6a7a8a', maxWidth: 200, fontSize: 11, lineHeight: 1.4 }}>{h.justA}</td>
                                <td style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#6a8a7a', maxWidth: 200, fontSize: 11, lineHeight: 1.4 }}>{h.justB}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>

            {/* ═══ EVALUATION 3: INTERACTION EFFICIENCY ═══ */}
            <SectionHeader
                title="3. Interaction Efficiency Benchmarks"
                subtitle="Quantitative comparison of actions, feedback signals, and design space coverage between conditions."
            />

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                    <tr>
                        {['Metric', 'Chat (A)', 'Glass-Box (B)', 'Analysis'].map((h) => (
                            <th key={h} style={{
                                padding: '10px 12px', textAlign: 'left',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                color: '#5a6a7a', fontWeight: 600, fontSize: 10,
                                textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {EFFICIENCY_METRICS.map((m) => (
                        <tr key={m.metric}>
                            <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 500, color: '#c8d6e5' }}>{m.metric}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', color: '#8899aa', fontWeight: 600 }}>{m.condA.value}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', color: '#00d4aa', fontWeight: 600 }}>{m.condB.value}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#6a7a8a', fontSize: 12, lineHeight: 1.4 }}>{m.explanation}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Export */}
            <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
                <button onClick={exportAll} style={{
                    padding: '12px 24px', borderRadius: 8,
                    border: '1px solid rgba(0,212,170,0.4)', background: 'rgba(0,212,170,0.08)',
                    color: '#00d4aa', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>↓ Export Full Evaluation (JSON)</button>
            </div>
        </div>
    )
}
