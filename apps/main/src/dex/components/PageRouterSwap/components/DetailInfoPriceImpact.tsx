import { DetailInfo } from '@ui/DetailInfo'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { formatNumber, getFractionDigitsOptions } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoPriceImpact = ({
  loading,
  priceImpact,
  isHighImpact,
}: {
  loading: boolean
  priceImpact: number | undefined | null
  isHighImpact: boolean | undefined
}) => (
  <DetailInfo
    isBold={isHighImpact}
    variant={isHighImpact ? 'error' : undefined}
    loading={loading}
    loadingSkeleton={[80, 23]}
    label={isHighImpact ? t`High price impact:` : t`Price impact:`}
    tooltip={
      <IconTooltip placement="top-end" minWidth="250px">
        {t`Price change in the market that happens when a trader buys or sells an asset.`}
      </IconTooltip>
    }
    testId="price-impact"
  >
    {formatNumber(priceImpact, { style: 'percent', ...getFractionDigitsOptions(priceImpact, 5) })}
  </DetailInfo>
)
