import { getStabilityStyle, getCategoryIcon } from '../../utils/confidence'

export default function StabilitySegment({
                                             segment,
                                             isHovered,
                                             onHover,
                                             onLeave,
                                             showTransparency,
                                         }) {
    const colors = getStabilityStyle(segment.stability)

    return (
        <div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{
                position: 'relative',
                padding: '16px 20px',
                marginBottom: 10,
                borderRadius: 10,
                background: isHovered ? colors.bg.replace(/[\d.]+\)$/, '0.22)') : colors.bg,
                borderLeft: `3px solid ${colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateX(4px)' : 'none',
            }}
        >
            {/* Segment header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>
            {getCategoryIcon(segment.category)}
          </span>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: colors.text,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}
                    >
            {segment.label}
          </span>
                </div>

                {/* Stability bar + score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
              style={{
                  fontSize: 10,
                  color: '#5a6a7a',
                  letterSpacing: '0.03em',
              }}
          >
            stability
          </span>
                    <div
                        style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            background: 'rgba(255,255,255,0.06)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                width: `${segment.stability * 100}%`,
                                height: '100%',
                                background: colors.text,
                                borderRadius: 2,
                                transition: 'width 0.5s ease',
                            }}
                        />
                    </div>
                    <span
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: colors.text,
                            fontWeight: 600,
                        }}
                    >
            {(segment.stability * 100).toFixed(0)}%
          </span>
                </div>
            </div>

            {/* Segment text content */}
            <div
                style={{
                    fontFamily:
                        segment.category === 'code' ? 'var(--font-mono)' : 'var(--font-sans)',
                    fontSize: segment.category === 'code' ? 12.5 : 14,
                    lineHeight: segment.category === 'code' ? 1.7 : 1.65,
                    color: '#d0dce8',
                    whiteSpace: segment.category === 'code' ? 'pre-wrap' : 'normal',
                    background: segment.category === 'code' ? 'rgba(0,0,0,0.25)' : 'none',
                    padding: segment.category === 'code' ? '12px 14px' : 0,
                    borderRadius: segment.category === 'code' ? 6 : 0,
                }}
            >
                {segment.text}
            </div>

            {/* Transparency overlay — shows parameter influence on hover */}
            {isHovered && showTransparency && (
                <div
                    style={{
                        marginTop: 12,
                        padding: '10px 14px',
                        background: 'rgba(0,0,0,0.35)',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            color: '#8899aa',
                            marginBottom: 4,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        Prompt Preset Influence
                    </div>
                    <div
                        style={{
                            fontSize: 10,
                            color: '#4a5a6a',
                            marginBottom: 10,
                            lineHeight: 1.4,
                        }}
                    >
                        How much each slider's underlying prompt template affects this segment
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {Object.entries(segment.influence).map(([param, weight]) => (
                            <div key={param} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                    style={{
                        fontSize: 11,
                        color: '#7a8a9a',
                        textTransform: 'capitalize',
                        minWidth: 60,
                    }}
                >
                  {param}
                </span>
                                <div
                                    style={{
                                        width: 48,
                                        height: 4,
                                        borderRadius: 2,
                                        background: 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${weight * 100}%`,
                                            height: '100%',
                                            background:
                                                weight > 0.7 ? '#00d4aa' : weight > 0.4 ? '#f0b429' : '#5a6a7a',
                                            borderRadius: 2,
                                        }}
                                    />
                                </div>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 10,
                                        color: '#5a6a7a',
                                    }}
                                >
                  {(weight * 100).toFixed(0)}%
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
