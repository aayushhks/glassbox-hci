import { useState, useCallback } from 'react'
import { useExperiment } from '../../hooks/useExperiment'
import TaskInstructions from './TaskInstructions'
import PostSurvey from './PostSurvey'

/**
 * Wraps any interface (GlassBox or ChatControl) in the experiment flow:
 *   1. Task Instructions
 *   2. Active Task (timed)
 *   3. Post-Task Survey
 *
 * Props:
 *   - condition: 'A' | 'B'
 *   - InterfaceComponent: the React component to render during the task
 *   - onComplete: callback with full experiment data (session + survey)
 */
export default function ExperimentWrapper({ condition, InterfaceComponent, onComplete }) {
  const [phase, setPhase] = useState('instructions') // instructions | task | survey
  const [sessionData, setSessionData] = useState(null)
  const experiment = useExperiment(`condition-${condition}`)

  const handleStart = () => {
    experiment.startSession()
    setPhase('task')
  }

  const handleFinishTask = () => {
    const data = experiment.endSession()
    setSessionData(data)
    setPhase('survey')
  }

  const handleInteraction = useCallback(
    (type, detail) => {
      experiment.logInteraction(type, detail)
    },
    [experiment]
  )

  const handleSurveySubmit = (surveyData) => {
    const fullData = { ...surveyData, session: sessionData }
    onComplete?.(fullData)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Timer bar (visible during task) */}
      {phase === 'task' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 24px',
            background: 'rgba(0,212,170,0.04)',
            borderBottom: '1px solid rgba(0,212,170,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#00d4aa',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 12, color: '#00d4aa', fontWeight: 500 }}>
              Session Active — Condition {condition}
            </span>
          </div>
          <button
            onClick={handleFinishTask}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#c8d6e5',
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            ✓ I'm Done
          </button>
        </div>
      )}

      {/* Phase content */}
      {phase === 'instructions' && (
        <TaskInstructions condition={condition} onStart={handleStart} />
      )}

      {phase === 'task' && <InterfaceComponent onInteraction={handleInteraction} />}

      {phase === 'survey' && (
        <PostSurvey
          condition={condition}
          sessionData={sessionData}
          onSubmit={handleSurveySubmit}
        />
      )}
    </div>
  )
}
