export function formatLiters(value: number): string {
  return Number(value.toFixed(2)).toString()
}

export function formatPercentage(value: number): string {
  return Number(value.toFixed(1)).toString()
}

export function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** yyyy-MM-dd for <input type="date"> min/value/default-today. */
export function toDateInputValue(iso: string): string {
  return iso.slice(0, 10)
}
