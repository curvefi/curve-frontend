import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer/Disclaimer'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams() as NetworkUrlParams
  return <Disclaimer currentApp="dao" {...params} />
}
