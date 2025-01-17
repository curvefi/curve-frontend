import {
  InterfaceDeclarationStructure,
  ModuleDeclarationStructure,
  Project,
  StatementStructures,
  StructureKind,
  TypeAliasDeclarationStructure,
} from 'ts-morph'
import child_process from 'child_process'

const dryRun = false
const apps = ['main', 'dao', 'loan', 'lend']

apps.forEach((app) => {
  const appRoot = `apps/${app}`
  const appRootFull = `${process.cwd()}/${appRoot}/`
  const project = new Project({
    tsConfigFilePath: `${appRoot}/tsconfig.json`,
  })

  const typeFiles = project.getSourceFiles('/**/*.d.ts').filter((f) => f.getFilePath().startsWith(appRootFull))

  typeFiles.forEach((typeFile) => {
    if (typeFile.getBaseName() !== 'global.d.ts') {
      throw new Error(`Unknown type file: ${typeFile.getBaseName()} at ${typeFile.getFilePath()}`)
    }

    const statements = typeFile.getStructure().statements as StatementStructures[]
    const moduleIndex = statements.findIndex((s) => s.kind == StructureKind.Module)

    const mod = statements[moduleIndex] as ModuleDeclarationStructure
    const declarations = mod.statements as (InterfaceDeclarationStructure | TypeAliasDeclarationStructure)[]

    console.log(`Found type definitions in ${typeFile.getFilePath()}: ${declarations.map((decl) => decl.name)}`)

    // remove from the `declare global` block and export types
    declarations.forEach((decl) => (decl.isExported = true))
    mod.statements = []
    statements.splice(moduleIndex, 1, ...declarations)
    typeFile.set({ statements })

    // rename the file
    const destination = typeFile.getFilePath().replace('global.d.ts', `${app}.types.ts`)
    console.log(`Moving type definitions to ${destination}`)
    if (!dryRun) {
      typeFile.saveSync()
      typeFile.move(destination)
    }

    const tsFiles = [...project.getSourceFiles('/**/*.ts'), ...project.getSourceFiles('/**/*.tsx')].filter(
      (f) => f.getFilePath().startsWith(appRootFull) && f.getFilePath() != destination,
    )
    console.log(`Adding import statement to ${tsFiles.map((f) => f.getFilePath().replace(appRootFull, ''))}`)
    tsFiles.forEach((sourceFile) =>
      sourceFile.addImportDeclaration({
        moduleSpecifier: `@/types/${app}.types`,
        namedImports: declarations.map((decl) => decl.name),
      }),
    )
  })

  if (!dryRun) {
    project.saveSync()
    console.log(`Project saved. Cleaning up unused imports in ${appRoot} with eslint`)
    child_process.execSync(`yarn eslint --fix ${appRoot}`, { stdio: 'inherit' })
  }
})
