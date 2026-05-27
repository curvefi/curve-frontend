/** Returns 'null' | 'undefined' if the node is a nullish literal, or false otherwise */
const isNullish = node =>
  (node?.type === 'Literal' && node.value === null) || (node?.type === 'Identifier' && node.name === 'undefined')

/**
 * Check if all null checks in both sides of a logical expression satisfy the given predicate, and if so,
 * return a combined array of all checks. Otherwise, return null.
 **/
const isEveryNullCheck = ([leftChecks, rightChecks], predicate) =>
  leftChecks?.every(predicate) && rightChecks?.every(predicate) ? [...leftChecks, ...rightChecks] : null

/**
 * Recursively extracts null checks from a condition expression.
 * Returns an array of { checkedValue, isNegated } objects, or null if the
 * condition is not purely composed of null checks.
 *
 * Supported patterns:
 *   x == null, x === null, x != null, x !== null  (also with undefined)
 *   a == null || b == null    (all affirmative)
 *   a != null && b != null    (all negated)
 */
const getNullChecks = ({ left, operator, right, type }) =>
  type === 'BinaryExpression'
    ? ['==', '===', '!=', '!=='].includes(operator)
      ? isNullish(right)
        ? [{ checkedValue: left, isNegated: operator.includes('!') }]
        : isNullish(left)
          ? [{ checkedValue: right, isNegated: operator.includes('!') }]
          : null
      : null
    : type === 'LogicalExpression'
      ? operator === '||'
        ? // All checks in an || chain must be affirmative (== null)
          isEveryNullCheck([getNullChecks(left), getNullChecks(right)], c => !c.isNegated)
        : operator === '&&'
          ? // All checks in an && chain must be negated (!= null)
            isEveryNullCheck([getNullChecks(left), getNullChecks(right)], c => c.isNegated)?.map(c => ({
              ...c,
              isNegated: false, // unify != null && and == null || since they are equivalent
            }))
          : null
      : null

const isThenNullish = ({ argument, body, type }) =>
  type === 'ReturnStatement'
    ? isNullish(argument)
    : type === 'BlockStatement' &&
      body.length === 1 &&
      body[0].type === 'ReturnStatement' &&
      isNullish(body[0].argument)

/**
 * Custom rule that guards for usages of the `maybe` helper.
 * @type {eslint.Rule.Module}
 **/
export const useMaybePatternRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow null-check patterns that should use the `maybe` helper from @primitives/objects.utils',
    },
    messages: {
      ternary: 'Use `maybe(value, fn)` instead of a ternary with a null check. See @primitives/objects.utils.',
      guard: 'Use `return maybe(value, fn)` instead of an early-return null guard. See @primitives/objects.utils.',
    },
  },
  create(context) {
    return {
      /** Detect ternary patterns: `x == null ? nullish : expr` or `x != null ? expr` : nullish */
      ConditionalExpression: node =>
        // Exactly one branch must be nullish && The entire condition must be composed of null checks
        isNullish(node.consequent) !== isNullish(node.alternate) &&
        getNullChecks(node.test) &&
        context.report({ node, messageId: 'ternary' }),
      /** Detect guard patterns: if (x == null) return nullish; return expr */
      IfStatement: node => {
        const { test, parent, consequent } = node
        const nullChecks = getNullChecks(test)
        if (
          // Condition must be a single affirmative null check (not negated)
          nullChecks?.length === 1 &&
          !nullChecks[0].isNegated &&
          // The then-block must be a return with a nullish value
          isThenNullish(consequent) &&
          // the next sibling must be a return statement
          (parent.type === 'BlockStatement' || parent.type === 'Program') &&
          parent.body[parent.body.indexOf(node) + 1]?.type === 'ReturnStatement'
        )
          context.report({
            node,
            messageId: 'guard',
          })
      },
    }
  },
}
