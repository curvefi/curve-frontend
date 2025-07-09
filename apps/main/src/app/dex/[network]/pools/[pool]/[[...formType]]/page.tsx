import { PagePool } from '@/dex/components/PagePool/Page'
import { type PoolUrlParams } from '@/dex/types/main.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams<PoolUrlParams>()
  return <PagePool {...params} />
}
