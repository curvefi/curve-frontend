import { NetworkUrlParams } from '@/llamalend/llamalend.types'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Disclaimer currentApp="llamalend" {...params} />
}
