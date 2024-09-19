import type { ExtractQueryKeyType } from '@/shared/types/api'

import { keys } from '@/entities/signer/model'

export type SignerQueryKeyType<K extends keyof typeof keys> = ExtractQueryKeyType<typeof keys, K>

// query
export type SignerPoolBase = {
  chainId: ChainId | undefined
  signerAddress: string | undefined
  poolId: string | undefined
}

export type SignerPoolBalances = SignerPoolBase & {
  formType?: string
}

export type SignerPoolDetails = SignerPoolBase & {
  gaugeBalance: string
  lpTokenBalance: string
}

// response
export type SignerPoolBalancesMapperResp = {
  [address: string]: string
}

export type UserShareResp = {
  lpUser: string
  lpTotal: string
  lpShare: string
  gaugeUser?: string | undefined
  gaugeTotal?: string | undefined
  gaugeShare?: string | undefined
}

export type SignerPoolDetailsResp = {
  liquidityUsd: string
  crvApy: number | null
  boostApy: string
  userShare: UserShareResp | null
  lpTokenBalances: { [key: string]: string }
}
