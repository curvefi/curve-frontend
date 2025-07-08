import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import type { Route } from './+types/page'

export default function Component({ params }: Route.ComponentProps) {
  const networkParams: NetworkUrlParams = {
    network: params.network,
  }

  return <Disclaimer currentApp="crvusd" {...networkParams} />
}
