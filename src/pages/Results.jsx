import { useState, useEffect } from 'react'

export default function Results() {
  const [results, setResults] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('glassbox-results') || '[]')
    setResults(stored)
  }, [])

  const exportCSV = () => {
    if (results.length === 0) return

    // Build CSV rows
    const headers = [
      'participant',
      'condition',
      'duration_sec',
      'total_interactions',
      'trust',
      'control',
      'understanding',
      'satisfaction',
      'efficiency',
      'willingness',
      'most_useful',
      'open_feedback',
    ]

    const rows = results.map((r, i) => [
      i + 1,
      r.condition,
      Math.round((r.session?.durationMs || 0) / 1000),
      r.session?.totalInteractions || 0,
      r.likert?.trust || '',
      r.likert?.control || '',
      r.likert?.understanding || '',
      r.likert?.satisfaction || '',
      r.likert?.efficiency || '',
      r.likert?.willingness || '',
      `"${(r.mostUseful || '').replace(/"/g, '""')}"`,
      `"${(r.openFeedback || '').replace(/"/g, '""')}"`,
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'glassbox_experiment_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'glassbox_experiment_results.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      localStorage.removeItem('glassbox-results')
      setResults([])
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
        Experiment Results
      </h2>
      <p style={{ fontSize: 14, color: '#7a8a9a', marginBottom: 32 }}>
        {results.length} session{results.length !== 1 ? 's' : ''} recorded
      </p>

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
        <button
          onClick={exportCSV}
          disabled={results.length === 0}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid rgba(0,212,170,0.4)',
            background: 'rgba(0,212,170,0.08)',
            color: results.length > 0 ? '#00d4aa' : '#3a4a5a',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
            cursor: results.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          ↓ Export CSV
        </button>
        <button
          onClick={exportJSON}
          disabled={results.length === 0}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: results.length > 0 ? '#8899aa' : '#3a4a5a',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 500,
            cursor: results.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          ↓ Export JSON (full)
        </button>
        <button
          onClick={clearData}
          disabled={results.length === 0}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid rgba(255,107,107,0.2)',
            background: 'transparent',
            color: results.length > 0 ? '#ff6b6b' : '#3a4a5a',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            cursor: results.length > 0 ? 'pointer' : 'not-allowed',
            marginLeft: 'auto',
          }}
        >
          Clear All
        </button>
      </div>

      {/* Results table */}
      {results.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {['#', 'Condition', 'Duration', 'Interactions', 'Trust', 'Control', 'Understanding', 'Satisfaction'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        color: '#5a6a7a',
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#5a6a7a' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        background:
                          r.condition === 'B' ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.05)',
                        color: r.condition === 'B' ? '#00d4aa' : '#8899aa',
                      }}
                    >
                      {r.condition}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}
                  >
                    {Math.round((r.session?.durationMs || 0) / 1000)}s
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}
                  >
                    {r.session?.totalInteractions || 0}
                  </td>
                  {['trust', 'control', 'understanding', 'satisfaction'].map((key) => (
                    <td
                      key={key}
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color:
                          (r.likert?.[key] || 0) >= 4
                            ? '#00d4aa'
                            : (r.likert?.[key] || 0) >= 3
                            ? '#f0b429'
                            : '#ff6b6b',
                      }}
                    >
                      {r.likert?.[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            color: '#3a4a5a',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📊</div>
          <div style={{ fontSize: 14, color: '#5a6a7a' }}>
            No sessions recorded yet. Complete Condition A or B to see results here.
          </div>
        </div>
      )}
    </div>
  )
}
