import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate()

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '60px 32px',
                textAlign: 'center',
                position: 'relative',
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: 'absolute',
                    top: '10%',
                    right: '15%',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,212,170,0.03) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#5a6a7a',
                    letterSpacing: '0.1em',
                    marginBottom: 20,
                }}
            >
                HCI RESEARCH — SYSTEM CONTRIBUTION
            </div>

            <h1
                style={{
                    fontSize: 42,
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    marginBottom: 16,
                    lineHeight: 1.15,
                }}
            >
                The{' '}
                <span
                    style={{
                        background: 'linear-gradient(135deg, #00d4aa, #00a885)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
          Glass-Box
        </span>{' '}
                AI Interface
            </h1>

            <p
                style={{
                    fontSize: 16,
                    color: '#8899aa',
                    maxWidth: 560,
                    lineHeight: 1.7,
                    marginBottom: 40,
                }}
            >
                A direct-manipulation interface that replaces prompt engineering with visual controls.
                Users steer AI output through continuous prompt preset sliders and see generation
                stability indicators — making the AI's behavior visible and adjustable.
            </p>

            {/* Condition cards */}
            <div style={{ display: 'flex', gap: 20, maxWidth: 700, width: '100%' }}>
                {/* Condition A */}
                <div
                    onClick={() => navigate('/condition-a')}
                    style={{
                        flex: 1,
                        padding: '28px 24px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    <div
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: '#5a6a7a',
                            letterSpacing: '0.06em',
                            marginBottom: 12,
                        }}
                    >
                        CONDITION A — BASELINE
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Standard Chat</div>
                    <p style={{ fontSize: 13, color: '#7a8a9a', lineHeight: 1.6, marginBottom: 16 }}>
                        Traditional text-in, text-out AI interface. Users refine output through natural
                        language prompts — the standard chatbot experience.
                    </p>
                    <div style={{ fontSize: 13, color: '#8899aa', fontWeight: 500 }}>
                        Start Condition A →
                    </div>
                </div>

                {/* Condition B */}
                <div
                    onClick={() => navigate('/condition-b')}
                    style={{
                        flex: 1,
                        padding: '28px 24px',
                        borderRadius: 14,
                        background: 'rgba(0,212,170,0.04)',
                        border: '1px solid rgba(0,212,170,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,212,170,0.07)'
                        e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,212,170,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(0,212,170,0.15)'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    <div
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: '#00d4aa',
                            letterSpacing: '0.06em',
                            marginBottom: 12,
                        }}
                    >
                        CONDITION B — GLASS-BOX
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                        Glass-Box <span style={{ color: '#00d4aa' }}>AI</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#7a9a8a', lineHeight: 1.6, marginBottom: 16 }}>
                        Direct-manipulation interface with prompt preset sliders, generation stability
                        indicators, and per-segment transparency overlays.
                    </p>
                    <div style={{ fontSize: 13, color: '#00d4aa', fontWeight: 500 }}>
                        Start Condition B →
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
                <button
                    onClick={() => navigate('/results')}
                    style={{
                        padding: '8px 18px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'transparent',
                        color: '#5a6a7a',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
                        cursor: 'pointer',
                    }}
                >
                    View Results →
                </button>
            </div>
        </div>
    )
}
