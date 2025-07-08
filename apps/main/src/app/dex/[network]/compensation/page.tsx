import { PageCompensation } from '@/dex/components/PageCompensation/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from '@ui-kit/hooks'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <PageCompensation {...params} />
}
