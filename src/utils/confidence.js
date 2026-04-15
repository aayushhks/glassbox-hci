/**
 * ─── GENERATION STABILITY ───
 *
 * We deliberately avoid calling this "confidence" because LLMs do not have
 * a reliable internal sense of correctness. Instead, we define STABILITY
 * as a composite heuristic that estimates how much a segment's output
 * would vary across regenerations at the same parameter settings:
 *
 *   High stability   → Well-established patterns, deterministic outputs
 *                      (e.g., standard Raft election steps)
 *   Medium stability → Reasonable but parameter-sensitive outputs
 *                      (e.g., explanation style changes with Readability)
 *   Low stability    → Novel/speculative content, high variance across runs
 *                      (e.g., creative optimizations that may differ each time)
 *
 * This framing is defensible because it maps to real LLM behavior:
 * - Low-temperature, high-consensus content → high stability
 * - Creative, high-temperature content → low stability
 * - The score reflects OUTPUT VARIANCE, not factual correctness
 */

export function getStabilityStyle(score) {
    if (score >= 0.85) {
        return {
            bg: 'rgba(0, 212, 170, 0.12)',
            border: 'rgba(0, 212, 170, 0.5)',
            text: '#00d4aa',
            label: 'High',
            tooltip: 'Well-established pattern — consistent across regenerations',
        }
    }
    if (score >= 0.65) {
        return {
            bg: 'rgba(240, 180, 41, 0.12)',
            border: 'rgba(240, 180, 41, 0.5)',
            text: '#f0b429',
            label: 'Medium',
            tooltip: 'Parameter-sensitive — may vary with different settings',
        }
    }
    return {
        bg: 'rgba(255, 107, 107, 0.12)',
        border: 'rgba(255, 107, 107, 0.5)',
        text: '#ff6b6b',
        label: 'Low',
        tooltip: 'Novel/speculative — varies significantly across regenerations',
    }
}

export function clampStability(score) {
    return Math.max(0.15, Math.min(0.99, score))
}

export function getCategoryIcon(category) {
    const icons = {
        approach: '◆',
        algorithm: '⚙',
        'edge-case': '⚠',
        optimization: '✦',
        code: '❮❯',
        analysis: '📊',
    }
    return icons[category] || '•'
}
