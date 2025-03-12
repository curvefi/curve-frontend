import type { Metadata } from 'next'
import Gauges from '@/dao/components/PageGauges/Page'

export const metadata: Metadata = { title: 'Gauges - Curve' }

const GaugesPage = () => <Gauges />

export default GaugesPage
