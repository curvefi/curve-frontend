/** Keeps live endpoint test coverage in sync with exported async wrapper functions. */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { notFalsy, notFalsyArray } from '@primitives/objects.utils'

export type EndpointModule = string
export type EndpointId = `${EndpointModule}.${string}`

type EndpointCatalogStatus = {
  missing: EndpointId[]
  staleCases: EndpointId[]
  staleExclusions: EndpointId[]
}

const dirnameCurrent = dirname(fileURLToPath(import.meta.url))
const endpointTestsDir = resolve(dirnameCurrent, 'endpoints')
const packageRoot = resolve(dirnameCurrent, '..')
const srcDir = resolve(packageRoot, 'src')
const excludedEndpointIds = new Set<EndpointId>(['solver.getCompetition'])
const exportedAsyncFunctionPattern = /\bexport\s+async\s+function\s+([A-Za-z_$][\w$]*)/g
const runEndpointCasesPattern = /\brunEndpointCases\(\s*['"]([^'"]+)['"]/
const endpointCasePattern = /\bendpointCase\(\s*['"]([^'"]+)['"]/g

export const endpointId = (moduleName: EndpointModule, functionName: string): EndpointId =>
  `${moduleName}.${functionName}`

/** Compares exported async wrappers with live endpoint cases and explicit exclusions. */
export const getEndpointCatalogStatus = (): EndpointCatalogStatus => {
  const exportedEndpointIds = new Set(getExportedAsyncEndpointIds())
  const catalogEndpointIds = new Set(getCatalogEndpointIds())
  const coveredEndpointIds = new Set([...catalogEndpointIds, ...excludedEndpointIds])

  return {
    missing: sortedDifference(exportedEndpointIds, coveredEndpointIds),
    staleCases: sortedDifference(catalogEndpointIds, exportedEndpointIds),
    staleExclusions: sortedDifference(excludedEndpointIds, exportedEndpointIds),
  }
}

/** Returns true when every exported wrapper is tested or intentionally excluded. */
const endpointCatalogIsCurrent = (status: EndpointCatalogStatus) =>
  status.missing.length === 0 && status.staleCases.length === 0 && status.staleExclusions.length === 0

/** Formats catalog drift for the loud catalog test and live-test skip messages. */
const formatEndpointCatalogStatus = (status: EndpointCatalogStatus) =>
  notFalsy(
    status.missing.length && `missing: ${status.missing.join(', ')}`,
    status.staleCases.length && `stale cases: ${status.staleCases.join(', ')}`,
    status.staleExclusions.length && `stale exclusions: ${status.staleExclusions.join(', ')}`,
  )
    .filter(Boolean)
    .join('; ')

/** Returns a memoized skip reason for live tests when the endpoint catalog is stale. */
export const getEndpointCatalogSkipReason = (() => {
  let skipReason: string | undefined

  return () => {
    if (skipReason) {
      return skipReason
    }

    const status = getEndpointCatalogStatus()

    skipReason = endpointCatalogIsCurrent(status)
      ? ''
      : `Endpoint catalog is out of date; skipping live endpoint call. ${formatEndpointCatalogStatus(status)}`

    return skipReason
  }
})()

const sortedDifference = (sourceIds: Iterable<EndpointId>, targetIds: ReadonlySet<EndpointId>) =>
  [...sourceIds].filter(id => !targetIds.has(id)).sort()

const getExportedAsyncEndpointIds = () =>
  readdirSync(srcDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => {
      const indexFile = resolve(srcDir, entry.name, 'index.ts')

      return existsSync(indexFile)
        ? matches(readFileSync(indexFile, 'utf8'), exportedAsyncFunctionPattern).map(functionName =>
            endpointId(entry.name, functionName),
          )
        : []
    })

const getCatalogEndpointIds = () =>
  readdirSync(endpointTestsDir, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(file => file.endsWith('.test.ts'))
    .flatMap(file => getEndpointIdsFromTestFile(resolve(endpointTestsDir, file)))

const getEndpointIdsFromTestFile = (file: string) => {
  const source = readFileSync(file, 'utf8')
  const moduleName = runEndpointCasesPattern.exec(source)?.[1]

  return notFalsyArray(
    moduleName && matches(source, endpointCasePattern).map(functionName => endpointId(moduleName, functionName)),
  )
}

const matches = (source: string, pattern: RegExp) =>
  [...source.matchAll(pattern)].flatMap(match => (match[1] ? [match[1]] : []))
