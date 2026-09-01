import { requireLib } from '@evm-ui/features/connect-wallet'

export const getGauge = (poolId: string) => requireLib('curveApi').getPool(poolId).gauge
