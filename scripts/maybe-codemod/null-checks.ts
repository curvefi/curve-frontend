import { SyntaxKind, type Node, type Expression, type BinaryExpression } from 'ts-morph'
import type { NullCheck } from './types'

/** Operators that can appear in a null check comparison */
const NULL_CHECK_OPERATORS = [
  SyntaxKind.EqualsEqualsToken,
  SyntaxKind.EqualsEqualsEqualsToken,
  SyntaxKind.ExclamationEqualsToken,
  SyntaxKind.ExclamationEqualsEqualsToken,
] as const

/** Returns 'null', 'undefined', or false if node is not a nullish literal */
export const isNullishLiteral = (node: Node): 'null' | 'undefined' | false =>
  // In value positions, `undefined` is parsed as an Identifier (not UndefinedKeyword)
  node.getKind() === SyntaxKind.NullKeyword
    ? 'null'
    : node.getKind() === SyntaxKind.UndefinedKeyword
      ? 'undefined'
      : node.isKind(SyntaxKind.Identifier) && node.getText() === 'undefined'
        ? 'undefined'
        : false

/** Checks if a binary operator is a null-check operator (==, ===, !=, !==) */
const isNullCheckOperator = (operator: SyntaxKind): boolean =>
  NULL_CHECK_OPERATORS.includes(operator as (typeof NULL_CHECK_OPERATORS)[number])

/** Determines whether a binary comparison operator is negated (!= / !==) */
const isNegatedOperator = (operator: SyntaxKind): boolean =>
  operator === SyntaxKind.ExclamationEqualsToken || operator === SyntaxKind.ExclamationEqualsEqualsToken

/** Extracts a NullCheck from a simple binary expression like `x == null` or `null === y` */
export const extractBinaryNullCheck = (node: BinaryExpression): NullCheck | null => {
  const operator = node.getOperatorToken().getKind()
  if (!isNullCheckOperator(operator)) return null

  const left = node.getLeft()
  const right = node.getRight()
  const leftNullish = isNullishLiteral(left)
  const rightNullish = isNullishLiteral(right)

  if (leftNullish) return { checkedValue: right as Expression, isNegated: isNegatedOperator(operator) }
  if (rightNullish) return { checkedValue: left as Expression, isNegated: isNegatedOperator(operator) }
  return null
}

/** Validates that all null checks in an `||` chain are non-negated (affirmative: `== null`) */
const allAffirmative = (checks: NullCheck[]): boolean => checks.every(c => !c.isNegated)

/** Validates that all null checks in an `&&` chain are negated (`!= null`) */
const allNegated = (checks: NullCheck[]): boolean => checks.every(c => c.isNegated)

/** Recursively extracts null checks from a condition expression (handles `||` and `&&` chains) */
export const extractNullChecks = (condition: Expression): NullCheck[] | null => {
  // Only BinaryExpressions can contain null checks
  if (!condition.isKind(SyntaxKind.BinaryExpression)) return null

  const binary = condition.asKindOrThrow(SyntaxKind.BinaryExpression)
  const operator = binary.getOperatorToken().getKind()

  if (operator === SyntaxKind.BarBarToken) return extractOrChainNullChecks(binary)
  if (operator === SyntaxKind.AmpersandAmpersandToken) return extractAndChainNullChecks(binary)

  const check = extractBinaryNullCheck(binary)
  return check ? [check] : null
}

/** Extracts null checks from an `||` chain (all must be affirmative: `x == null || y == null`) */
const extractOrChainNullChecks = (binary: BinaryExpression): NullCheck[] | null => {
  const leftChecks = extractNullChecks(binary.getLeft())
  const rightChecks = extractNullChecks(binary.getRight())
  if (!leftChecks || !rightChecks) return null

  const combined = [...leftChecks, ...rightChecks]
  return allAffirmative(combined) ? combined : null
}

/** Extracts null checks from an `&&` chain (all must be negated: `x != null && y != null`) */
const extractAndChainNullChecks = (binary: BinaryExpression): NullCheck[] | null => {
  const leftChecks = extractNullChecks(binary.getLeft())
  const rightChecks = extractNullChecks(binary.getRight())
  if (!leftChecks || !rightChecks) return null

  const combined = [...leftChecks, ...rightChecks]
  return allNegated(combined) ? combined.map(c => ({ ...c, isNegated: false })) : null
}
