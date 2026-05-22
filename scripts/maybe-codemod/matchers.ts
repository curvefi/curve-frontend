import { SyntaxKind, type ConditionalExpression, type IfStatement, type Expression, type Node } from 'ts-morph'
import { isNullishLiteral, extractNullChecks } from './null-checks'
import type { TernaryMatch, GuardMatch } from './types'

/** Determines which branch of a ternary is nullish and which is the expression */
const classifyTernaryBranches = (
  node: ConditionalExpression,
): { exprBranch: Expression; nullishValue: 'null' | 'undefined' } | null => {
  const whenTrue = node.getWhenTrue()
  const whenFalse = node.getWhenFalse()

  const trueNullish = isNullishLiteral(whenTrue)
  const falseNullish = isNullishLiteral(whenFalse)

  if (trueNullish && falseNullish) return null
  if (!trueNullish && !falseNullish) return null

  if (trueNullish) return { exprBranch: whenFalse as Expression, nullishValue: trueNullish as 'null' | 'undefined' }
  return { exprBranch: whenTrue as Expression, nullishValue: falseNullish as 'null' | 'undefined' }
}

/** Checks if a ternary expression matches the `x == null ? nullish : expr` pattern and returns a TernaryMatch */
export const matchTernary = (node: ConditionalExpression): TernaryMatch | null => {
  const branches = classifyTernaryBranches(node)
  if (!branches) return null

  const nullChecks = extractNullChecks(node.getCondition() as Expression)
  if (!nullChecks?.length) return null

  return { kind: 'ternary', node, nullChecks, exprBranch: branches.exprBranch, nullishValue: branches.nullishValue }
}

/** Extracts the expression from a ReturnStatement node, or null if not applicable */
const getReturnExpr = (node: Node): Expression | null => {
  if (!node.isKind(SyntaxKind.ReturnStatement)) return null
  const expr = node.asKindOrThrow(SyntaxKind.ReturnStatement).getExpression()
  return expr ?? null
}

/** Unwraps a then-statement: returns the expression if it's a single return or a block with one return */
const unwrapThenReturn = (then: Node): Expression | null => {
  if (then.isKind(SyntaxKind.ReturnStatement)) return getReturnExpr(then)
  if (!then.isKind(SyntaxKind.Block)) return null

  const statements = then.asKindOrThrow(SyntaxKind.Block).getStatements()
  return statements.length === 1 ? getReturnExpr(statements[0]) : null
}

/** Checks if a node spans multiple lines (not a one-liner) */
const isOneLiner = (node: Node): boolean => node.getStartLineNumber() === node.getEndLineNumber()

/** Checks if an if-statement's condition is a single null check */
const extractGuardNullCheck = (
  condition: Expression,
): { checkedValue: Expression; nullishValue: 'null' | 'undefined' } | null => {
  const nullChecks = extractNullChecks(condition)
  return nullChecks?.length === 1 ? { checkedValue: nullChecks[0].checkedValue, nullishValue: 'null' } : null
}

/** Checks if an if-statement matches the guard-clause pattern: `if (x == null) return null; return expr(x)` */
export const matchGuard = (node: IfStatement): GuardMatch | null => {
  const condition = node.getExpression() as Expression
  const guardCheck = extractGuardNullCheck(condition)
  if (!guardCheck) return null

  // Both the if-body and the next statement must be one-liners
  if (!isOneLiner(node)) return null

  const thenReturnExpr = unwrapThenReturn(node.getThenStatement())
  if (!thenReturnExpr) return null
  const thenNullish = isNullishLiteral(thenReturnExpr)
  if (!thenNullish) return null

  const nextSibling = node.getNextSibling()
  if (!nextSibling) return null
  if (!isOneLiner(nextSibling)) return null

  const nextReturnExpr = getReturnExpr(nextSibling)
  if (!nextReturnExpr) return null

  return {
    kind: 'guard',
    node,
    nullCheck: { checkedValue: guardCheck.checkedValue, isNegated: false },
    returnExpr: nextReturnExpr,
    nullishValue: thenNullish as 'null' | 'undefined',
  }
}
