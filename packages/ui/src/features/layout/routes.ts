export const PAGE_INTEGRATIONS = '/integrations' as const
export const PAGE_LEGAL = '/legal' as const

/** Replaces the network segment of an internal URL, preserving its query and fragment. */
export const replaceNetworkInPath = (path: string, blockchainId: string) => {
  const pathname = path.split(/[?#]/, 1)[0]
  const [, app, _network, ...rest] = pathname.split('/')
  if (!app) return path // if no app, return original path
  return ['', app, blockchainId, ...rest].join('/') + path.slice(pathname.length)
}
