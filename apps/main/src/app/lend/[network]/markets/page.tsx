import MarketList from '@/lend/components/PageMarketList/Page'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <MarketList {...params} />
}
