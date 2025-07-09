import type { NetworkUrlParams } from '@/dex/types/main.types'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Disclaimer currentApp="dex" {...params} />
}
