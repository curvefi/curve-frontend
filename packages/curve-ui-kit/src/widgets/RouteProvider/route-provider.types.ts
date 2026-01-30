export const RouteProviders = ['curve', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]
