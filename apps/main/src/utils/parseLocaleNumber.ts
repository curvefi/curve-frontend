export function parseLocaleNumber(value: string | number | undefined | null): number | null {
  if (value === null || typeof value === 'undefined' || value === '') {
    return null
  }
  const numberValue = Number(value)
  return !isNaN(numberValue) && isFinite(numberValue) ? numberValue : null
}
