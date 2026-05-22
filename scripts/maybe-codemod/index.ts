import { Project } from 'ts-morph'
import { collectMatches } from './collect'
import { deduplicateMatches } from './dedup'
import { applyMatches, addMaybeImport } from './transforms'
import { printReport } from './report'
import type { ChangeReport } from './types'

/** Creates and configures the ts-morph project with all source files */
const createProject = (): Project =>
  new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    compilerOptions: { jsx: 2 }, // ReactJSX
  })

/** Checks if a source file should be excluded from transformation (e.g. the maybe definition itself) */
const shouldExclude = (filePath: string): boolean => filePath.endsWith('packages/primitives/src/objects.utils.ts')

/** Adds all .ts/.tsx files from the monorepo to the project, excluding generated/dependency files */
const addSourceFiles = (project: Project): void => {
  project.addSourceFilesAtPaths(['**/*.{ts,tsx}', '!**/node_modules/**', '!**/dist/**', '!**/scripts/**'])
}

/** Main entry point for the maybe codemod */
const main = (): void => {
  const dryRun = process.argv.includes('--dry-run')
  const project = createProject()
  addSourceFiles(project)

  const sourceFiles = project.getSourceFiles().filter(sf => !shouldExclude(sf.getFilePath()))
  const allMatches = sourceFiles.flatMap(collectMatches)
  const deduped = deduplicateMatches(allMatches)

  const allReports: ChangeReport[] = []

  const modifiedFiles = sourceFiles.filter(sf => {
    const { reports, modified } = applyMatches(sf, deduped)
    allReports.push(...reports)
    if (modified) addMaybeImport(sf)
    return modified
  })

  if (!dryRun) project.saveSync()

  printReport(allReports, dryRun)
}

main()
