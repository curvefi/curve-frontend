import { PagePoolList } from '@/dex/components/PagePoolList/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <PagePoolList {...params} />
}
