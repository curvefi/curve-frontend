import { PageRouterSwap } from '@/dex/components/PageRouterSwap/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from 'react-router-dom'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <PageRouterSwap {...params} />
}
