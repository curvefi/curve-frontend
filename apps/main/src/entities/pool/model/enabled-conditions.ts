import { ChainQueryParams } from '@/entities/chain/types'
import { checkChainValidity } from '@/entities/chain/lib/validation'

export const enabledPools = (params: ChainQueryParams) => checkChainValidity(params)
