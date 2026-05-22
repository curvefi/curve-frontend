import type { Node } from 'ts-morph'
import type { Match } from './types'

/** Returns true if nodeA is an ancestor of nodeB */
const isAncestorOf = (ancestor: Node, descendant: Node): boolean => {
  let current: Node | undefined = descendant.getParent()
  while (current) {
    if (current === ancestor) return true
    current = current.getParent()
  }
  return false
}

/** Returns true if either node is an ancestor of the other (they overlap in the AST) */
export const nodesOverlap = (a: Node, b: Node): boolean => isAncestorOf(a, b) || isAncestorOf(b, a)

/** Returns true if a match overlaps with any match already in the existing list */
const hasOverlap = (match: Match, existing: Match[]): boolean => existing.some(e => nodesOverlap(e.node, match.node))

/** Computes the depth of a node in the AST (0 = root child) */
const nodeDepth = (node: Node): number => {
  let depth = 0
  let current: Node | undefined = node.getParent()
  while (current) {
    depth++
    current = current.getParent()
  }
  return depth
}

/** Filters matches to remove overlapping ones, preferring deeper (more specific) matches */
export const deduplicateMatches = (matches: Match[]): Match[] =>
  // Sort deepest first — inner matches take priority over outer matches
  [...matches]
    .sort((a, b) => nodeDepth(b.node) - nodeDepth(a.node))
    .reduce<Match[]>((acc, match) => {
      if (!hasOverlap(match, acc)) acc.push(match)
      return acc
    }, [])
