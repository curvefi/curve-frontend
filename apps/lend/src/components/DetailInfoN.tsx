import DetailInfo from '@/ui/DetailInfo'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'



type Props = {
  isLoaded: boolean
  n: number | null
}

const DetailInfoN = ({ isLoaded, n }: Props) => {
  return <DetailInfo label={t`N:`}>{isLoaded && <strong>{formatNumber(n, { defaultValue: '-' })}</strong>}</DetailInfo>
}

export default DetailInfoN
