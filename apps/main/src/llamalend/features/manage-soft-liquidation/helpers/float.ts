/**
 * Parses a string to a float, returning undefined if the input is null/undefined,
 * or 0 if the parsing fails.
 *
 * @param x - The string to parse as a float
 * @returns The parsed float value, undefined if input is null/undefined, or 0 if parsing fails
 */
export const parseFloatOptional = (x?: string) => (x == null ? undefined : parseFloat(x) || 0)
