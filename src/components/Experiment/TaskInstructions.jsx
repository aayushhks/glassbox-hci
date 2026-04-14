export default function TaskInstructions({ condition, onStart }) {
  const isGlassBox = condition === 'B'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        maxWidth: 560,
        margin: '0 auto',
        textAlign: 'center',
        flex: 1,
      }}
    >
      {/* Condition badge */}
      <div
        style={{
          padding: '6px 14px',
          borderRadius: 20,
          background: isGlassBox ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.06)',
          border: isGlassBox
            ? '1px solid rgba(0,212,170,0.25)'
            : '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 600,
          color: isGlassBox ? '#00d4aa' : '#8899aa',
          marginBottom: 24,
        }}
      >
        Condition {condition}: {isGlassBox ? 'Glass-Box Interface' : 'Standard Chat'}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em' }}>
        Task Instructions
      </h2>

      <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.7, marginBottom: 28 }}>
        You will be asked to <strong style={{ color: '#c8d6e5' }}>generate and refine</strong> a
        distributed systems algorithm using an AI interface.{' '}
        {isGlassBox ? (
          <>
            This interface provides <strong style={{ color: '#00d4aa' }}>visual confidence
            highlights</strong> and <strong style={{ color: '#00d4aa' }}>parameter sliders</strong>{' '}
            to steer the AI output directly.
          </>
        ) : (
          <>
            This is a <strong style={{ color: '#c8d6e5' }}>standard chat interface</strong>. You
            will use text prompts to communicate with the AI and refine its response.
          </>
        )}
      </p>

      <div
        style={{
          width: '100%',
          padding: '18px 22px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'left',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#5a6a7a',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 10,
          }}
        >
          Your Goal
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: '#b0c0d0' }}>
          Generate a leader election algorithm for a 5-node distributed system. Then,{' '}
          <strong style={{ color: '#e0e8f0' }}>refine the output</strong> until you are satisfied
          with both its <em>correctness</em> and <em>clarity</em>. You may iterate as many times
          as you like.
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: '#5a6a7a',
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        Your session will be timed. A survey will follow after you complete the task.
      </div>

      <button
        onClick={onStart}
        style={{
          padding: '14px 36px',
          borderRadius: 10,
          border: '1px solid rgba(0,212,170,0.4)',
          background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))',
          color: '#00d4aa',
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          letterSpacing: '0.02em',
        }}
      >
        Begin Task →
      </button>
    </div>
  )
}
