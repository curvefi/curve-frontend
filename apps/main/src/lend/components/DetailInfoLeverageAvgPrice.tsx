import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoLeverageAvgPrice = ({
  avgPrice,
  loading,
}: {
  avgPrice: string | undefined
  loading: boolean
}) => (
  <DetailInfo label={t`Expected avg. price:`} loading={loading} loadingSkeleton={[60, 20]}>
    <strong>{formatNumber(avgPrice, { defaultValue: '-' })}</strong>
  </DetailInfo>
)
