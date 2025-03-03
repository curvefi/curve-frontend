import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { Api } from '@/lend/types/lend.types'

import { useUserInfoPositionLeverage } from '@/lend/entities/userinfo-position-leverage'

export const UserInfoLeverage = ({
  market,
  rOwmId,
  api,
}: {
  market: OneWayMarketTemplate
  rOwmId: string
  api: Api | null
}) => {
  const { signerAddress } = api ?? {}

  const { data: leverage } = useUserInfoPositionLeverage({ market, rOwmId, userAddress: signerAddress ?? '' })

  return <>{leverage ? `${Number(leverage).toFixed(2)}x` : '-'}</>
}
