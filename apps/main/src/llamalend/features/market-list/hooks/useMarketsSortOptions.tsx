import type { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { MarketColumnId } from '../columns'

type Option<T = string> = { id: T; label: ReactNode }

/** Creates a list of select options for sorting the Llama Market table (used for mobile only) */
export const useMarketsSortOptions = () => {
  const { isConnected } = useConnection()
  const beta = useNewLlamalendHealth()
  return [
    { id: MarketColumnId.Assets, label: t`Collateral` },
    ...(isConnected
      ? [
          { id: MarketColumnId.UserHealth, label: t`Health` },
          ...notFalsy(beta && { id: MarketColumnId.UserLiquidationBuffer, label: t`Liquidation buffer` }),
          { id: MarketColumnId.UserBorrowed, label: t`Borrow Amount` },
          { id: MarketColumnId.UserCollateral, label: t`Collateral Amount` },
          { id: MarketColumnId.UserLtv, label: t`LTV` },
          ...notFalsy(beta && { id: MarketColumnId.UserLeverage, label: t`Leverage` }),
          { id: MarketColumnId.UserEarnings, label: t`My Earnings` },
          { id: MarketColumnId.UserDeposited, label: t`Supplied Amount` },
          { id: MarketColumnId.UserBoostMultiplier, label: t`Boost` },
        ]
      : []),
    ...notFalsy(beta ? undefined : { id: MarketColumnId.NetBorrowRate, label: t`Net borrow APR` }),
    { id: MarketColumnId.BorrowRate, label: t`Borrow APR` },
    ...(beta
      ? [
          { id: MarketColumnId.NetBorrowRate, label: t`Net Borrow APR` },
          { id: MarketColumnId.CollateralYield, label: t`Collateral yield` },
        ]
      : []),
    { id: MarketColumnId.LendRate, label: NET_SUPPLY_RATE_TITLE },
    { id: MarketColumnId.Tvl, label: t`Total Value Locked` },
    { id: MarketColumnId.MaxLtv, label: t`Max LTV` },
    { id: MarketColumnId.MaxLeverage, label: t`Max leverage` },
    { id: MarketColumnId.MaxReturnOnEquity, label: t`Max RoE` },
    { id: MarketColumnId.UtilizationPercent, label: t`Utilization` },
    { id: MarketColumnId.LiquidityUsd, label: t`Available Liquidity` },
    { id: MarketColumnId.TotalCollateralUsd, label: t`Total Collateral` },
    { id: MarketColumnId.TotalDebt, label: t`Total Debt` },
  ] satisfies Option<MarketColumnId>[]
}
