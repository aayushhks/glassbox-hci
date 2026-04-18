import { useState, useCallback } from 'react'
import { useExperiment } from '../../hooks/useExperiment'
import { GlassBox } from '../GlassBox'
import { ChatControl } from '../ChatControl'
import PostSurvey from './PostSurvey'

// ═══════════════════════════════════════════════════════════════════════════════
// STUDY RUNNER
//
// Runs a proper within-subjects A/B study:
//   1. Consent + Participant ID
//   2. Condition 1 (counterbalanced) → Task → Survey
//   3. Condition 2 (counterbalanced) → Task → Survey
//   4. Final comparison question + debrief
//
// Counterbalancing: odd participant IDs do A→B, even do B→A
// ═══════════════════════════════════════════════════════════════════════════════

const COMPLETION_CRITERIA = [
    'The AI has generated a leader election algorithm',
    'You have refined the output at least once (adjusted a slider OR sent a follow-up message)',
    'You are satisfied that the output covers: election mechanism, term logic, and partition handling',
    'You feel the output is clear enough for a peer to understand',
]

function ConsentScreen({ onConsent }) {
    const [pid, setPid] = useState('')
    const [agreed, setAgreed] = useState(false)

    return (
        <div style={{
            maxWidth: 580, margin: '0 auto', padding: '48px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', flex: 1, justifyContent: 'center',
        }}>
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5a6a7a',
                letterSpacing: '0.08em', marginBottom: 20,
            }}>STUDY SESSION</div>

            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em' }}>
                Welcome, Participant
            </h2>

            <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.7, marginBottom: 28 }}>
                This study compares two AI interfaces for the same task. You will use
                each interface once (about 3–5 minutes each) and answer a short survey after each.
                The entire session takes approximately <strong style={{ color: '#c8d6e5' }}>10–15 minutes</strong>.
            </p>

            {/* What happens */}
            <div style={{
                width: '100%', padding: '18px 22px', borderRadius: 10, textAlign: 'left',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 24,
            }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    What You'll Do
                </div>
                <div style={{ fontSize: 13, color: '#b0c0d0', lineHeight: 1.7 }}>
                    <strong style={{ color: '#e0e8f0' }}>Task:</strong> Use an AI to generate a leader election
                    algorithm for a distributed system, then refine it until you're satisfied.
                    You'll do this task <strong style={{ color: '#e0e8f0' }}>twice</strong> — once with
                    each interface. The order is randomized.
                </div>
            </div>

            {/* Participant ID */}
            <div style={{ width: '100%', marginBottom: 20, textAlign: 'left' }}>
                <label style={{ fontSize: 13, color: '#b0c0d0', display: 'block', marginBottom: 8 }}>
                    Participant ID (assigned by researcher)
                </label>
                <input
                    type="text"
                    value={pid}
                    onChange={(e) => setPid(e.target.value)}
                    placeholder="e.g., P01, P02..."
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                        color: '#e0e8f0', fontFamily: 'var(--font-mono)', fontSize: 14,
                        outline: 'none', boxSizing: 'border-box',
                    }}
                />
                <div style={{ fontSize: 11, color: '#4a5a6a', marginTop: 6 }}>
                    This determines your condition order (counterbalancing).
                </div>
            </div>

            {/* Consent checkbox */}
            <label style={{
                display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%',
                padding: '14px 16px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                background: agreed ? 'rgba(0,212,170,0.04)' : 'rgba(255,255,255,0.02)',
                border: agreed ? '1px solid rgba(0,212,170,0.15)' : '1px solid rgba(255,255,255,0.06)',
                marginBottom: 24, transition: 'all 0.2s ease',
            }}>
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ marginTop: 2, accentColor: '#00d4aa' }}
                />
                <span style={{ fontSize: 13, color: '#8899aa', lineHeight: 1.5 }}>
          I understand this is an HCI research study. My responses will be recorded anonymously
          and used for academic purposes only. I can stop at any time.
        </span>
            </label>

            <button
                onClick={() => onConsent(pid.trim())}
                disabled={!pid.trim() || !agreed}
                style={{
                    padding: '14px 40px', borderRadius: 10, width: '100%',
                    border: (pid.trim() && agreed) ? '1px solid rgba(0,212,170,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    background: (pid.trim() && agreed)
                        ? 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))'
                        : 'rgba(255,255,255,0.03)',
                    color: (pid.trim() && agreed) ? '#00d4aa' : '#3a4a5a',
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
                    cursor: (pid.trim() && agreed) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                }}
            >
                Begin Study →
            </button>
        </div>
    )
}

