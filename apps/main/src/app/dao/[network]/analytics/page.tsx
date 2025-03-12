import type { Metadata } from 'next'
import Analytics from '@/dao/components/PageAnalytics/Page'

export const metadata: Metadata = { title: 'Analytics - Curve' }

const AnalyticsPage = () => <Analytics />

export default AnalyticsPage
