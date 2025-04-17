import type { Metadata } from 'next'
import { PageCompensation } from '@/dex/components/PageCompensation/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'

export const metadata: Metadata = { title: 'Compensation - Curve' }

const CompensationPage = async ({ params }: { params: Promise<NetworkUrlParams> }) => (
  <PageCompensation {...await params} />
)

export default CompensationPage
