import type { Metadata } from 'next'
import Gauges from '@/dao/components/PageGauges/Page'

export const metadata: Metadata = { title: 'Curve - Gauges' }

const GaugesPage = () => <Gauges />

export default GaugesPage
