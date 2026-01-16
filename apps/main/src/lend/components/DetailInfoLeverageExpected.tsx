import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoLeverageExpected = ({
  total,
  loading,
  swapToSymbol,
}: {
  total: string | undefined
  loading: boolean
  swapToSymbol: string | undefined
}) => (
  <DetailInfo label={t`Expected`} loading={loading} loadingSkeleton={[50, 20]}>
    <strong>
      {formatNumber(total, { defaultValue: '-' })} {swapToSymbol}
    </strong>
  </DetailInfo>
)
