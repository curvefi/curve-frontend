import { getLib, requireLib, useConnection } from '@ui-kit/features/connect-wallet'
import { type ChainId, Curve, type LendApi } from './types/loan.types'

// combined object to use the useConnection() hook, this will be replaced by llamalend-js soon
export type TempApi = { stablecoin: Curve; lend: LendApi; chainId: ChainId; signerAddress: string | undefined }

export const useLendConnection = () => {
  const { lib, ...props } = useConnection<TempApi>()
  return { lib: lib?.lend, ...props }
}

export const useStablecoinConnection = () => {
  const { lib, ...props } = useConnection<TempApi>()
  return { lib: lib?.stablecoin, ...props }
}

export const getLend = () => getLib<TempApi>()?.lend
export const getStablecoin = () => getLib<TempApi>()?.stablecoin
export const requireStablecoin = () => requireLib<TempApi>().stablecoin
