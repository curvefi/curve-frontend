import type { Metadata } from 'next'
import Disclaimer from '@/dex/components/PageDisclaimer/Page'

export const metadata: Metadata = { title: 'Curve - Risk Disclaimer' }

const DisclaimerPage = async () => <Disclaimer />

export default DisclaimerPage
