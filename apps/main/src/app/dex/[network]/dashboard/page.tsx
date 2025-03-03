import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import Dashboard from '@/dex/components/PageDashboard/Page'

type DashboardPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Curve - Dashboard' }

const DashboardPage = async ({ params }: DashboardPageProps) => <Dashboard {...await params} />

export default DashboardPage
