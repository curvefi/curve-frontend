import { PagePool } from '@/dex/components/PagePool/Page'
import { type PoolUrlParams } from '@/dex/types/main.types'
import { useParams } from 'react-router-dom'

export default function Component() {
  const params = useParams<PoolUrlParams>()
  return <PagePool {...params} />
}
