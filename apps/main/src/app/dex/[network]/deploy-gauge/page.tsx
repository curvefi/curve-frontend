import type { Metadata } from 'next'
import DeployGauge from '@/dex/components/PageDeployGauge/Page'

export const metadata: Metadata = { title: 'Curve - Deploy Gauge' }

const DeployGaugePage = async () => <DeployGauge />

export default DeployGaugePage
