import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { useParams } from '@ui-kit/hooks/router.ts'

export default function Component() {
  return <Disclaimer currentApp="crvusd" {...useParams<NetworkUrlParams>()} />
}
