import PegKeepers from '@/loan/components/PagePegKeepers/Page'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router.ts'

export default function Component() {
  return <PegKeepers {...useParams<NetworkUrlParams>()} />
}
