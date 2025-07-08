import { PagePoolList } from '@/dex/components/PagePoolList/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from 'react-router-dom'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <PagePoolList {...params} />
}
