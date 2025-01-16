import { t } from '@lingui/macro'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'

import DetailInfo from '@/ui/DetailInfo'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

const DetailInfoPriceImpact = ({
  loading,
  priceImpact,
  isHighImpact,
}: {
  loading: boolean
  priceImpact: number | null
  isHighImpact: boolean | null
}) => (
  <DetailInfo
    isBold={isHighImpact}
    variant={isHighImpact ? 'error' : undefined}
    loading={loading}
    loadingSkeleton={[80, 23]}
    label={isHighImpact ? t`High price impact:` : t`Price impact:`}
    tooltip={
      <IconTooltip placement="top end" minWidth="250px">
        {t`Price change in the market that happens when a trader buys or sells an asset.`}
      </IconTooltip>
    }
  >
    {formatNumber(priceImpact, { style: 'percent', ...getFractionDigitsOptions(priceImpact, 5) })}
  </DetailInfo>
)

export default DetailInfoPriceImpact