function TaskBriefing({ condition, conditionNumber, totalConditions, onStart }) {
    const isGlassBox = condition === 'B'

    return (
        <div style={{
            maxWidth: 560, margin: '0 auto', padding: '48px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', flex: 1, justifyContent: 'center',
        }}>
            <div style={{
                padding: '6px 14px', borderRadius: 20, marginBottom: 20,
                background: isGlassBox ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.06)',
                border: isGlassBox ? '1px solid rgba(0,212,170,0.25)' : '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                color: isGlassBox ? '#00d4aa' : '#8899aa',
            }}>
                Interface {conditionNumber} of {totalConditions}
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                {isGlassBox ? 'Glass-Box Interface' : 'Standard Chat Interface'}
            </h2>

            <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.7, marginBottom: 24 }}>
                {isGlassBox
                    ? 'This interface has parameter sliders and stability indicators. You can drag sliders to reshape the AI output in real-time. Colored highlights show how consistent each section is.'
                    : 'This is a standard AI chat. Type messages to generate and refine the output. Use follow-up messages to adjust the response.'}
            </p>

            {/* Completion criteria */}
            <div style={{
                width: '100%', padding: '18px 22px', borderRadius: 10, textAlign: 'left',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 24,
            }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    You're done when:
                </div>
                {COMPLETION_CRITERIA.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: '#b0c0d0', lineHeight: 1.5 }}>
                        <span style={{ color: '#00d4aa', flexShrink: 0 }}>✓</span>
                        <span>{c}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onStart}
                style={{
                    padding: '14px 36px', borderRadius: 10, width: '100%',
                    border: '1px solid rgba(0,212,170,0.4)',
                    background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))',
                    color: '#00d4aa', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                }}
            >
                Start Task →
            </button>
        </div>
    )
}

function BreakScreen({ onContinue }) {
    return (
        <div style={{
            maxWidth: 480, margin: '0 auto', padding: '60px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', flex: 1, justifyContent: 'center',
        }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>☕</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Quick Break</h2>
            <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.7, marginBottom: 28 }}>
                Great job! You've completed the first interface. Take a moment, then you'll try
                the same task with a <strong style={{ color: '#c8d6e5' }}>different interface</strong>.
            </p>
            <button onClick={onContinue} style={{
                padding: '14px 36px', borderRadius: 10,
                border: '1px solid rgba(0,212,170,0.4)',
                background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))',
                color: '#00d4aa', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
                cursor: 'pointer',
            }}>Continue to Interface 2 →</button>
        </div>
    )
}

function FinalComparison({ onSubmit }) {
    const [preference, setPreference] = useState(null)
    const [reason, setReason] = useState('')

    return (
        <div style={{
            maxWidth: 560, margin: '0 auto', padding: '48px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', flex: 1, justifyContent: 'center',
        }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏁</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Final Question</h2>
            <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.7, marginBottom: 28 }}>
                You've now tried both interfaces for the same task.
            </p>

            <div style={{ fontSize: 15, color: '#c8d6e5', fontWeight: 500, marginBottom: 16 }}>
                Which interface did you prefer overall?
            </div>

            <div style={{ display: 'flex', gap: 12, width: '100%', marginBottom: 24 }}>
                {[
                    { value: 'A', label: 'Standard Chat', color: '#8899aa' },
                    { value: 'equal', label: 'No Preference', color: '#7a8a9a' },
                    { value: 'B', label: 'Glass-Box', color: '#00d4aa' },
                ].map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setPreference(opt.value)}
                        style={{
                            flex: 1, padding: '14px 12px', borderRadius: 10,
                            border: preference === opt.value
                                ? `1px solid ${opt.color}` : '1px solid rgba(255,255,255,0.06)',
                            background: preference === opt.value
                                ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                            color: preference === opt.value ? opt.color : '#5a6a7a',
                            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                    >{opt.label}</button>
                ))}
            </div>

            <div style={{ width: '100%', textAlign: 'left', marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#b0c0d0', display: 'block', marginBottom: 8 }}>
                    Why? (1–2 sentences)
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    style={{
                        width: '100%', padding: '12px 14px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                        color: '#e0e8f0', fontFamily: 'var(--font-sans)', fontSize: 14,
                        resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    }}
                />
            </div>

            <button
                onClick={() => onSubmit({ preference, reason })}
                disabled={!preference}
                style={{
                    padding: '14px 36px', borderRadius: 10, width: '100%',
                    border: preference ? '1px solid rgba(0,212,170,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    background: preference
                        ? 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))'
                        : 'rgba(255,255,255,0.03)',
                    color: preference ? '#00d4aa' : '#3a4a5a',
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
                    cursor: preference ? 'pointer' : 'not-allowed',
                }}
            >Submit & Finish Study</button>
        </div>
    )
}

