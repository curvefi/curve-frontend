import { ImportDeclarationStructure, Project, StatementStructures, StructureKind } from 'ts-morph'
import { execSync } from 'child_process'

const dryRun = false
const apps = ['main', 'dao', 'loan', 'lend']

apps.forEach((app) => {
  const appRoot = `apps/${app}`
  const appRootFull = `${process.cwd()}/${appRoot}/`
  const project = new Project({
    tsConfigFilePath: `${appRoot}/tsconfig.json`,
  })

  const tsFiles = [...project.getSourceFiles('/**/*.ts'), ...project.getSourceFiles('/**/*.tsx')].filter((f) =>
    f.getFilePath().startsWith(appRootFull),
  )

  tsFiles.forEach((file) => {
    const relPath = file.getFilePath().replace(appRootFull, '')
    const structure = file.getStructure()
    const statements = structure.statements as StatementStructures[]
    const imports = statements.filter((s) => s.kind == StructureKind.ImportDeclaration) as ImportDeclarationStructure[]
    const localImports = imports.filter((i) => i.moduleSpecifier.startsWith('@/'))
    if (!localImports.length) return

    console.log(`Found imports in ${app}/${relPath}: ${localImports.map((i) => i.moduleSpecifier)}`)
    localImports.forEach(
      (i) =>
        (i.moduleSpecifier = i.moduleSpecifier.startsWith('@/ui/')
          ? i.moduleSpecifier.replace('@/shared/ui/', '@ui/shared/ui/')
          : i.moduleSpecifier.startsWith('@/ui/')
            ? i.moduleSpecifier.replace('@/ui/', '@ui/')
            : i.moduleSpecifier.replace('@/', `@${app}/`)),
    )
    file.set(structure)
    if (!dryRun) {
      file.saveSync()
    }
  })

  if (!dryRun) {
    project.saveSync()
    console.log(`Project saved. Cleaning up ${appRoot} with eslint`)
    execSync(`yarn eslint --fix ${appRoot}/**/**.ts*`, { stdio: 'inherit' })
  }
})
