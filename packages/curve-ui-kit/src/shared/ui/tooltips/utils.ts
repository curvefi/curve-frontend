/**
 * Formats a rate as a percentage string with 4 significant digits.
 * @param rate - The rate to format, when null, it defaults to 0 (please do not display this, show Skeleton instead).
 */
export const formatPercent = (rate: number | null) =>
  `${(rate || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
