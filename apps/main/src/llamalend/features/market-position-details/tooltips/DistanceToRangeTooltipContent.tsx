import { getBandCount } from '@/llamalend/health.utils'
import { useUserBands } from '@/llamalend/queries/user/user-bands.query'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import type { QueryProp, Range } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

type DistanceToRangeTooltipContentProps = {
  userPrices: QueryProp<Range<Decimal> | null>
  params: UserMarketParams
  priceUnit: string
}

export const DistanceToRangeTooltipContent = ({
  userPrices: { data: rangePrices },
  params,
  priceUnit,
}: DistanceToRangeTooltipContentProps) => {
  const { data: bands } = useUserBands(params)
  const [lowerBoundary, upperBoundary] = rangePrices ?? []
  const formatPrice = (price: Decimal | undefined) =>
    maybe(price, price => `${formatNumber(price, 'token.precise')} ${priceUnit}`) ?? UNAVAILABLE_NOTATION
  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Price change needed to reach the liquidation range: − for a drop from above, + for a rise from below.`}
      />
      <TooltipItems secondary>
        <TooltipItem title={t`Upper boundary`} variant="independent">
          {formatPrice(upperBoundary)}
        </TooltipItem>
        <TooltipItem title={t`Lower boundary`} variant="independent">
          {formatPrice(lowerBoundary)}
        </TooltipItem>
        <TooltipItem title={t`Band count`} variant="independent">
          {maybe(bands, getBandCount) ?? UNAVAILABLE_NOTATION}
        </TooltipItem>
        <TooltipItem title={t`Bands`} variant="independent">
          {maybe(bands, ([n1, n2]) => t`${n1} to ${n2}`) ?? UNAVAILABLE_NOTATION}
        </TooltipItem>
      </TooltipItems>
      <TooltipFooter>
        {t`Conversion losses may persist after price recovery. The lower boundary is not the hard-liquidation price.`}
      </TooltipFooter>
    </TooltipWrapper>
  )
}
