import PegKeepers from '@/loan/components/PagePegKeepers/Page'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import type { Route } from './+types/page'

export default function Component({ params }: Route.ComponentProps) {
  const networkParams: NetworkUrlParams = {
    network: params.network,
  }

  return <PegKeepers {...networkParams} />
}
