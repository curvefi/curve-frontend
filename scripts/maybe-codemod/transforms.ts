import type { SourceFile, Statement } from 'ts-morph'
import type { Match, TernaryMatch, GuardMatch, ChangeReport } from './types'
import { buildMaybeText, wrapWithNullish, applyReplacementsInAst } from './builders'

/** Captures the "before" text of a match for reporting before it gets transformed */
const captureBeforeText = (match: Match): string => {
  if (match.kind === 'guard') {
    const ifText = match.node.getText()
    const nextSibling = match.node.getNextSibling()
    return nextSibling ? `${ifText}\n${nextSibling.getText()}` : ifText
  }
  return match.node.getText()
}

/** Applies AST replacements to the expression branch and builds the final replacement text for a ternary */
const buildTernaryReplacement = (match: TernaryMatch): string => {
  applyReplacementsInAst(match.exprBranch, match.nullChecks)
  const bodyText = match.exprBranch.getText().trim()
  const maybeText = buildMaybeText(match.nullChecks, bodyText)
  return wrapWithNullish(maybeText, match.nullishValue)
}

/** Applies AST replacements to the return expression and builds the final replacement text for a guard */
const buildGuardReplacement = (match: GuardMatch): string => {
  applyReplacementsInAst(match.returnExpr, [match.nullCheck])
  const bodyText = match.returnExpr.getText().trim()
  const maybeText = buildMaybeText([match.nullCheck], bodyText)
  const wrapped = wrapWithNullish(maybeText, match.nullishValue)
  return `return ${wrapped}`
}

/** Captures before-text and computes after-text for all matches in a source file, then applies transformations */
export const applyMatches = (
  sourceFile: SourceFile,
  matches: Match[],
): { reports: ChangeReport[]; modified: boolean } => {
  const fileMatches = matches.filter(m => m.node.getSourceFile().getFilePath() === sourceFile.getFilePath())

  if (!fileMatches.length) return { reports: [], modified: false }

  // Sort deepest/latest first to avoid position shifts
  const sorted = [...fileMatches].sort((a, b) => b.node.getStart() - a.node.getStart())

  // Capture before-text for all matches first (before any transformations)
  const beforeTexts = sorted.map(captureBeforeText)
  const lineNumbers = sorted.map(m => m.node.getStartLineNumber())

  // Apply transformations and capture after-text
  const reports: ChangeReport[] = sorted.map((match, i) => {
    const replacement = match.kind === 'ternary' ? buildTernaryReplacement(match) : buildGuardReplacement(match)

    if (match.kind === 'guard') {
      const nextSibling = match.node.getNextSibling() as Statement | undefined
      if (nextSibling) nextSibling.remove()
    }

    match.node.replaceWithText(replacement)

    return {
      filePath: sourceFile.getFilePath(),
      lineNumber: lineNumbers[i],
      before: beforeTexts[i],
      after: replacement,
    }
  })

  return { reports, modified: true }
}

/** Adds `import { maybe } from '@primitives/objects.utils'` to a source file if not already present */
export const addMaybeImport = (sourceFile: SourceFile): void => {
  const existingImport = sourceFile.getImportDeclaration('@primitives/objects.utils')

  if (!existingImport) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@primitives/objects.utils',
      namedImports: ['maybe'],
    })
    return
  }

  const hasMaybe = existingImport.getNamedImports().some(ni => ni.getName() === 'maybe')
  if (!hasMaybe) existingImport.addNamedImport('maybe')
}
