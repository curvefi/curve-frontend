import { useConnection } from 'wagmi'
import { t } from '@ui-kit/lib/i18n'
import type { Option } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import { LlamaMarketColumnId } from '../columns'

/**
 * Creates a list of select options for sorting the Llama Market table (used for mobile only)
 */
export const useLlamaMarketSortOptions = () => {
  const { isConnected } = useConnection()
  return [
    { id: LlamaMarketColumnId.Assets, label: t`Collateral` },
    ...(isConnected
      ? [
          {
            id: LlamaMarketColumnId.UserHealth,
            label: t`Health`,
          },
          {
            id: LlamaMarketColumnId.UserBorrowed,
            label: t`Borrow Amount`,
          },
          {
            id: LlamaMarketColumnId.UserCollateral,
            label: t`Collateral Amount`,
          },
          {
            id: LlamaMarketColumnId.UserLtv,
            label: t`LTV`,
          },
          {
            id: LlamaMarketColumnId.UserEarnings,
            label: t`My Earnings`,
          },
          {
            id: LlamaMarketColumnId.UserDeposited,
            label: t`Supplied Amount`,
          },
          {
            id: LlamaMarketColumnId.UserBoostMultiplier,
            label: t`Boost`,
          },
        ]
      : []),
    {
      id: LlamaMarketColumnId.BorrowRate,
      label: t`Borrow Rate`,
    },
    {
      id: LlamaMarketColumnId.LendRate,
      label: t`Supply Yield`,
    },
    {
      id: LlamaMarketColumnId.Tvl,
      label: t`Total Value Locked`,
    },
    {
      id: LlamaMarketColumnId.MaxLtv,
      label: t`Max LTV`,
    },
    {
      id: LlamaMarketColumnId.UtilizationPercent,
      label: t`Utilization`,
    },
    {
      id: LlamaMarketColumnId.LiquidityUsd,
      label: t`Available Liquidity`,
    },
    {
      id: LlamaMarketColumnId.TotalCollateralUsd,
      label: t`Total Collateral`,
    },
    {
      id: LlamaMarketColumnId.TotalDebt,
      label: t`Total Debt`,
    },
  ] satisfies Option<LlamaMarketColumnId>[]
}
