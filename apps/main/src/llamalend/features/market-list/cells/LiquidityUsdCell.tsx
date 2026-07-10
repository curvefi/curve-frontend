import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { LiquidityUsdTooltipContent } from '@/llamalend/widgets/tooltips/LiquidityUsdTooltipContent'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'

export const LiquidityUsdCell = ({ getValue, row }: CellContext<LlamaMarket, number>) => {
  const { liquidity, assets } = row.original

  return (
    <Tooltip
      title={t`Available liquidity breakdown`}
      body={<LiquidityUsdTooltipContent market={row.original} />}
      placement="top"
    >
      <span>
        <TokenInfo
          address={assets.borrowed.address}
          blockchainId={assets.borrowed.chain}
          iconSize="mui-sm"
          iconPosition="right"
          primary={formatNumber(liquidity, 'token.compact')}
          secondary={formatNumber(getValue(), 'usd.notional')}
          boldPrimary
          sx={{ justifyContent: 'end' }}
        />
      </span>
    </Tooltip>
  )
}
