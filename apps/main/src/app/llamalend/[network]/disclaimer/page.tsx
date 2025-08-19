import { NetworkUrlParams } from '@/llamalend/llamalend.types'
import { useParams } from '@ui-kit/hooks/router'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Disclaimer currentApp="llamalend" {...params} />
}
