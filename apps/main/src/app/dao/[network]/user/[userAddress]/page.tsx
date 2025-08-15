import { PageUser } from '@/dao/components/PageUser/Page'
import type { UserUrlParams } from '@/dao/types/dao.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams() as UserUrlParams
  return <PageUser {...params} />
}
