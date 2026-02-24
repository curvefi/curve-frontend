import type { RouteResponse } from '@ui-kit/entities/router-api.query'

export const RouteProviders = ['curve', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]
export type RouteOption = RouteResponse
