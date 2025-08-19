import CrvStaking from '@/loan/components/PageCrvUsdStaking/Page'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  return <CrvStaking {...useParams<NetworkUrlParams>()} />
}
