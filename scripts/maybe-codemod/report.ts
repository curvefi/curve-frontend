import type { ChangeReport } from './types'

/** Groups change reports by file path */
const groupByFile = (reports: ChangeReport[]): Record<string, ChangeReport[]> =>
  reports.reduce<Record<string, ChangeReport[]>>((acc, report) => {
    ;(acc[report.filePath] ??= []).push(report)
    return acc
  }, {})

/** Prints a summary of all changes to stdout */
export const printReport = (reports: ChangeReport[], dryRun: boolean): void => {
  if (dryRun) console.log('DRY RUN — no files will be modified\n')

  const grouped = groupByFile(reports)
  Object.entries(grouped).forEach(([filePath, changes]) => {
    changes.forEach(change => {
      console.log(`${filePath}:${change.lineNumber}`)
      console.log(`  - ${change.before}`)
      console.log(`  + ${change.after}`)
      console.log()
    })
  })

  console.log(`---`)
  console.log(`${reports.length} transformation(s) across ${Object.keys(grouped).length} file(s)`)
  if (dryRun) console.log('(dry run — no files were modified)')
}
