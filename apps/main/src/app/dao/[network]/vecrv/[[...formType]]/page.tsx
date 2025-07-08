import { PageVeCrv } from '@/dao/components/PageVeCrv/Page'
import type { VeCrvUrlParams } from '@/dao/types/dao.types'
import { useParams } from 'react-router'

export default function Component() {
  const params = useParams() as VeCrvUrlParams
  return <PageVeCrv {...params} />
}
