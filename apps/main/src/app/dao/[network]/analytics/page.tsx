import type { Metadata } from 'next'
import Analytics from '@/dao/components/PageAnalytics/Page'

export const metadata: Metadata = { title: 'Curve - Analytics' }

const AnalyticsPage = () => <Analytics />

export default AnalyticsPage
