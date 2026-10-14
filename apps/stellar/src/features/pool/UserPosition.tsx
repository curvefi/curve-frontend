import type { ReactNode } from 'react'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import type { PoolQuery } from '@/stellar/queries/query-types'
import type { LitePool } from '@curvefi/prices-api/pools'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { Tabs } from '@ui/components/Tabs/Tabs'
import { LiquidityDetails } from '@ui/features/pools/liquidity-details/LiquidityDetails'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { useLiquidityDetails } from './useLiquidityDetails'

const menu = [{ value: 'liquidityDetails', label: t`Liquidity Details`, component: LiquidityDetails }]

const Content = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
)

export const UserPosition = ({
  litePool,
  totalUsd,
  ...params
}: PoolQuery & { litePool: QueryProp<LitePool | null>; totalUsd: QueryProp<Decimal> }) => {
  const { address } = useWallet()
  const details = useLiquidityDetails(params, litePool, totalUsd)
  const balance = details.metrics.lpTokenTotal
  return address && (details.hasPosition || balance.isLoading || balance.error) ? (
    <Stack>
      <Tabs menu={menu} params={{ blockchainId: params.network, ...details }} ContentWrapper={Content} />
    </Stack>
  ) : null
}