function DebriefScreen({ data }) {
    return (
        <div style={{
            maxWidth: 520, margin: '0 auto', padding: '60px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', flex: 1, justifyContent: 'center',
        }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Thank You!</h2>
            <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.7, marginBottom: 28 }}>
                Your session is complete. This study is investigating whether
                direct-manipulation interfaces with visual transparency indicators
                improve user trust, control, and efficiency when working with AI systems.
            </p>
            <div style={{
                padding: '14px 18px', borderRadius: 8, width: '100%',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'var(--font-mono)', fontSize: 12, color: '#5a6a7a', textAlign: 'left',
            }}>
                Session ID: {data.participantId} — Recorded at {new Date().toLocaleString()}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STUDY RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

export default function StudyRunner() {
    // Phases: consent → brief1 → task1 → survey1 → break → brief2 → task2 → survey2 → comparison → debrief
    const [phase, setPhase] = useState('consent')
    const [participantId, setParticipantId] = useState('')
    const [conditionOrder, setConditionOrder] = useState([])
    const [currentCondIndex, setCurrentCondIndex] = useState(0)
    const [allData, setAllData] = useState({ sessions: [], surveys: [] })

    const experiment = useExperiment('study')

    // Determine condition order from participant ID
    const handleConsent = (pid) => {
        setParticipantId(pid)
        // Extract number from PID for counterbalancing
        const num = parseInt(pid.replace(/\D/g, '')) || 0
        const order = num % 2 === 0 ? ['B', 'A'] : ['A', 'B']
        setConditionOrder(order)
        setCurrentCondIndex(0)
        setPhase('brief1')
    }

    const currentCondition = conditionOrder[currentCondIndex]
    const CurrentInterface = currentCondition === 'B' ? GlassBox : ChatControl

    const handleStartTask = () => {
        experiment.startSession()
        setPhase(currentCondIndex === 0 ? 'task1' : 'task2')
    }

    const handleFinishTask = () => {
        const sessionData = experiment.endSession()
        setAllData((prev) => ({
            ...prev,
            sessions: [...prev.sessions, { condition: currentCondition, ...sessionData }],
        }))
        setPhase(currentCondIndex === 0 ? 'survey1' : 'survey2')
    }

    const handleInteraction = useCallback((type, detail) => {
        experiment.logInteraction(type, detail)
    }, [experiment])

    const handleSurveySubmit = (surveyData) => {
        setAllData((prev) => ({
            ...prev,
            surveys: [...prev.surveys, { condition: currentCondition, ...surveyData }],
        }))
        if (currentCondIndex === 0) {
            setPhase('break')
        } else {
            setPhase('comparison')
        }
    }

    const handleBreakContinue = () => {
        setCurrentCondIndex(1)
        setPhase('brief2')
    }

    const handleFinalSubmit = (comparisonData) => {
        const fullStudyData = {
            participantId,
            conditionOrder,
            ...allData,
            comparison: comparisonData,
            completedAt: new Date().toISOString(),
        }
        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('glassbox-study-data') || '[]')
        existing.push(fullStudyData)
        localStorage.setItem('glassbox-study-data', JSON.stringify(existing))

        // Also save individual condition results for the Results dashboard
        allData.surveys.forEach((survey) => {
            const session = allData.sessions.find((s) => s.condition === survey.condition)
            const entry = {
                ...survey,
                session,
                participantId,
            }
            const results = JSON.parse(localStorage.getItem('glassbox-results') || '[]')
            results.push(entry)
            localStorage.setItem('glassbox-results', JSON.stringify(results))
        })

        setAllData((prev) => ({ ...prev, comparison: comparisonData }))
        setPhase('debrief')
    }

    // Timer bar during tasks
    const taskBar = (phase === 'task1' || phase === 'task2') ? (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 24px',
            background: 'rgba(0,212,170,0.04)', borderBottom: '1px solid rgba(0,212,170,0.1)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#00d4aa',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 12, color: '#00d4aa', fontWeight: 500 }}>
          {participantId} — Interface {currentCondIndex + 1}/2
          ({currentCondition === 'B' ? 'Glass-Box' : 'Chat'})
        </span>
            </div>
            <button onClick={handleFinishTask} style={{
                padding: '6px 16px', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)',
                color: '#c8d6e5', fontFamily: 'var(--font-sans)', fontSize: 12,
                fontWeight: 500, cursor: 'pointer',
            }}>✓ Task Complete</button>
        </div>
    ) : null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {taskBar}

            {phase === 'consent' && <ConsentScreen onConsent={handleConsent} />}

            {(phase === 'brief1' || phase === 'brief2') && (
                <TaskBriefing
                    condition={currentCondition}
                    conditionNumber={currentCondIndex + 1}
                    totalConditions={2}
                    onStart={handleStartTask}
                />
            )}

            {(phase === 'task1' || phase === 'task2') && (
                <CurrentInterface onInteraction={handleInteraction} />
            )}

            {(phase === 'survey1' || phase === 'survey2') && (
                <PostSurvey
                    condition={currentCondition}
                    sessionData={allData.sessions[allData.sessions.length - 1]}
                    onSubmit={handleSurveySubmit}
                />
            )}

            {phase === 'break' && <BreakScreen onContinue={handleBreakContinue} />}
            {phase === 'comparison' && <FinalComparison onSubmit={handleFinalSubmit} />}
            {phase === 'debrief' && <DebriefScreen data={{ participantId }} />}
        </div>
    )
}
