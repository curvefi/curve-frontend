import DetailInfo from '@/ui/DetailInfo'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'



type Props = {
  isReady: boolean
  n: number | null
}

const DetailInfoN = ({ isReady, n }: Props) => {
  return <DetailInfo label={t`N:`}>{isReady && <strong>{formatNumber(n, { defaultValue: '-' })}</strong>}</DetailInfo>
}

export default DetailInfoN
