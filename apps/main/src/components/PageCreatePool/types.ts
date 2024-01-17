import { CRYPTOSWAP, STABLESWAP, TOKEN_A, TOKEN_B, TOKEN_C, TOKEN_D } from '@/components/PageCreatePool/constants'

export type CreateToken = {
  address: string
  symbol: string
  ethAddress?: string
  haveSameTokenName: boolean
  balance?: string
  volume?: number
  userAddedToken: boolean
  basePool?: boolean
}

export type CreateTokensMapper = {
  [address: string]: CreateToken
}

export type CreateQuickListToken = {
  address: string
  haveSameTokenName?: boolean
  symbol: string
}

export type BasePoolToken = {
  namne: string
  token: string
  pool: string
}

export type PoolPreset = {
  name: string
  descriptionName: string
  description: string
}

export type TokenState = {
  address: string
  symbol: string
  ngAssetType: NgAssetType
  oracleAddress: string
  oracleFunction: string
  basePool: boolean
}

export type SelectTokenFormValues = {
  [TOKEN_A]: TokenState
  [TOKEN_B]: TokenState
  [TOKEN_C]: TokenState
  [TOKEN_D]: TokenState
}

export type SwapType = typeof CRYPTOSWAP | typeof STABLESWAP | ''
export type ImplementationId = 0 | 1 | 2 | 3
export type NgAssetType = 0 | 1 | 2 | 3
export type TokenId = typeof TOKEN_A | typeof TOKEN_B | typeof TOKEN_C | typeof TOKEN_D
