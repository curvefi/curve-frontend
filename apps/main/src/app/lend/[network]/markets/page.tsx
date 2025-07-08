import MarketList from '@/lend/components/PageMarketList/Page'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { useParams } from 'react-router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <MarketList {...params} />
}
