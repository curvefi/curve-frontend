import type { ExtractQueryKeyType } from '@/shared/types/api'
import { ChainParams } from '@/shared/model/query'

export const chainKeys = {
  root: ({ chainId }: ChainParams) => ['chain', chainId] as const,

} as const

export type ChainQueryKeyType<K extends keyof typeof chainKeys> = ExtractQueryKeyType<typeof chainKeys, K>

export type ChainKey = keyof typeof chainKeys
