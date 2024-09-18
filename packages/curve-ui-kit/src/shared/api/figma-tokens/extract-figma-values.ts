/**
 * Extracts values from a Figma token object, excluding specified keys.
 * @param obj - The Figma token object to extract values from.
 * @param excludeKeys - An array of keys to exclude from extraction.
 * @returns An array of extracted values.
 */
export function extractValues<T extends FigmaValueObject<unknown, string>>(
  obj: T,
  excludeKeys: string[] = [],
): ExtractedValues<T, (typeof excludeKeys)[number]> {
  return Object.entries(obj)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([, value]) => value) as ExtractedValues<T, (typeof excludeKeys)[number]>
}

/**
 * Extracts key-value pairs from a Figma token object, excluding specified keys.
 * @param obj - The Figma token object to extract key-value pairs from.
 * @param excludeKeys - An array of keys to exclude from extraction.
 * @returns An object containing the extracted key-value pairs.
 */
export function extractPairs<T extends FigmaValueObject<unknown, string>>(
  obj: T,
  excludeKeys: string[] = [],
): ExtractedKeyValuePairs<T, (typeof excludeKeys)[number]> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (!excludeKeys.includes(key)) {
        // @ts-expect-error
        acc[key] = value
      }
      return acc
    },
    {} as ExtractedKeyValuePairs<T, (typeof excludeKeys)[number]>,
  )
}

/**
 * Extracts a number from a value of unknown type.
 * @param value - The value to extract a number from.
 * @returns A number if extraction is successful.
 * @throws Error if extraction fails.
 */
export function extractNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) {
      return parsed
    }
  }

  if (typeof value === 'object' && value !== null && 'value' in value) {
    return extractNumber((value as { value: unknown }).value)
  }

  throw new Error(`Unable to extract number from value: ${JSON.stringify(value)}`)
}

export type FigmaValueObject<V, K extends string> = {
  [key in K]: V
}

type ExcludeKeys<T, K extends string> = Exclude<keyof T, K>

export type ExtractedValues<T, K extends string> = Array<T[ExcludeKeys<T, K>]>

export type ExtractedKeyValuePairs<T, K extends string> = {
  [P in ExcludeKeys<T, K>]: T[P]
}
