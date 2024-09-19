import type { QueryFunction } from '@tanstack/react-query'
import type { QueryRespUsdRatesMapper, UsdRatesQueryKeyType } from '@/entities/usd-rates'

import useStore from '@/store/useStore'

export const queryUsdRates: QueryFunction<QueryRespUsdRatesMapper, UsdRatesQueryKeyType<'usdRates'>> = async ({
  queryKey,
}) => {
  const [, , , addresses] = queryKey
  const { curve, usdRates } = useStore.getState()

  const usdRatesResp = await Promise.all(addresses.map((address) => curve.getUsdRate(address)))
  const usdRatesMapperResp = addresses.reduce((prev, address, idx) => {
    prev[address] = usdRatesResp[idx]
    return prev
  }, {} as { [address: string]: number })

  const usdRatesMapper = {
    ...usdRates.usdRatesMapper,
    ...usdRatesMapperResp,
  }
  usdRates.setStateByKey('usdRatesMapper', usdRatesMapper)
  return usdRatesMapper
}
