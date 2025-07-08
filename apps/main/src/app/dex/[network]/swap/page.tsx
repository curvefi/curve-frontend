import { PageRouterSwap } from '@/dex/components/PageRouterSwap/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from '@ui-kit/hooks'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <PageRouterSwap {...params} />
}
