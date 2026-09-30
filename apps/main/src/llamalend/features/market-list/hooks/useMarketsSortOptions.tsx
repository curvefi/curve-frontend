import type { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { BETA_MARKET_TITLES, BETA_ROE_TITLES, MarketColumnId, POSITION_COLUMN_LABELS } from '../columns'

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
          ...notFalsy(beta && { id: MarketColumnId.UserLiquidationRange, label: t`Liquidation range` }),
          { id: MarketColumnId.UserBorrowed, label: t`Borrow Amount` },
          { id: MarketColumnId.UserCollateral, label: t`Collateral Amount` },
          { id: MarketColumnId.UserLtv, label: t`LTV` },
          ...notFalsy(beta && { id: MarketColumnId.UserLeverage, label: t`Leverage` }),
          { id: MarketColumnId.UserEarnings, label: t`Interest earned` },
          { id: MarketColumnId.UserDeposited, label: beta ? t`Amount supplied` : t`Supplied Amount` },
          { id: MarketColumnId.UserBoostMultiplier, label: t`Boost` },
        ]
      : []),
    ...notFalsy(!beta && { id: MarketColumnId.NetBorrowRate, label: POSITION_COLUMN_LABELS.netBorrowApr }),
    { id: MarketColumnId.BorrowRate, label: t`Borrow APR` },
    ...(beta
      ? [
          { id: MarketColumnId.NetBorrowRate, label: BETA_MARKET_TITLES[MarketColumnId.NetBorrowRate]! },
          { id: MarketColumnId.CollateralYield, label: BETA_MARKET_TITLES[MarketColumnId.CollateralYield]! },
        ]
      : []),
    { id: MarketColumnId.LendRate, label: beta ? BETA_MARKET_TITLES[MarketColumnId.LendRate]! : NET_SUPPLY_RATE_TITLE },
    ...notFalsy(beta && { id: MarketColumnId.NetSupplyRate, label: t`Net supply APY` }),
    { id: MarketColumnId.Tvl, label: t`Total Value Locked` },
    { id: MarketColumnId.MaxLtv, label: t`Max LTV` },
    { id: MarketColumnId.MaxLeverage, label: t`Max leverage` },
    { id: MarketColumnId.MaxReturnOnEquity, label: beta ? BETA_ROE_TITLES.max : t`Max RoE` },
    { id: MarketColumnId.UtilizationPercent, label: t`Utilization` },
    { id: MarketColumnId.LiquidityUsd, label: t`Available Liquidity` },
    { id: MarketColumnId.TotalCollateralUsd, label: t`Total Collateral` },
    { id: MarketColumnId.TotalDebt, label: t`Total Debt` },
  ] satisfies Option<MarketColumnId>[]
}
