export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  if (seconds < 0.001) return 'Instant'
  if (seconds < 1) return `${(seconds * 1000).toFixed(1)} ms`
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`
  if (seconds < 86400 * 365) return `${(seconds / 86400).toFixed(1)} days`
  if (seconds < 86400 * 365 * 1000) return `${(seconds / (86400 * 365)).toFixed(1)} years`
  if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365 * 1000)).toFixed(1)} thousand years`
  if (seconds < 86400 * 365 * 1e9) return `${(seconds / (86400 * 365 * 1e6)).toFixed(1)} million years`
  if (seconds < 86400 * 365 * 1e12) return `${(seconds / (86400 * 365 * 1e9)).toFixed(1)} billion years`
  return `${(seconds / (86400 * 365 * 1e12)).toFixed(1)} trillion years`
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '—'
  if (typeof n === 'string') {
    const num = parseFloat(n)
    if (isNaN(num)) return n
    if (num > 1e15) return parseFloat(num).toExponential(2)
    return num.toLocaleString()
  }
  if (n > 1e15) return n.toExponential(2)
  return n.toLocaleString()
}
