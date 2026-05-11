import { DetailInfo } from '@ui/DetailInfo'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, amount } from '@ui-kit/utils'

export const DetailInfoLeverageAvgPrice = ({
  avgPrice,
  loading,
}: {
  avgPrice: string | undefined
  loading: boolean
}) => (
  <DetailInfo label={t`Expected avg. price:`} loading={loading} loadingSkeleton={[60, 20]}>
    <strong>{formatNumber(amount(avgPrice), { abbreviate: false, fallback: '-' })}</strong>
  </DetailInfo>
)
