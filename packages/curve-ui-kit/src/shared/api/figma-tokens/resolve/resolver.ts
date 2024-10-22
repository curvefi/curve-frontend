import type { CurveFigmaDesignTokens, ScreenType } from '../tokens'

/**
 * Resolves nested token values in a Figma design token tree.
 * This type recursively unwraps token objects and resolves referenced values.
 *
 * @template T - The type of the token tree
 */
export type ResolvedValue<T> = T extends { type: string; value: infer V }
  ? V extends string
    ? V extends `{${string}}`
      ? ResolvedTokenValue<CurveFigmaDesignTokens, V>
      : V
    : V
  : T extends object
    ? { [K in keyof T]: ResolvedValue<T[K]> }
    : T

/**
 * Resolves a token value given a token path.
 * This type navigates through the token tree to find and resolve the referenced value.
 *
 * @template TokenTree - The type of the entire token tree
 * @template TokenPath - A string representing the path to a token value
 */
export type ResolvedTokenValue<TokenTree, TokenPath extends string> = TokenPath extends `{${infer Path}}`
  ? Path extends keyof TokenTree
    ? TokenTree[Path] extends { value: infer V }
      ? V
      : never
    : Path extends `${infer FirstKey}.${infer RestOfPath}`
      ? FirstKey extends keyof TokenTree
        ? ResolvedTokenValue<TokenTree[FirstKey], `{${RestOfPath}}`>
        : ResolvedTokenValue<TokenTree, `{${RestOfPath}}`>
      : never
  : never

/**
 * Resolves all token references in a Figma design token tree.
 * This function traverses the entire token tree, resolving any referenced values
 * and handling screen type-specific tokens.
 *
 * @param tokenTree - The original Figma design token tree
 * @param screenType - The target screen type for resolution (default: 'desktop')
 * @returns A new token tree with all references resolved
 */
export function resolveFigmaTokens<T extends CurveFigmaDesignTokens>(
  tokenTree: T,
  screenType: ScreenType = 'desktop',
): ResolvedValue<T> {
  const resolveTokenValue = (tokenValue: any, rootTokens: any): any => {
    if (typeof tokenValue === 'object' && tokenValue !== null) {
      if ('type' in tokenValue && 'value' in tokenValue) {
        return resolveTokenValue(tokenValue.value, rootTokens)
      }
      return Object.fromEntries(
        Object.entries(tokenValue).map(([key, val]) => [key, resolveTokenValue(val, rootTokens)]),
      )
    }
    if (typeof tokenValue === 'string' && tokenValue.startsWith('{') && tokenValue.endsWith('}')) {
      const tokenPath = tokenValue.slice(1, -1).split('.')
      const resolvedValue = resolveTokenPath(tokenPath, rootTokens)

      const finalValue = resolveTokenValue(resolvedValue, rootTokens)

      if (typeof finalValue === 'object') {
        throw new Error(
          `Unable to resolve token: ${tokenValue}. Resolved value is an object: ${JSON.stringify(finalValue)}`,
        )
      }
      return finalValue
    }
    return tokenValue
  }

  const resolvePathSegment = (current: any, segment: string): any => {
    if (segment in current) return current[segment]
    if (screenType in current) return current[screenType]
    if ('default' in current) return current.default
    if ('inverted' in current) return current.inverted
    if (!(segment in current)) return current
  }

  const resolveTokenPath = (path: string[], root: any): any => {
    return path.reduce((acc, segment) => {
      const resolved = resolvePathSegment(acc, segment)
      if (resolved === undefined) {
        throw new Error(`Unable to resolve token: ${path.join('.')}`)
      }
      return resolved
    }, root)
  }

  const newTokenTree = JSON.parse(JSON.stringify(tokenTree))
  return resolveTokenValue(newTokenTree, newTokenTree) as ResolvedValue<T>
}
