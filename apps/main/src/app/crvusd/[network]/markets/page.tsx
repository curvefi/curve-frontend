import MarketList from '@/loan/components/PageMarketList/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router.ts'

export default function Component() {
  return <MarketList {...useParams<CollateralUrlParams>()} />
}
