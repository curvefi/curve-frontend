import type { SignerPoolBalancesMapperResp } from '@/entities/signer'
import type { PoolTokenListResp } from '@/entities/pool'

import React, { createContext, useContext } from 'react'

export type PoolBaseKeys = { chainId: ChainId | undefined; poolId: string | undefined }

export type FormType =
  | 'DEPOSIT'
  | 'DEPOSIT_STAKE'
  | 'STAKE'
  | 'WITHDRAW'
  | 'UNSTAKE'
  | 'CLAIM'
  | 'CLAIM_CRV'
  | 'CLAIM_REWARDS'
  | 'SWAP'

type PoolContextType = {
  rChainId: ChainId
  rPoolId: string
  curve: CurveApi | null
  chainId: ChainId | undefined
  signerAddress: string | undefined
  formType: FormType
  hasWrapped: boolean
  isWrapped: boolean
  imageBaseUrl: string
  poolBaseKeys: PoolBaseKeys
  poolBaseSignerKeys: PoolBaseKeys & { signerAddress: string | undefined }
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolData: PoolData | undefined
  pool: Pool | undefined
  poolId: string | undefined
  poolAlert: PoolAlert | null
  poolTvl: string
  isSeed: boolean | null
  signerPoolBalances: SignerPoolBalancesMapperResp | undefined
  signerPoolBalancesIsLoading: boolean
  signerPoolBalancesIsError: boolean
  maxSlippage: string
  tokens: PoolTokenListResp['tokens']
  tokensMapper: PoolTokenListResp['tokensMapper']
  scanTxPath: (hash: string) => string
  setFormType: React.Dispatch<React.SetStateAction<FormType>>
  setPoolIsWrapped: (poolId: string, isWrapped: boolean) => void
}

export const PoolContext = createContext<PoolContextType | null>(null)

export const usePoolContext = () => {
  const poolContext = useContext(PoolContext)

  if (!poolContext) {
    throw new Error('usePoolContext has to be used within <PoolContext.Provider>')
  }

  return poolContext
}
