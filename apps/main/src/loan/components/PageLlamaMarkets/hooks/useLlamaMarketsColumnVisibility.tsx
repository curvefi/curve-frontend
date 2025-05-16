import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useMediaQuery } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { VisibilityGroup } from '@ui-kit/shared/ui/DataTable'

export const useLlamaMarketsColumnVisibility: () => VisibilityGroup<LlamaMarketColumnId>[] = () => {
  const { isConnected } = useAccount()
  const isMobile = useMediaQuery((t) => t.breakpoints.down('tablet'))
  return useMemo(
    () => [
      {
        label: t`Markets`,
        options: [
          {
            label: t`Available Liquidity`,
            columns: [LlamaMarketColumnId.LiquidityUsd],
            active: true,
            enabled: !isMobile,
          },
          {
            label: t`Utilization`,
            columns: [LlamaMarketColumnId.UtilizationPercent],
            active: true,
            enabled: !isMobile,
          },
        ],
      },
      {
        label: t`Borrow`,
        options: [
          { columns: [LlamaMarketColumnId.BorrowRate], active: true, enabled: true },
          { label: t`Chart`, columns: [LlamaMarketColumnId.BorrowChart], active: true, enabled: !isMobile },
          {
            label: t`Borrow Details`,
            columns: [LlamaMarketColumnId.UserHealth, LlamaMarketColumnId.UserBorrowed],
            active: true,
            enabled: !isMobile && isConnected,
          },
        ],
      },
      {
        label: t`Lend`,
        options: [
          { columns: [LlamaMarketColumnId.LendRate], active: true, enabled: !isMobile },
          { label: t`Chart`, columns: [LlamaMarketColumnId.LendChart], active: false, enabled: !isMobile },
          {
            label: t`Lend Details`,
            columns: [LlamaMarketColumnId.UserEarnings, LlamaMarketColumnId.UserDeposited],
            active: true,
            enabled: !isMobile && isConnected,
          },
        ],
      },
    ],
    [isConnected, isMobile],
  )
}
