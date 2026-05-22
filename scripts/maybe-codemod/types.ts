import type { Expression, IfStatement, ConditionalExpression } from 'ts-morph'

/** A null-check extracted from a condition expression (e.g. `x == null`, `y !== undefined`) */
export type NullCheck = {
  /** The expression being checked for nullishness (e.g. `x`, `gauge.weight`) */
  checkedValue: Expression
  /** True if the check is negated (`!=` / `!==`), false if affirmative (`==` / `===`) */
  isNegated: boolean
}

/** A matched ternary pattern like `x == null ? null : f(x)` */
export type TernaryMatch = {
  kind: 'ternary'
  /** The original ConditionalExpression node */
  node: ConditionalExpression
  /** All null checks found in the condition */
  nullChecks: NullCheck[]
  /** The non-nullish branch (the expression to wrap in `maybe`) */
  exprBranch: Expression
  /** Whether the null branch was `null` or `undefined` (affects `?? null` suffix) */
  nullishValue: 'null' | 'undefined'
}

/** A matched guard-clause pattern like `if (x == null) return null; return f(x)` */
export type GuardMatch = {
  kind: 'guard'
  /** The original IfStatement node */
  node: IfStatement
  /** The single null check in the condition */
  nullCheck: NullCheck
  /** The expression returned after the guard */
  returnExpr: Expression
  /** Whether the guard returned `null` or `undefined` */
  nullishValue: 'null' | 'undefined'
}

/** Union of all match types */
export type Match = TernaryMatch | GuardMatch

/** A description of a single transformation for reporting */
export type ChangeReport = {
  filePath: string
  lineNumber: number
  before: string
  after: string
}
