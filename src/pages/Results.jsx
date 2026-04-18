import { useState, useEffect, useMemo } from 'react'

function ComparisonBar({ label, valueA, valueB, maxVal = 5 }) {
    const pctA = (valueA / maxVal) * 100
    const pctB = (valueB / maxVal) * 100
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#c8d6e5', fontWeight: 500 }}>{label}</span>
                <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span style={{ color: '#8899aa' }}>A: {valueA.toFixed(1)}</span>
                    <span style={{ color: '#00d4aa' }}>B: {valueB.toFixed(1)}</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ width: `${pctA}%`, height: '100%', borderRadius: 4, background: '#8899aa', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ width: `${pctB}%`, height: '100%', borderRadius: 4, background: '#00d4aa', transition: 'width 0.6s ease' }} />
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, valueA, valueB, unit = '', higherIsBetter = true }) {
    const diff = valueB - valueA
    const better = higherIsBetter ? diff > 0 : diff < 0
    return (
        <div style={{
            padding: '16px 18px', borderRadius: 10, flex: 1, minWidth: 140,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
            <div style={{ fontSize: 10, color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                {label}
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 10, color: '#5a6a7a' }}>Chat (A)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: '#8899aa' }}>
                        {typeof valueA === 'number' ? valueA.toFixed(1) : valueA}{unit}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 10, color: '#5a6a7a' }}>Glass-Box (B)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: '#00d4aa' }}>
                        {typeof valueB === 'number' ? valueB.toFixed(1) : valueB}{unit}
                    </div>
                </div>
            </div>
            {Math.abs(diff) > 0.01 && (
                <div style={{ fontSize: 11, fontWeight: 600, color: better ? '#00d4aa' : '#ff6b6b' }}>
                    {better ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}{unit} {higherIsBetter ? (better ? 'higher' : 'lower') : (better ? 'faster' : 'slower')}
                </div>
            )}
        </div>
    )
}

