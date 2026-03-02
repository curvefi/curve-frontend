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

export const TvlTooltipContent = ({
  market: { totalCollateralUsd, liquidityUsd, tvl, type },
}: {
  market: LlamaMarket
}) => (
  <TooltipWrapper>
    {type === LlamaMarketType.Lend ? (
      <>
        <TooltipDescription text={t`Combined USD value of all assets in this lending market.`} />
        <TooltipDescription text={t`Calculated as collateral held in the AMM plus available vault liquidity.`} />
        <Stack>
          <TooltipItems secondary>
            <TooltipItem title={t`Total collateral`}>{format(totalCollateralUsd)}</TooltipItem>
            <TooltipItem title={t`Available liquidity`}>{format(liquidityUsd)}</TooltipItem>
          </TooltipItems>
          <TooltipItems>
            <TooltipItem variant="primary" title={t`TVL`}>
              {format(tvl)}
            </TooltipItem>
          </TooltipItems>
        </Stack>
      </>
    ) : (
      <>
        <TooltipDescription text={t`Combined USD value of all collateral deposited in this mint market.`} />
        <Stack>
          <TooltipItems secondary>
            <TooltipItem title={t`Total collateral value`}>{format(tvl)}</TooltipItem>
          </TooltipItems>
        </Stack>
      </>
    )}
  </TooltipWrapper>
)
