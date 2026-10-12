import type { Address } from '@primitives/address.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const CrvRateTooltipContent = ({
  crvToken,
  maximumRate,
  unboostedRate,
}: {
  crvToken?: { address: Address; blockchainId: string }
  maximumRate: number | Nullish
  unboostedRate: number | Nullish
}) => (
  <TooltipWrapper>
    <TooltipDescription text={t`CRV gauge reward APR ranges from the unboosted rate to the maximum boosted rate.`} />
    <TooltipDescription text={t`The maximum rate assumes the full 2.5x gauge boost.`} />
    <TooltipItems secondary>
      <TooltipItem title={t`Unboosted`} titleIcon={crvToken && { ...crvToken, size: 'mui-sm' }} variant="independent">
        {formatNumber(unboostedRate, 'percent.rate')}
      </TooltipItem>
      <TooltipItem title={t`Max boost`} titleIcon={crvToken && { ...crvToken, size: 'mui-sm' }} variant="independent">
        {formatNumber(maximumRate, 'percent.rate')}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)
