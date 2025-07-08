import Vault from '@/lend/components/PageVault/Page'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import { useParams } from 'react-router'

export default function Component() {
  const params = useParams<MarketUrlParams>()
  return <Vault {...params} />
}
