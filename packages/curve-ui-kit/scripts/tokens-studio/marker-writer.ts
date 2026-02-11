import { readFile, writeFile } from 'node:fs/promises'
import ts from 'typescript'
import { getExprFromMarker, isExprMarker, markExpr } from './types.ts'
import type { JsonObject } from './types.ts'

const IDENTIFIER_PATTERN = /^[$A-Z_][0-9A-Z_$]*$/i

const renderKey = (key: string): string => (IDENTIFIER_PATTERN.test(key) ? key : JSON.stringify(key))

const renderString = (value: string): string => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const unwrapExpression = (expr: ts.Expression): ts.Expression => {
  if (ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr) || ts.isParenthesizedExpression(expr)) {
    return unwrapExpression(expr.expression)
  }
  return expr
}

const propertyNameToKey = (name: ts.PropertyName, sourceFile: ts.SourceFile): string => {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text
  if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text
  if (ts.isComputedPropertyName(name)) {
    const unwrapped = unwrapExpression(name.expression)
    if (ts.isStringLiteral(unwrapped) || ts.isNumericLiteral(unwrapped) || ts.isIdentifier(unwrapped)) {
      return unwrapped.text
    }
  }
  throw new Error(`Unsupported property name syntax '${name.getText(sourceFile)}'`)
}

const parseTsValue = (expr: ts.Expression, sourceFile: ts.SourceFile): unknown => {
  const unwrapped = unwrapExpression(expr)

  if (ts.isStringLiteral(unwrapped) || ts.isNoSubstitutionTemplateLiteral(unwrapped)) return unwrapped.text
  if (ts.isNumericLiteral(unwrapped)) return Number(unwrapped.text)
  if (unwrapped.kind === ts.SyntaxKind.TrueKeyword) return true
  if (unwrapped.kind === ts.SyntaxKind.FalseKeyword) return false
  if (unwrapped.kind === ts.SyntaxKind.NullKeyword) return null

  if (ts.isPrefixUnaryExpression(unwrapped) && unwrapped.operator === ts.SyntaxKind.MinusToken) {
    const operand = parseTsValue(unwrapped.operand, sourceFile)
    if (typeof operand === 'number') return -operand
    return markExpr(unwrapped.getText(sourceFile))
  }

  if (ts.isObjectLiteralExpression(unwrapped)) {
    const out: JsonObject = {}

    for (const property of unwrapped.properties) {
      if (ts.isSpreadAssignment(property)) {
        throw new Error(`Spread assignments are not supported in importer-managed marker objects`)
      }

      if (ts.isShorthandPropertyAssignment(property)) {
        out[property.name.text] = markExpr(property.name.getText(sourceFile))
        continue
      }

      if (ts.isPropertyAssignment(property)) {
        const key = propertyNameToKey(property.name, sourceFile)
        out[key] = parseTsValue(property.initializer, sourceFile)
        continue
      }

      throw new Error(`Unsupported property syntax '${property.getText(sourceFile)}' in marker object`)
    }

    return out
  }

  if (ts.isArrayLiteralExpression(unwrapped)) {
    return unwrapped.elements.map((element) => {
      if (!ts.isExpression(element)) return markExpr(element.getText(sourceFile))
      return parseTsValue(element, sourceFile)
    })
  }

  return markExpr(unwrapped.getText(sourceFile))
}

const extractMarkedSection = (source: string, beginMarker: string, endMarker: string, filePath: string) => {
  const beginIndex = source.indexOf(beginMarker)
  if (beginIndex < 0) throw new Error(`Missing marker '${beginMarker}' in ${filePath}`)

  const endIndex = source.indexOf(endMarker)
  if (endIndex < 0) throw new Error(`Missing marker '${endMarker}' in ${filePath}`)
  if (endIndex <= beginIndex)
    throw new Error(`Invalid marker ordering in ${filePath}: '${beginMarker}' before '${endMarker}'`)

  return {
    beginIndex,
    endIndex,
    content: source.slice(beginIndex + beginMarker.length, endIndex),
  }
}

export const readMarkerObjectFromSource = (
  source: string,
  filePath: string,
  constName: string,
  beginMarker: string,
  endMarker: string,
): unknown => {
  const section = extractMarkedSection(source, beginMarker, endMarker, filePath)
  const sourceFile = ts.createSourceFile(filePath, section.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  let initializer: ts.Expression | null = null

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return
    for (const declaration of node.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== constName || !declaration.initializer)
        continue
      initializer = declaration.initializer
    }
  })

  if (!initializer) {
    throw new Error(`Could not find const declaration for '${constName}' inside marker block in ${filePath}`)
  }

  return parseTsValue(initializer, sourceFile)
}

export const readMarkerObject = async (
  filePath: string,
  constName: string,
  beginMarker: string,
  endMarker: string,
): Promise<unknown> => {
  const source = await readFile(filePath, 'utf8')
  return readMarkerObjectFromSource(source, filePath, constName, beginMarker, endMarker)
}

export const renderTsLiteral = (value: unknown, indent = 0): string => {
  if (isExprMarker(value)) return getExprFromMarker(value)
  if (typeof value === 'string') return renderString(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'bigint') return `${value.toString()}n`
  if (typeof value === 'symbol') return markExpr(String(value))
  if (typeof value === 'function') return markExpr(String(value))

  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return markExpr(String(value))
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const currentIndent = ' '.repeat(indent)
    const nextIndent = ' '.repeat(indent + 2)
    const rows = value.map((item) => `${nextIndent}${renderTsLiteral(item, indent + 2)}`)
    return `[\n${rows.join(',\n')}\n${currentIndent}]`
  }

  if (!value || typeof value !== 'object') {
    return String(value)
  }

  const entries = Object.entries(value as JsonObject)
  if (entries.length === 0) return '{}'

  const currentIndent = ' '.repeat(indent)
  const nextIndent = ' '.repeat(indent + 2)
  const rows = entries.map(([key, child]) => `${nextIndent}${renderKey(key)}: ${renderTsLiteral(child, indent + 2)}`)
  return `{\n${rows.join(',\n')}\n${currentIndent}}`
}

export const renderConstDeclaration = (constName: string, value: unknown, exported: boolean): string =>
  `${exported ? 'export ' : ''}const ${constName} = ${renderTsLiteral(value)} as const`

export const replaceMarkedSection = (
  source: string,
  beginMarker: string,
  endMarker: string,
  sectionContent: string,
  filePath: string,
): string => {
  const section = extractMarkedSection(source, beginMarker, endMarker, filePath)
  const before = source.slice(0, section.beginIndex + beginMarker.length)
  const after = source.slice(section.endIndex)
  return `${before}\n${sectionContent}\n${after}`
}

export const applySectionUpdates = (
  source: string,
  filePath: string,
  updates: Array<{ beginMarker: string; endMarker: string; content: string }>,
): string => {
  let next = source
  for (const update of updates) {
    next = replaceMarkedSection(next, update.beginMarker, update.endMarker, update.content, filePath)
  }
  return next
}

export const rewriteDesignFile = async (
  filePath: string,
  updates: Array<{ beginMarker: string; endMarker: string; content: string }>,
  write: boolean,
): Promise<boolean> => {
  const existing = await readFile(filePath, 'utf8')
  const next = applySectionUpdates(existing, filePath, updates)

  if (existing === next) return false

  if (write) {
    await writeFile(filePath, next, 'utf8')
  }

  return true
}
