import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoLeverageX = ({
  leverage,
  maxLeverage,
  loading,
}: {
  leverage: string | undefined
  maxLeverage: string | undefined
  loading: boolean
}) => (
  <DetailInfo label={t`Leverage:`} loading={loading} loadingSkeleton={[50, 20]}>
    <strong>{formatNumber(leverage, { maximumFractionDigits: 2, defaultValue: '-' })}x</strong>
    <span>(max {formatNumber(maxLeverage, { maximumFractionDigits: 2, defaultValue: '-' })}x)</span>
  </DetailInfo>
)
