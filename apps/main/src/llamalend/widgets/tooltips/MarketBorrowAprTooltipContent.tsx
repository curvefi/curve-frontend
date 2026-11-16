import { type CollateralYields, getCollateralYieldLines, sumCollateralYields } from '@/llamalend/collateral-yields'
import {
  BORROW_APR_DESCRIPTION,
  BORROW_RATE_TITLE,
  COLLATERAL_REWARDS_TITLE,
  COLLATERAL_YIELD_TITLE,
  NET_BORROW_APR_DESCRIPTION,
  NET_BORROW_RATE_TITLE,
} from '@/llamalend/constants'
import { hasEstimatedNetBorrowApr } from '@/llamalend/llama.utils'
import type { ExtraIncentive } from '@evm-ui/types/market'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { type Nullish, maybe, maybes } from '@primitives/objects.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { t } from '@ui/lib/i18n'
import { formatCappedRatePercent } from '@ui/lib/rates.utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

export type MarketBorrowAprTooltipContentProps = {
  borrowApr: number | Nullish
  averageApr: number | Nullish
  totalBorrowApr: number | Nullish
  totalAverageBorrowApr: number | Nullish
  periodLabel: string // e.g. "7D", "30D"
  extraRewards: CampaignRewards[] | Nullish
  collateralYields: CollateralYields | Nullish
  collateralSymbol: string | Nullish
  isLoading?: boolean
}

export const MarketBorrowAprTooltipContent = ({
  borrowApr,
  totalBorrowApr,
  totalAverageBorrowApr,
  averageApr,
  periodLabel,
  extraRewards,
  collateralYields,
  collateralSymbol,
  isLoading,
}: MarketBorrowAprTooltipContentProps) => {
  const hasNetRate = hasEstimatedNetBorrowApr({ extraRewards, collateralYields })
  const collateralYieldApr = maybe(collateralYields, yields => sumCollateralYields(yields, 'collateral'))
  const collateralRewards: ExtraIncentive[] =
    maybes([collateralYields, collateralSymbol], (yields, symbol) =>
      getCollateralYieldLines(yields, 'crv', symbol).map(({ label, apr }) => ({
        title: label,
        percentage: -apr,
        address: MAINNET_CRV_ADDRESS,
        blockchainId: 'ethereum',
      })),
    ) ?? []
  return (
    <TooltipWrapper>
      <TooltipDescription text={BORROW_APR_DESCRIPTION} />

      {hasNetRate && <TooltipDescription text={NET_BORROW_APR_DESCRIPTION} />}

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={BORROW_RATE_TITLE}>{formatCappedRatePercent(borrowApr)}</TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {formatCappedRatePercent(averageApr)}
          </TooltipItem>
        </TooltipItems>

        {!!extraRewards?.length && (
          <TooltipItems secondary>
            <RewardsTooltipItems title={t`Borrowing incentives`} tooltipType="borrow" extraRewards={extraRewards} />
          </TooltipItems>
        )}

        {collateralYieldApr != null && (
          <TooltipItems secondary>
            <TooltipItem title={COLLATERAL_YIELD_TITLE}>{formatCappedRatePercent(-collateralYieldApr)}</TooltipItem>
            {maybes([collateralYields, collateralSymbol], (yields, symbol) =>
              getCollateralYieldLines(yields, 'collateral', symbol).map(({ label, apr }) => (
                <TooltipItem key={label} variant="subItem" title={label}>
                  {formatCappedRatePercent(-apr)}
                </TooltipItem>
              )),
            )}
          </TooltipItems>
        )}

        {collateralRewards.length > 0 && (
          <TooltipItems secondary>
            <RewardsTooltipItems
              title={COLLATERAL_REWARDS_TITLE}
              tooltipType="borrow"
              extraRewards={[]}
              extraIncentives={collateralRewards}
            />
          </TooltipItems>
        )}

        {totalBorrowApr != null && hasNetRate && (
          <TooltipItems>
            <TooltipItem variant="primary" title={NET_BORROW_RATE_TITLE}>
              {formatCappedRatePercent(totalBorrowApr)}
            </TooltipItem>
            <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
              {formatCappedRatePercent(totalAverageBorrowApr)}
            </TooltipItem>
          </TooltipItems>
        )}
      </Stack>
    </TooltipWrapper>
  )
}
