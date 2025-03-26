import type { Metadata } from 'next'
import DeployGauge from '@/dex/components/PageDeployGauge/Page'

export const metadata: Metadata = { title: 'Deploy Gauge - Curve' }

const DeployGaugePage = () => <DeployGauge />

export default DeployGaugePage
