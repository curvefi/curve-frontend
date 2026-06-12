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
import { formatNumber } from '@ui-kit/utils'

const format = (value: number) => formatNumber(value, 'usd.notional')

const TITLE = { Lend: t`Total supplied`, Mint: t`Debt ceiling` }
const TOOLTIP = {
  Lend: t`Total unborrowed supply available for new loans or withdrawals.`,
  Mint: `Remaining borrowing capacity under the DAO-set debt ceiling.`,
}

export const LiquidityUsdTooltipContent = ({
  market: {
    assets: {
      collateral: { balanceUsd },
    },
    totalDebtUsd,
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
        {maybe({ Lend: balanceUsd, Mint: debtCeiling }[type], usd => (
          <TooltipItem title={TITLE[type]}>{format(usd)}</TooltipItem>
        ))}
        <TooltipItem title={t`Total borrowed`}>-{format(totalDebtUsd)}</TooltipItem>
      </TooltipItems>
      <TooltipItems>
        <TooltipItem variant="primary" title={t`Available liquidity`}>
          {format(liquidityUsd)}
        </TooltipItem>
      </TooltipItems>
    </Stack>
  </TooltipWrapper>
)
