import {
  STABLESWAP,
  TWOCOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAPNG,
  THREECOINCRYPTOSWAP,
  STABLESWAPOLD,
} from '@/components/PageDeployGauge/constants'

export type PoolType =
  | typeof TWOCOINCRYPTOSWAP
  | typeof TWOCOINCRYPTOSWAPNG
  | typeof THREECOINCRYPTOSWAP
  | typeof STABLESWAP
  | typeof STABLESWAPOLD
  | ''

export type PoolTypes = {
  twoCrypto: boolean
  twoCryptoNg: boolean
  threeCrypto: boolean
  stableswap: boolean
  stableswapOld: boolean
}

export type GaugeType = 'TWOCRYPTO' | 'TWOCRYPTONG' | 'THREECRYPTO' | 'STABLENG' | 'STABLEOLD'
export type DeploymentType = 'MAINNETGAUGE' | 'SIDECHAINGAUGE' | 'MIRRORGAUGE'
