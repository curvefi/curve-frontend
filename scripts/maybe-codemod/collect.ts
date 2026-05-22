import { SyntaxKind, type SourceFile } from 'ts-morph'
import { matchTernary, matchGuard } from './matchers'
import type { TernaryMatch, GuardMatch, Match } from './types'

/** Collects all ternary pattern matches from a source file */
export const collectTernaryMatches = (sourceFile: SourceFile): TernaryMatch[] =>
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ConditionalExpression)
    .map(matchTernary)
    .filter((m): m is TernaryMatch => !!m)

/** Collects all guard-clause pattern matches from a source file */
export const collectGuardMatches = (sourceFile: SourceFile): GuardMatch[] =>
  sourceFile
    .getDescendantsOfKind(SyntaxKind.IfStatement)
    .map(matchGuard)
    .filter((m): m is GuardMatch => !!m)

/** Collects all matches (ternary + guard) from a source file */
export const collectMatches = (sourceFile: SourceFile): Match[] => [
  ...collectTernaryMatches(sourceFile),
  ...collectGuardMatches(sourceFile),
]
