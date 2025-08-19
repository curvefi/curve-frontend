import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { useParams } from '@ui-kit/hooks/router'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer/Disclaimer'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Disclaimer currentApp="dao" {...params} />
}
