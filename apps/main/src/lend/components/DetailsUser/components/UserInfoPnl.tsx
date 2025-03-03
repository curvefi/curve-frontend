import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { Api } from '@/lend/types/lend.types'
import styled from 'styled-components'

import { formatNumber, FORMAT_OPTIONS } from '@ui/utils'
import { useUserInfoPositionPnl } from '@/lend/entities/userinfo-position-pnl'

export const UserInfoPnl = ({
  market,
  api,
  rOwmId,
}: {
  market: OneWayMarketTemplate
  api: Api | null
  rOwmId: string
}) => {
  const { signerAddress } = api ?? {}

  const { data: pnl } = useUserInfoPositionPnl({ market, rOwmId, userAddress: signerAddress ?? '' })

  return <Pnl pnl={pnl?.percentage}>{pnl ? formatNumber(+pnl.percentage, { ...FORMAT_OPTIONS.PERCENT }) : '-'}</Pnl>
}

const Pnl = styled.span<{ pnl: string | undefined }>`
  color: ${({ pnl }) =>
    pnl === undefined
      ? 'inherit'
      : +pnl > 0
        ? 'var(--health_mode_healthy--color)'
        : 'var(--health_mode_hard_liquidation--color)'};
`
