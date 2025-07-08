import { PageDeployGauge } from '@/dex/components/PageDeployGauge/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from 'react-router-dom'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <PageDeployGauge {...params} />
}
