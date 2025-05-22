import { useAccount } from 'wagmi'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { t } from '@ui-kit/lib/i18n'
import type { Option } from '@ui-kit/shared/ui/DataTable/SelectFilter'

/**
 * Creates a list of select options for sorting the Llama Market table (used for mobile only)
 */
export const useLlamaMarketSortOptions = () => {
  const { isConnected } = useAccount()
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
            id: LlamaMarketColumnId.UserEarnings,
            label: t`My Earnings`,
          },
          {
            id: LlamaMarketColumnId.UserDeposited,
            label: t`Supplied Amount`,
          },
        ]
      : []),
    {
      id: LlamaMarketColumnId.BorrowRate,
      label: t`7D Avg Borrow Rate`,
    },
    {
      id: LlamaMarketColumnId.LendRate,
      label: t`7D Avg Supply Yield`,
    },
    {
      id: LlamaMarketColumnId.UtilizationPercent,
      label: t`Utilization`,
    },
    {
      id: LlamaMarketColumnId.LiquidityUsd,
      label: t`Available Liquidity`,
    },
  ] satisfies Option<LlamaMarketColumnId>[]
}
