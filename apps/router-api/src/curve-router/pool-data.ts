import type { IPoolData } from '@curvefi/api/lib/interfaces'
import type { CurveJS } from './curvejs'

/** Read current pool metadata in Curve's pool-list order without constructing pool instances. */
export const getPoolsData = (curve: CurveJS): (IPoolData & { id: string })[] => {
  const {
    CRVUSD_FACTORY_POOLS_DATA,
    CRYPTO_FACTORY_POOLS_DATA,
    EXTERNAL_POOLS_DATA,
    FACTORY_POOLS_DATA,
    LLAMMAS_DATA,
    POOLS_DATA,
    STABLE_NG_FACTORY_POOLS_DATA,
    TRICRYPTO_FACTORY_POOLS_DATA,
    TWOCRYPTO_FACTORY_POOLS_DATA,
  } = curve.getNetworkConstants()

  // Match Curve's pool-data precedence when an ID appears in multiple maps.
  const poolsData = {
    ...POOLS_DATA,
    ...FACTORY_POOLS_DATA,
    ...CRVUSD_FACTORY_POOLS_DATA,
    ...CRYPTO_FACTORY_POOLS_DATA,
    ...STABLE_NG_FACTORY_POOLS_DATA,
    ...TWOCRYPTO_FACTORY_POOLS_DATA,
    ...TRICRYPTO_FACTORY_POOLS_DATA,
    ...EXTERNAL_POOLS_DATA,
    ...LLAMMAS_DATA,
  }

  return curve.getPoolList().map(id => ({ id, ...poolsData[id] }))
}
