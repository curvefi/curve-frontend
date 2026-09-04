import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { LiquidityUsdTooltipContent } from '@/llamalend/widgets/tooltips/LiquidityUsdTooltipContent'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import type { CellContext } from '@tanstack/react-table'
import { TokenInfo } from '@ui/components/TokenInfo'
import { Tooltip } from '@ui/components/Tooltip'
import { t } from '@ui/lib/i18n'

export const LiquidityUsdCell = ({ getValue, row }: CellContext<CurveTableFeatures, LlamaMarketRow, number>) => {
  const { liquidity, assets } = row.original

  return (
    <Tooltip
      title={t`Available liquidity breakdown`}
      body={<LiquidityUsdTooltipContent market={row.original} />}
      placement="top"
    >
      <Box>
        <TokenInfo
          address={assets.borrowed.address}
          blockchainId={assets.borrowed.chain}
          iconSize="mui-sm"
          iconPosition="right"
          iconAlignment="start"
          primary={formatNumber(liquidity, 'token.compact')}
          secondary={formatNumber(getValue(), 'usd.notional')}
          boldPrimary
          sx={{ justifyContent: 'end' }}
        />
      </Box>
    </Tooltip>
  )
}
