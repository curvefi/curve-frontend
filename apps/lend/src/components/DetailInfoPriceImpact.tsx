import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'

import DetailInfo from '@/ui/DetailInfo'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

const DetailInfoPriceImpact = ({
  loading,
  priceImpact = '0',
  isHighImpact,
}: {
  loading: boolean
  priceImpact: string | undefined
  isHighImpact: boolean | undefined
}) => {
  return (
    <DetailInfo
      isBold={isHighImpact}
      variant={isHighImpact ? 'error' : undefined}
      loading={loading}
      loadingSkeleton={[80, 23]}
      label={isHighImpact ? t`High price impact:` : t`Price impact:`}
      tooltip={
        <IconTooltip placement="top end" minWidth="250px">
          {t`Approximate price impact, calculated based on the difference between Oracle price and average swap price.`}
        </IconTooltip>
      }
    >
      {+priceImpact > 0 ? '≈' : ''}
      {formatNumber(priceImpact, { style: 'percent', maximumSignificantDigits: 4 })}
    </DetailInfo>
  )
}

export default DetailInfoPriceImpact
