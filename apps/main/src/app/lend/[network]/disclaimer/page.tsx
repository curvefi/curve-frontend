import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { useParams } from 'react-router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Disclaimer currentApp="lend" {...params} />
}
