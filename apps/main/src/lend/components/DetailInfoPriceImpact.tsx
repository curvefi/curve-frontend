import { useMemo } from 'react'
import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoPriceImpact = ({
  loading,
  priceImpact = '0',
  isHighImpact,
}: {
  loading: boolean
  priceImpact: string | undefined
  isHighImpact: boolean | undefined
}) => {
  const formattedPriceImpact = useMemo(() => {
    if (priceImpact === 'N/A') return 'N/A'
    if (!isNaN(+priceImpact)) return `≈${formatNumber(priceImpact, { style: 'percent', maximumSignificantDigits: 4 })}`
    return ''
  }, [priceImpact])

  return (
    <DetailInfo
      isBold={isHighImpact}
      variant={isHighImpact ? 'error' : undefined}
      loading={loading}
      loadingSkeleton={[80, 23]}
      label={isHighImpact ? t`High price impact:` : t`Price impact:`}
    >
      {formattedPriceImpact}
    </DetailInfo>
  )
}
