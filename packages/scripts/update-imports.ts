import { Project } from 'ts-morph'
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
    const imports = file.getImportDeclarations()
    const localImports = imports.filter((i) => i.getModuleSpecifier().getLiteralValue().startsWith('@/'))
    if (!localImports.length) return

    console.log(
      `Found imports in ${app}/${relPath}: ${localImports.map((i) => i.getModuleSpecifier().getLiteralValue())}`,
    )
    localImports.forEach((i) => {
      const specifier = i.getModuleSpecifier().getLiteralValue()
      return i.setModuleSpecifier(
        specifier.startsWith('@/shared/ui/')
          ? specifier.replace('@/shared/ui/', '@ui/shared/ui/')
          : specifier.startsWith('@/ui/')
            ? specifier.replace('@/ui/', '@ui/')
            : specifier.replace('@/', `@${app}/`),
      )
    })

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
