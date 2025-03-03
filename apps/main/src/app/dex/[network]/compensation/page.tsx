import type { Metadata } from 'next'
import PageCompensation from '@/dex/components/PageCompensation/Page'

export const metadata: Metadata = { title: 'Curve - Compensation' }

const CompensationPage = async () => <PageCompensation />

export default CompensationPage
