/**
 * Each slider represents a PROMPT PRESET DIMENSION — a continuous axis that
 * maps to different system prompt configurations. This is analogous to how
 * ChatGPT's "tone" or Claude's "style" settings work, but exposed as a
 * continuous visual control rather than discrete dropdowns.
 */

export default function ParameterSlider({
                                            label,
                                            value,
                                            onChange,
                                            description,
                                            lowLabel,
                                            highLabel,
                                            isHighlighted = false,
                                        }) {
    return (
        <div
            style={{
                marginBottom: 18,
                padding: '14px 16px',
                borderRadius: 10,
                background: isHighlighted ? 'rgba(0, 212, 170, 0.06)' : 'rgba(255,255,255,0.02)',
                border: isHighlighted
                    ? '1px solid rgba(0, 212, 170, 0.25)'
                    : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span
            style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#c8d6e5',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
            }}
        >
          {label}
        </span>
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#00d4aa',
                    }}
                >
          {value}%
        </span>
            </div>

            <input
                type="range"
                min="5"
                max="95"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                style={{
                    width: '100%',
                    background: `linear-gradient(to right, #00d4aa ${value}%, rgba(255,255,255,0.08) ${value}%)`,
                }}
            />

            {/* Axis labels showing what low/high maps to */}
            {lowLabel && highLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: '#4a5a6a' }}>{lowLabel}</span>
                    <span style={{ fontSize: 10, color: '#4a5a6a' }}>{highLabel}</span>
                </div>
            )}

            <div
                style={{
                    fontSize: 11,
                    color: '#5a6a7a',
                    marginTop: 6,
                    lineHeight: 1.4,
                }}
            >
                {description}
            </div>
        </div>
    )
}
