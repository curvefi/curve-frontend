import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  isLoaded: boolean
  n: number | null
}

export const DetailInfoN = ({ isLoaded, n }: Props) => (
  <DetailInfo label={t`N:`}>{isLoaded && <strong>{formatNumber(n, { defaultValue: '-' })}</strong>}</DetailInfo>
)
