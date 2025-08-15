import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'

export default function Component() {
  return <Disclaimer currentApp="crvusd" {...useParams<NetworkUrlParams>()} />
}
