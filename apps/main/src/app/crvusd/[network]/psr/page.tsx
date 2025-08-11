import { Page } from '@/loan/components/PagePegKeepers'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router.ts'

export default function PegKeepers() {
  return <Page {...useParams<NetworkUrlParams>()} />
}
