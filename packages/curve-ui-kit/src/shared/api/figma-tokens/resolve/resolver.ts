import type { CurveFigmaDesignTokens, ScreenType } from '../tokens'

export type ResolvedValue<T> = T extends { type: string; value: infer V }
  ? V extends string
    ? V extends `{${string}}`
      ? ResolvedTokenValue<CurveFigmaDesignTokens, V>
      : V
    : V
  : T extends object
    ? { [K in keyof T]: ResolvedValue<T[K]> }
    : T

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
