import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { Api } from '@/lend/types/lend.types'

import { useUserInfoPositionLeverage } from '@/lend/entities/userinfo-position-leverage'

export const UserInfoLeverage = ({ market, api }: { market: OneWayMarketTemplate; api: Api | null }) => {
  const { signerAddress } = api ?? {}

  const { data: leverage } = useUserInfoPositionLeverage({ market, userAddress: signerAddress ?? '' })

  return <>{leverage ? `${Number(leverage).toFixed(2)}x` : '-'}</>
}
