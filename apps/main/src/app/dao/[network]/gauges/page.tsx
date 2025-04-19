import type { Metadata } from 'next'
import { PageGauges } from '@/dao/components/PageGauges/Page'

export const metadata: Metadata = { title: 'Gauges - Curve' }

const GaugesPage = () => <PageGauges />

export default GaugesPage
