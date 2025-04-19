import type { Metadata } from 'next'
import { PageDeployGauge } from '@/dex/components/PageDeployGauge/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'

export const metadata: Metadata = { title: 'Deploy Gauge - Curve' }

const DeployGaugePage = async ({ params }: { params: Promise<NetworkUrlParams> }) => (
  <PageDeployGauge {...await params} />
)

export default DeployGaugePage
