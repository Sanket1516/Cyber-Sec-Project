export function analyzeLocally(password) {
  const length = password.length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  let charsetSize = 0
  if (hasLower) charsetSize += 26
  if (hasUpper) charsetSize += 26
  if (hasDigit) charsetSize += 10
  if (hasSpecial) charsetSize += 33
  if (charsetSize === 0) charsetSize = 1

  const entropy = length * Math.log2(charsetSize)

  let score = Math.min(100, entropy * 1.2)
  score = Math.max(0, Math.round(score))

  let label = 'Very Weak'
  if (score >= 80) label = 'Very Strong'
  else if (score >= 60) label = 'Strong'
  else if (score >= 40) label = 'Fair'
  else if (score >= 20) label = 'Weak'

  return { length, charsetSize, entropy: Math.round(entropy * 100) / 100, score, label, hasLower, hasUpper, hasDigit, hasSpecial }
}

export function getStrengthColor(label) {
  const colors = {
    'Very Weak': '#ef4444',
    'Weak': '#f97316',
    'Fair': '#eab308',
    'Strong': '#22c55e',
    'Very Strong': '#06b6d4'
  }
  return colors[label] || '#6b7280'
}