export default function Results() {
    const [results, setResults] = useState([])

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('glassbox-results') || '[]')
        setResults(stored)
    }, [])

    const metrics = useMemo(() => {
        const condA = results.filter((r) => r.condition === 'A')
        const condB = results.filter((r) => r.condition === 'B')
        const avg = (arr, key) => {
            const vals = arr.map((r) => r.likert?.[key]).filter(Boolean)
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
        }
        const avgTime = (arr) => {
            const vals = arr.map((r) => r.session?.durationMs).filter(Boolean)
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length / 1000 : 0
        }
        const avgInteractions = (arr) => {
            const vals = arr.map((r) => r.session?.totalInteractions).filter(Boolean)
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
        }
        const likertKeys = ['trust', 'control', 'understanding', 'satisfaction', 'efficiency', 'willingness', 'agency', 'transparency']
        return {
            condA, condB, likertKeys,
            likertA: Object.fromEntries(likertKeys.map((k) => [k, avg(condA, k)])),
            likertB: Object.fromEntries(likertKeys.map((k) => [k, avg(condB, k)])),
            timeA: avgTime(condA), timeB: avgTime(condB),
            interactionsA: avgInteractions(condA), interactionsB: avgInteractions(condB),
        }
    }, [results])

    const exportCSV = () => {
        if (results.length === 0) return
        const headers = ['participant','condition','duration_sec','total_interactions','trust','control','understanding','satisfaction','efficiency','willingness','agency','transparency','most_useful','open_feedback']
        const rows = results.map((r, i) => [
            i + 1, r.condition, Math.round((r.session?.durationMs || 0) / 1000), r.session?.totalInteractions || 0,
            ...['trust','control','understanding','satisfaction','efficiency','willingness','agency','transparency'].map((k) => r.likert?.[k] || ''),
            `"${(r.mostUseful || '').replace(/"/g, '""')}"`, `"${(r.openFeedback || '').replace(/"/g, '""')}"`,
        ])
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob); const a = document.createElement('a')
        a.href = url; a.download = 'glassbox_experiment_results.csv'; a.click(); URL.revokeObjectURL(url)
    }

    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob); const a = document.createElement('a')
        a.href = url; a.download = 'glassbox_experiment_results.json'; a.click(); URL.revokeObjectURL(url)
    }

    const clearData = () => {
        if (window.confirm('Are you sure? This cannot be undone.')) {
            localStorage.removeItem('glassbox-results'); setResults([])
        }
    }

    const hasComparison = metrics.condA.length > 0 && metrics.condB.length > 0

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
                Experiment Results
            </h2>
            <p style={{ fontSize: 14, color: '#7a8a9a', marginBottom: 8 }}>
                {results.length} session{results.length !== 1 ? 's' : ''} recorded
                {metrics.condA.length > 0 && ` — ${metrics.condA.length} Chat (A)`}
                {metrics.condB.length > 0 && `, ${metrics.condB.length} Glass-Box (B)`}
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
                <button onClick={exportCSV} disabled={!results.length} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(0,212,170,0.4)', background: 'rgba(0,212,170,0.08)', color: results.length ? '#00d4aa' : '#3a4a5a', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: results.length ? 'pointer' : 'not-allowed' }}>↓ CSV</button>
                <button onClick={exportJSON} disabled={!results.length} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: results.length ? '#8899aa' : '#3a4a5a', fontFamily: 'var(--font-sans)', fontSize: 13, cursor: results.length ? 'pointer' : 'not-allowed' }}>↓ JSON</button>
                <button onClick={clearData} disabled={!results.length} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.2)', background: 'transparent', color: results.length ? '#ff6b6b' : '#3a4a5a', fontFamily: 'var(--font-sans)', fontSize: 13, cursor: results.length ? 'pointer' : 'not-allowed', marginLeft: 'auto' }}>Clear All</button>
            </div>

            {/* ═══ COMPARATIVE DASHBOARD ═══ */}
            {hasComparison ? (
                <>
                    <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
                        <StatCard label="Avg. Task Time" valueA={metrics.timeA} valueB={metrics.timeB} unit="s" higherIsBetter={false} />
                        <StatCard label="Avg. Interactions" valueA={metrics.interactionsA} valueB={metrics.interactionsB} />
                        <StatCard label="Avg. Trust" valueA={metrics.likertA.trust} valueB={metrics.likertB.trust} />
                        <StatCard label="Avg. Control" valueA={metrics.likertA.control} valueB={metrics.likertB.control} />
                    </div>

                    <div style={{ padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Survey Comparison (Likert 1–5)</h3>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 12, height: 4, borderRadius: 2, background: '#8899aa' }} />
                                    <span style={{ color: '#8899aa' }}>Chat (A) n={metrics.condA.length}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 12, height: 4, borderRadius: 2, background: '#00d4aa' }} />
                                    <span style={{ color: '#00d4aa' }}>Glass-Box (B) n={metrics.condB.length}</span>
                                </div>
                            </div>
                        </div>
                        {metrics.likertKeys.map((key) => (
                            <ComparisonBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} valueA={metrics.likertA[key]} valueB={metrics.likertB[key]} />
                        ))}
                    </div>

                    <div style={{ padding: '20px 24px', borderRadius: 12, background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.1)', marginBottom: 28 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#00d4aa', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Auto-Generated Findings</h3>
                        <div style={{ fontSize: 13, color: '#a0c0b0', lineHeight: 1.7 }}>
                            {(() => {
                                const findings = []
                                const trustDiff = metrics.likertB.trust - metrics.likertA.trust
                                const controlDiff = metrics.likertB.control - metrics.likertA.control
                                const understandDiff = metrics.likertB.understanding - metrics.likertA.understanding
                                const agencyDiff = metrics.likertB.agency - metrics.likertA.agency
                                const timeDiff = metrics.timeA - metrics.timeB
                                if (Math.abs(trustDiff) > 0.2) findings.push(`Trust ${trustDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(trustDiff).toFixed(1)} points with the Glass-Box interface.`)
                                if (Math.abs(controlDiff) > 0.2) findings.push(`Perceived control ${controlDiff > 0 ? 'improved' : 'declined'} by ${Math.abs(controlDiff).toFixed(1)} points with direct manipulation sliders.`)
                                if (Math.abs(understandDiff) > 0.2) findings.push(`Understanding of AI behavior ${understandDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(understandDiff).toFixed(1)} points with stability indicators and X-Ray overlays.`)
                                if (Math.abs(agencyDiff) > 0.2) findings.push(`Users felt ${agencyDiff > 0 ? 'more' : 'less'} like collaborators (agency ${agencyDiff > 0 ? '+' : ''}${agencyDiff.toFixed(1)}).`)
                                if (Math.abs(timeDiff) > 3) findings.push(`Average task time was ${Math.abs(timeDiff).toFixed(0)}s ${timeDiff > 0 ? 'faster' : 'slower'} with Glass-Box.`)
                                if (findings.length === 0) findings.push('Differences between conditions are minimal. Run more sessions for clearer trends.')
                                return findings.join(' ')
                            })()}
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ padding: '48px 40px', textAlign: 'center', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 28 }}>
                    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📊</div>
                    <div style={{ fontSize: 15, color: '#7a8a9a', marginBottom: 8 }}>
                        {results.length === 0 ? 'No sessions recorded yet.' : 'Complete both Condition A and B to unlock the comparison dashboard.'}
                    </div>
                    <div style={{ fontSize: 12, color: '#4a5a6a' }}>Run at least one session per condition.</div>
                </div>
            )}

            {/* ═══ RAW DATA TABLE ═══ */}
            {results.length > 0 && (
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Raw Session Data</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead><tr>
                                {['#', 'Cond.', 'Time', 'Actions', 'Trust', 'Ctrl', 'Undrstd', 'Satisf.', 'Agency', 'Transp.'].map((h) => (
                                    <th key={h} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#5a6a7a', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                            {results.map((r, i) => (
                                <tr key={i}>
                                    <td style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#5a6a7a' }}>{i + 1}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, background: r.condition === 'B' ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.05)', color: r.condition === 'B' ? '#00d4aa' : '#8899aa' }}>{r.condition}</span>
                                    </td>
                                    <td style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{Math.round((r.session?.durationMs || 0) / 1000)}s</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{r.session?.totalInteractions || 0}</td>
                                    {['trust', 'control', 'understanding', 'satisfaction', 'agency', 'transparency'].map((key) => (
                                        <td key={key} style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontSize: 11, color: (r.likert?.[key] || 0) >= 4 ? '#00d4aa' : (r.likert?.[key] || 0) >= 3 ? '#f0b429' : '#ff6b6b' }}>{r.likert?.[key] || '—'}</td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
