const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return ''
  const number = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(number)) return ''
  return currencyFormatter.format(number)
}

// Converte "2026-08-18" (formato do <input type="date">) em Date local,
// evitando o problema de fuso horário do construtor Date nativo com strings ISO.
export function parseISODate(isoDate) {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateBR(isoDate) {
  const date = parseISODate(isoDate)
  if (!date) return ''
  return date.toLocaleDateString('pt-BR')
}

export function todayISODate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
