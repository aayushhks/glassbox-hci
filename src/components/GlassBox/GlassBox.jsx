import { useState, useEffect, useCallback } from 'react'
import { TASK_PROMPT, generateSegments } from '../../data/responses'
import { getStabilityStyle } from '../../utils/confidence'
import ParameterSlider from './ParameterSlider'
import StabilitySegment from './StabilitySegment'

export default function GlassBox({ onInteraction }) {
    const [params, setParams] = useState({
        efficiency: 50,
        readability: 70,
        detail: 60,
        creativity: 40,
    })
    const [hoveredSegment, setHoveredSegment] = useState(null)
    const [showTransparency, setShowTransparency] = useState(true)
    const [isGenerated, setIsGenerated] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [visibleSegments, setVisibleSegments] = useState(0)

    const segments = generateSegments(params)

    const handleGenerate = useCallback(() => {
        setIsGenerating(true)
        setIsGenerated(false)
        setVisibleSegments(0)
        onInteraction?.('generate', { params })
        setTimeout(() => {
            setIsGenerated(true)
            setIsGenerating(false)
        }, 800)
    }, [params, onInteraction])

    // Staggered reveal
    useEffect(() => {
        if (isGenerated && visibleSegments < segments.length) {
            const timer = setTimeout(() => setVisibleSegments((v) => v + 1), 200)
            return () => clearTimeout(timer)
        }
    }, [isGenerated, visibleSegments, segments.length])

    const updateParam = (key) => (val) => {
        setParams((p) => ({ ...p, [key]: val }))
        onInteraction?.('slider_change', { param: key, value: val })
    }

    // Stability distribution summary
    const stabDist = segments.reduce((acc, s) => {
        const c = getStabilityStyle(s.stability)
        acc[c.label] = (acc[c.label] || 0) + 1
        return acc
    }, {})

    const hoveredInfluence = hoveredSegment
        ? segments.find((s) => s.id === hoveredSegment)?.influence
        : null

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: 0,
                flex: 1,
                overflow: 'hidden',
            }}
        >
            {/* ═══ Left: Output Panel ═══ */}
            <div
                style={{
                    padding: '28px 32px',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    overflowY: 'auto',
                }}
            >
                {/* Task prompt card */}
                <div
                    style={{
                        padding: '18px 22px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        marginBottom: 24,
                    }}
                >
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#5a6a7a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 8,
                        }}
                    >
                        Task Prompt
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: '#b0c0d0' }}>
                        {TASK_PROMPT}
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        style={{
                            marginTop: 14,
                            padding: '10px 24px',
                            borderRadius: 8,
                            border: '1px solid rgba(0,212,170,0.4)',
                            background: isGenerating
                                ? 'rgba(0,212,170,0.05)'
                                : 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))',
                            color: '#00d4aa',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: isGenerating ? 'wait' : 'pointer',
                            letterSpacing: '0.02em',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {isGenerating ? 'Generating...' : isGenerated ? '⟲ Regenerate' : '▶ Generate Response'}
                    </button>
                </div>

                {/* Generating animation */}
                {isGenerating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: '#00d4aa',
                                        animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                                    }}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: 13, color: '#5a6a7a' }}>
              Applying prompt presets and generating response...
            </span>
                    </div>
                )}

                {/* Generated response */}
                {isGenerated && (
                    <div>
                        {/* Stability distribution bar */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                marginBottom: 20,
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                flexWrap: 'wrap',
                            }}
                        >
              <span
                  style={{
                      fontSize: 11,
                      color: '#5a6a7a',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                  }}
              >
                Generation Stability
              </span>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {[
                                    { label: 'High', color: '#00d4aa' },
                                    { label: 'Medium', color: '#f0b429' },
                                    { label: 'Low', color: '#ff6b6b' },
                                ].map((l) => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div
                                            style={{ width: 8, height: 8, borderRadius: 2, background: l.color }}
                                        />
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 11,
                                                color: l.color,
                                            }}
                                        >
                      {stabDist[l.label] || 0}
                    </span>
                                    </div>
                                ))}
                            </div>
                            <span style={{ fontSize: 11, color: '#4a5a6a', marginLeft: 'auto' }}>
                Hover for transparency details
              </span>
                        </div>

                        {/* Segments */}
                        {segments.map((seg, i) => (
                            <div
                                key={seg.id}
                                style={{
                                    opacity: i < visibleSegments ? 1 : 0,
                                    transform: i < visibleSegments ? 'translateY(0)' : 'translateY(12px)',
                                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                                }}
                            >
                                <StabilitySegment
                                    segment={seg}
                                    isHovered={hoveredSegment === seg.id}
                                    onHover={() => {
                                        setHoveredSegment(seg.id)
                                        onInteraction?.('hover_segment', { segmentId: seg.id })
                                    }}
                                    onLeave={() => setHoveredSegment(null)}
                                    showTransparency={showTransparency}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isGenerated && !isGenerating && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '80px 40px',
                            color: '#3a4a5a',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◈</div>
                        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: '#5a6a7a' }}>
                            Configure prompt presets, then generate
                        </div>
                        <div style={{ fontSize: 13, maxWidth: 380, lineHeight: 1.6 }}>
                            Adjust the sliders to set prompt presets, then click Generate to see the AI
                            response with real-time stability indicators and transparency overlays.
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ Right: Control Panel ═══ */}
            <div
                style={{
                    padding: '28px 22px',
                    background: 'rgba(255,255,255,0.01)',
                    overflowY: 'auto',
                }}
            >
                {/* Transparency toggle */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
          <span
              style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#5a6a7a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
              }}
          >
            Prompt Presets
          </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <span style={{ fontSize: 10, color: '#5a6a7a' }}>X-Ray</span>
                        <div
                            onClick={() => setShowTransparency(!showTransparency)}
                            style={{
                                width: 32,
                                height: 18,
                                borderRadius: 9,
                                position: 'relative',
                                background: showTransparency
                                    ? 'rgba(0,212,170,0.3)'
                                    : 'rgba(255,255,255,0.08)',
                                border: showTransparency
                                    ? '1px solid rgba(0,212,170,0.5)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div
                                style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    background: showTransparency ? '#00d4aa' : '#5a6a7a',
                                    position: 'absolute',
                                    top: 1,
                                    left: showTransparency ? 15 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            />
                        </div>
                    </label>
                </div>

                {/* Sliders with axis labels */}
                <ParameterSlider
                    label="Efficiency"
                    value={params.efficiency}
                    onChange={updateParam('efficiency')}
                    description="Maps to prompt instructions for code density and verbosity"
                    lowLabel="Verbose / documented"
                    highLabel="Compact / minimal"
                    isHighlighted={hoveredInfluence?.efficiency > 0.6}
                />
                <ParameterSlider
                    label="Readability"
                    value={params.readability}
                    onChange={updateParam('readability')}
                    description="Maps to prompt instructions for language formality and structure"
                    lowLabel="Technical notation"
                    highLabel="Plain English"
                    isHighlighted={hoveredInfluence?.readability > 0.6}
                />
                <ParameterSlider
                    label="Detail Level"
                    value={params.detail}
                    onChange={updateParam('detail')}
                    description="Maps to prompt instructions for depth, edge cases, and examples"
                    lowLabel="Core concepts only"
                    highLabel="Exhaustive coverage"
                    isHighlighted={hoveredInfluence?.detail > 0.6}
                />
                <ParameterSlider
                    label="Creativity"
                    value={params.creativity}
                    onChange={updateParam('creativity')}
                    description="Maps to temperature + prompt instructions for novelty (lowers stability)"
                    lowLabel="Standard approaches"
                    highLabel="Novel / experimental"
                    isHighlighted={hoveredInfluence?.creativity > 0.6}
                />

                {/* Interaction hint */}
                {isGenerated && (
                    <div
                        style={{
                            marginTop: 8,
                            padding: '14px 16px',
                            borderRadius: 10,
                            background: 'rgba(0,212,170,0.04)',
                            border: '1px solid rgba(0,212,170,0.1)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                color: '#00d4aa',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 6,
                            }}
                        >
                            💡 Try It
                        </div>
                        <div style={{ fontSize: 12, color: '#7a9a8a', lineHeight: 1.5 }}>
                            Drag sliders to reshape the response live. Crank{' '}
                            <strong>Creativity</strong> past 65% — a novel optimization section appears, but
                            notice its stability drops (red). The interface is showing you the tradeoff.
                        </div>
                    </div>
                )}

                {/* Stability legend */}
                <div style={{ marginTop: 24 }}>
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#5a6a7a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 14,
                        }}
                    >
                        Stability Scale
                    </div>
                    {[
                        {
                            range: '85–99%',
                            color: '#00d4aa',
                            label: 'High — Consistent across regenerations',
                        },
                        {
                            range: '65–84%',
                            color: '#f0b429',
                            label: 'Medium — Varies with parameter changes',
                        },
                        {
                            range: '15–64%',
                            color: '#ff6b6b',
                            label: 'Low — Novel content, high variance',
                        },
                    ].map((item) => (
                        <div
                            key={item.range}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 3,
                                    marginTop: 2,
                                    flexShrink: 0,
                                    background: item.color,
                                    opacity: 0.7,
                                }}
                            />
                            <div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 12,
                                        color: item.color,
                                        fontWeight: 600,
                                    }}
                                >
                                    {item.range}
                                </div>
                                <div style={{ fontSize: 11, color: '#5a6a7a', lineHeight: 1.4 }}>
                                    {item.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
