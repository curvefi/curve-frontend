import type { ReadContractErrorType } from 'viem'
import {
  CRYPTOSWAP,
  STABLESWAP,
  FXSWAP,
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
} from '@/dex/components/PageCreatePool/constants'
import type { CreatePoolSlice } from '@/dex/store/createCreatePoolSlice'
import type { Decimal } from '@ui-kit/utils'

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

export type OracleType = {
  isLoading: boolean
  error: ReadContractErrorType | null
  isSuccess: boolean
  address: string
  functionName: string
  rate: Decimal | undefined
  decimals: number | undefined
}

export type Erc4626Type = {
  isErc4626: boolean | undefined
  isLoading: boolean
  error: ReadContractErrorType | null
  isSuccess: boolean
}

export type TokenState = {
  address: string
  symbol: string
  ngAssetType: NgAssetType
  basePool: boolean
  erc4626: Erc4626Type
  oracle: OracleType
}

export type TokensInPoolState = CreatePoolSlice['createPool']['tokensInPool']

export type SelectTokenFormValues = {
  [TOKEN_A]: TokenState
  [TOKEN_B]: TokenState
  [TOKEN_C]: TokenState
  [TOKEN_D]: TokenState
  [TOKEN_E]: TokenState
  [TOKEN_F]: TokenState
  [TOKEN_G]: TokenState
  [TOKEN_H]: TokenState
}

export type SwapType = typeof CRYPTOSWAP | typeof STABLESWAP | typeof FXSWAP | ''
export type NgAssetType = 0 | 1 | 2 | 3
export type TokenId =
  | typeof TOKEN_A
  | typeof TOKEN_B
  | typeof TOKEN_C
  | typeof TOKEN_D
  | typeof TOKEN_E
  | typeof TOKEN_F
  | typeof TOKEN_G
  | typeof TOKEN_H
