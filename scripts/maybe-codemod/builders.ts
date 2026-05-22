import { type Expression, type Node, SyntaxKind } from 'ts-morph'
import type { NullCheck } from './types'

/** Chooses a lambda parameter name: the identifier's text for Identifiers, 'data'/data2/data3 for other expressions */
export const getParamNames = (checks: NullCheck[]): string[] => {
  let dataIndex = 0
  return checks.map(check => {
    const name = check.checkedValue.isKind(SyntaxKind.Identifier) ? check.checkedValue.getText() : null
    if (!name) {
      dataIndex++
      return dataIndex === 1 ? 'data' : `data${dataIndex}`
    }
    return name
  })
}

/** Builds the non-optional variant of a property access expression text (x?.prop → x.prop) */
const toNonOptionalText = (text: string): string => text.replace(/\?\./g, '.')

/** Finds all descendant nodes that match the checked value or its non-optional variant */
const findMatchingDescendants = (exprBranch: Expression, checkedValue: Expression): Node[] => {
  const text = checkedValue.getText()
  const nonOptionalText = toNonOptionalText(text)
  const kind = checkedValue.getKind()
  // Also match PropertyAccessExpression if checkedValue is optional chaining
  const altKind = checkedValue.isKind(SyntaxKind.PropertyAccessExpression)
    ? SyntaxKind.PropertyAccessExpression
    : undefined

  return exprBranch
    .getDescendantsOfKind(kind)
    .filter(node => {
      const nodeText = node.getText()
      return nodeText === text || nodeText === nonOptionalText
    })
    .concat(
      altKind && kind !== SyntaxKind.PropertyAccessExpression
        ? exprBranch.getDescendantsOfKind(altKind).filter(node => {
            const nodeText = node.getText()
            return nodeText === text || nodeText === nonOptionalText
          })
        : [],
    )
}

/** Sorts nodes deepest-first so replacements don't shift positions of earlier nodes */
const sortDeepestFirst = (nodes: Node[]): Node[] => [...nodes].sort((a, b) => b.getEnd() - a.getEnd())

/** Replaces all occurrences of a PropertyAccess with the param name in the AST */
const replacePropertyAccessInAst = (exprBranch: Expression, checkedValue: Expression, paramName: string): void => {
  const matches = findMatchingDescendants(exprBranch, checkedValue)
  sortDeepestFirst(matches).forEach(node => node.replaceWithText(paramName))
}

/** Checks if an identifier is the property-name of a member access expression (right side of dot) */
const isPropertyName = (id: Node): boolean => {
  const parent = id.getParent()
  if (!parent?.isKind(SyntaxKind.PropertyAccessExpression)) return false
  return parent.asKindOrThrow(SyntaxKind.PropertyAccessExpression).getNameNode() === id
}

/** Replaces standalone identifier occurrences in an expression AST, skipping property names */
const replaceIdentifierInAst = (exprBranch: Expression, identifierText: string, paramName: string): void => {
  const matches = exprBranch
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter(id => id.getText() === identifierText && !isPropertyName(id))

  sortDeepestFirst(matches).forEach(id => id.replaceWithText(paramName))
}

/** Replaces occurrences of checkedValue in the exprBranch AST with the param name */
export const replaceCheckedValueInAst = (exprBranch: Expression, checkedValue: Expression, paramName: string): void => {
  if (checkedValue.isKind(SyntaxKind.Identifier)) {
    replaceIdentifierInAst(exprBranch, checkedValue.getText(), paramName)
    return
  }
  replacePropertyAccessInAst(exprBranch, checkedValue, paramName)
}

/** Applies all null-check replacements in the expression branch AST */
export const applyReplacementsInAst = (exprBranch: Expression, nullChecks: NullCheck[]): void => {
  const paramNames = getParamNames(nullChecks)

  nullChecks.forEach((check, i) => {
    replaceCheckedValueInAst(exprBranch, check.checkedValue, paramNames[i])
  })
}

/** Checks if an expression body needs paren wrapping in an arrow function (object literals) */
const needsArrowParens = (bodyText: string): boolean => bodyText.trimStart().startsWith('{')

/** Builds the `maybe(...)` call text for a single null check: `maybe(x, (x) => expr)` */
const buildSingleMaybe = (checkedValueText: string, param: string, bodyText: string): string => {
  const wrapped = needsArrowParens(bodyText) ? `(${bodyText})` : bodyText
  return `maybe(${checkedValueText}, (${param}) => ${wrapped})`
}

/** Builds a destructured tuple parameter like `[x, y]` */
const buildTupleParam = (paramNames: string[]): string => `[${paramNames.join(', ')}]`

/** Builds the `maybe(...)` call text for compound null checks using the tuple form */
const buildTupleMaybe = (checkedValues: string[], paramNames: string[], bodyText: string): string => {
  const tupleValue = `[${checkedValues.join(', ')}]`
  const destructuredParam = buildTupleParam(paramNames)
  const wrapped = needsArrowParens(bodyText) ? `(${bodyText})` : bodyText
  return `maybe(${tupleValue}, (${destructuredParam}) => ${wrapped})`
}

/** Builds the `maybe(...)` call text, using tuple form for compound null checks */
export const buildMaybeText = (nullChecks: NullCheck[], bodyText: string): string => {
  const paramNames = getParamNames(nullChecks)
  const checkedValueTexts = nullChecks.map(check => check.checkedValue.getText())

  if (nullChecks.length === 1) {
    return buildSingleMaybe(checkedValueTexts[0], paramNames[0], bodyText)
  }

  return buildTupleMaybe(checkedValueTexts, paramNames, bodyText)
}

/** Wraps a maybe call with `?? null` if the original nullish branch was `null` (omitted for `undefined`) */
export const wrapWithNullish = (maybeText: string, nullishValue: 'null' | 'undefined'): string =>
  nullishValue === 'null' ? `(${maybeText} ?? null)` : maybeText
