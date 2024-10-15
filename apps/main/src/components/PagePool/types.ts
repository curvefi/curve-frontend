import { Params } from 'react-router'

export type TransferFormType = 'swap' | 'deposit' | 'withdraw' | 'manage-gauge'

export type PageTransferProps = {
  curve: CurveApi | null
  params: Params
  routerParams: { rChainId: ChainId; rPoolId: string; rFormType: RFormType }
  hasDepositAndStake: boolean
  poolData: PoolData | undefined
  poolDataCacheOrApi: PoolData | PoolDataCache
}

export type DetailInfoTypes = 'user' | 'pool' | 'advanced' | 'gauge'

export type PoolInfoTab = { key: DetailInfoTypes; label: string }
