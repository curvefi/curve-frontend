import { useMemo } from 'react'
import { DetailInfo } from '@ui/DetailInfo'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, amount } from '@ui-kit/utils'

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
    if (!Number.isNaN(+priceImpact))
      return `≈${formatNumber(amount(priceImpact), { maximumSignificantDigits: 4, unit: 'percentage', abbreviate: false, fallback: '-' })}`
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
