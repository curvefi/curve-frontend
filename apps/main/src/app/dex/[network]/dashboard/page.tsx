import type { Metadata } from 'next'
import { PageDashboard } from '@/dex/components/PageDashboard/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'

type DashboardPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Dashboard - Curve' }

const DashboardPage = async ({ params }: DashboardPageProps) => <PageDashboard {...await params} />

export default DashboardPage
