/**
 * Maps a confidence score (0–1) to display colors and label.
 */
export function getConfidenceStyle(confidence) {
  if (confidence >= 0.85) {
    return {
      bg: 'rgba(0, 212, 170, 0.12)',
      border: 'rgba(0, 212, 170, 0.5)',
      text: '#00d4aa',
      label: 'High',
    }
  }
  if (confidence >= 0.65) {
    return {
      bg: 'rgba(240, 180, 41, 0.12)',
      border: 'rgba(240, 180, 41, 0.5)',
      text: '#f0b429',
      label: 'Medium',
    }
  }
  return {
    bg: 'rgba(255, 107, 107, 0.12)',
    border: 'rgba(255, 107, 107, 0.5)',
    text: '#ff6b6b',
    label: 'Low',
  }
}

/**
 * Clamp confidence to valid display range.
 */
export function clampConfidence(c) {
  return Math.max(0.15, Math.min(0.99, c))
}

/**
 * Icon for each segment category.
 */
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
