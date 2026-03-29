export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatNumber(num) {
  return new Intl.NumberFormat().format(num)
}

export function calculateMacroPercentage(protein, calories) {
  // Protein: 4 cal/g
  const proteinCalories = protein * 4
  return calories > 0 ? Math.round((proteinCalories / calories) * 100) : 0
}

export function generateDateRange(days = 7) {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}