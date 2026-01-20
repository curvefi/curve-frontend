import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  isReady: boolean
  n: number | null
}

export const DetailInfoN = ({ isReady, n }: Props) => (
  <DetailInfo label={t`N:`}>{isReady && <strong>{formatNumber(n, { defaultValue: '-' })}</strong>}</DetailInfo>
)
