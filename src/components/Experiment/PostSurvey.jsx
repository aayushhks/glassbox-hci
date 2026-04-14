import { useState } from 'react'

const LIKERT_QUESTIONS = [
  { id: 'trust', text: 'I trusted the AI\'s output.' },
  { id: 'control', text: 'I felt in control of the AI\'s behavior.' },
  { id: 'understanding', text: 'I understood why the AI generated its response.' },
  { id: 'satisfaction', text: 'I am satisfied with the final output quality.' },
  { id: 'efficiency', text: 'I was able to reach my desired output quickly.' },
  { id: 'willingness', text: 'I would use this interface again for similar tasks.' },
]

const LIKERT_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

function LikertRow({ question, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, color: '#c8d6e5', marginBottom: 10, lineHeight: 1.5 }}>
        {question.text}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {LIKERT_LABELS.map((label, i) => {
          const score = i + 1
          const isSelected = value === score
          return (
            <button
              key={score}
              onClick={() => onChange(score)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 6,
                border: isSelected
                  ? '1px solid rgba(0,212,170,0.5)'
                  : '1px solid rgba(255,255,255,0.06)',
                background: isSelected ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.02)',
                color: isSelected ? '#00d4aa' : '#5a6a7a',
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function PostSurvey({ condition, sessionData, onSubmit }) {
  const [responses, setResponses] = useState({})
  const [openFeedback, setOpenFeedback] = useState('')
  const [mostUseful, setMostUseful] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = LIKERT_QUESTIONS.every((q) => responses[q.id])

  const handleSubmit = () => {
    const surveyData = {
      condition,
      sessionData,
      likert: responses,
      openFeedback,
      mostUseful,
      submittedAt: new Date().toISOString(),
    }
    setSubmitted(true)
    onSubmit?.(surveyData)
  }

  if (submitted) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#00d4aa', marginBottom: 8 }}>
          Survey Submitted
        </div>
        <div style={{ fontSize: 14, color: '#7a8a9a' }}>
          Thank you! Your responses for Condition {condition} have been recorded.
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '40px 32px',
        overflowY: 'auto',
        flex: 1,
      }}
    >
      <div
        style={{
          padding: '6px 14px',
          borderRadius: 20,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: '#7a8a9a',
          display: 'inline-block',
          marginBottom: 20,
        }}
      >
        Condition {condition} — Post-Task Survey
      </div>

      {/* Session stats */}
      {sessionData && (
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginBottom: 28,
            padding: '14px 18px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Duration
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: '#c8d6e5' }}>
              {Math.round((sessionData.durationMs || 0) / 1000)}s
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Interactions
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: '#c8d6e5' }}>
              {sessionData.totalInteractions || 0}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
        Rate your experience
      </h3>

      {LIKERT_QUESTIONS.map((q) => (
        <LikertRow
          key={q.id}
          question={q}
          value={responses[q.id]}
          onChange={(val) => setResponses((prev) => ({ ...prev, [q.id]: val }))}
        />
      ))}

      {/* Open-ended questions */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Open feedback</h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: '#b0c0d0', display: 'block', marginBottom: 8 }}>
            What aspect of this interface was most useful (or most frustrating)?
          </label>
          <textarea
            value={mostUseful}
            onChange={(e) => setMostUseful(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: '#e0e8f0',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: '#b0c0d0', display: 'block', marginBottom: 8 }}>
            Any other thoughts or feedback?
          </label>
          <textarea
            value={openFeedback}
            onChange={(e) => setOpenFeedback(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: '#e0e8f0',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 10,
          border: allAnswered
            ? '1px solid rgba(0,212,170,0.4)'
            : '1px solid rgba(255,255,255,0.06)',
          background: allAnswered
            ? 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))'
            : 'rgba(255,255,255,0.03)',
          color: allAnswered ? '#00d4aa' : '#3a4a5a',
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          fontWeight: 600,
          cursor: allAnswered ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          marginTop: 8,
        }}
      >
        {allAnswered ? 'Submit Survey' : `Answer all ${LIKERT_QUESTIONS.length} questions to continue`}
      </button>
    </div>
  )
}
