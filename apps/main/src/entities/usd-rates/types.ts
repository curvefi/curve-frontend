import type { ExtractQueryKeyType } from '@/shared/types/api'

import { keys } from '@/entities/usd-rates/model'

// keys
export type UsdRatesQueryKeyType<K extends keyof typeof keys> = ExtractQueryKeyType<typeof keys, K>

// query
export type QueryBase = {
  chainId: ChainId | undefined
}

export type QueryUsdRates = QueryBase & {
  addresses: string[]
}

export type QueryRespUsdRatesMapper = { [tokenAddress: string]: number | undefined }
