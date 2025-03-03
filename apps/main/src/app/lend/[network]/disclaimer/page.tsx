import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import Disclaimer from '@/lend/components/PageDisclaimer/Page'

type DisclaimerPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Curve - Risk Disclaimer' }

const DisclaimerPage = async ({ params }: DisclaimerPageProps) => <Disclaimer {...await params} />

export default DisclaimerPage
