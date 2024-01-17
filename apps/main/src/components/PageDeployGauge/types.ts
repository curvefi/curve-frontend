import {
  STABLESWAP,
  TWOCOINCRYPTOSWAP,
  THREECOINCRYPTOSWAP,
  STABLESWAPOLD,
} from '@/components/PageDeployGauge/constants'

export type PoolType =
  | typeof TWOCOINCRYPTOSWAP
  | typeof THREECOINCRYPTOSWAP
  | typeof STABLESWAP
  | typeof STABLESWAPOLD
  | ''

export type PoolTypes = {
  twoCrypto: boolean
  threeCrypto: boolean
  stableswap: boolean
  stableswapOld: boolean
}

export type GaugeType = 'TWOCRYPTO' | 'THREECRYPTO' | 'STABLENG' | 'STABLEOLD'
export type DeploymentType = 'MAINNETGAUGE' | 'SIDECHAINGAUGE' | 'MIRRORGAUGE'
