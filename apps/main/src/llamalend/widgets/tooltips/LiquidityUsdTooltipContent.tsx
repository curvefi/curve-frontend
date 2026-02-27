import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'

const format = (value: number) => formatNumber(value, { currency: 'USD', notation: 'compact' })

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
    {type === LlamaMarketType.Lend ? (
      <TooltipDescription text={t`Total unborrowed supply available for new loans or withdrawals.`} />
    ) : (
      <TooltipDescription text={t`Remaining borrowing capacity under the DAO-set debt ceiling.`} />
    )}
    <Stack>
      <TooltipItems secondary>
        {type === LlamaMarketType.Lend
          ? balanceUsd != null && <TooltipItem title={t`Total supplied`}>{format(balanceUsd)}</TooltipItem>
          : debtCeiling != null && <TooltipItem title={t`Debt ceiling`}>{format(debtCeiling)}</TooltipItem>}
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
