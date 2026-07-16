import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { MarketType } from '@ui-kit/types/market'
import { formatNumber, formatToken } from '@ui-kit/utils'

const TITLE = { Lend: t`Total supplied`, Mint: t`Debt ceiling` }
const TOOLTIP = {
  Lend: t`Total unborrowed supply available for new loans or withdrawals.`,
  Mint: t`Remaining borrowing capacity under the DAO-set debt ceiling.`,
}

export const LiquidityUsdTooltipContent = ({
  market: {
    assets: { borrowed },
    liquidity,
    liquidityUsd,
    debtCeiling,
    type,
  },
}: {
  market: LlamaMarket
}) => (
  <TooltipWrapper>
    <TooltipDescription text={TOOLTIP[type]} />
    <Stack>
      <TooltipItems secondary>
        {maybe(type === MarketType.Lend ? liquidity + (borrowed.balance ?? 0) : debtCeiling, total => (
          <TooltipItem title={TITLE[type]}>{formatToken(total, borrowed.symbol)}</TooltipItem>
        ))}
        <TooltipItem title={t`Total borrowed`}>-{formatToken(borrowed.balance, borrowed.symbol)}</TooltipItem>
      </TooltipItems>
      <TooltipItems>
        <TooltipItem variant="primary" title={t`Available liquidity`}>
          {formatToken(liquidity, borrowed.symbol)}
          {formatNumber(liquidityUsd, 'usd.notional')}
        </TooltipItem>
      </TooltipItems>
    </Stack>
  </TooltipWrapper>
)
