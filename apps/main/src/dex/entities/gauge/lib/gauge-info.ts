import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Address } from '@primitives/address.utils'

export const getGauge = (poolAddress: Address) => requireLib('curveApi').getPool(poolAddress).gauge
