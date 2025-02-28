import type { Metadata } from 'next'
import Disclaimer from '@/dao/components/PageDisclaimer/Page'

export const metadata: Metadata = { title: 'Curve - Risk Disclaimer' }

const DisclaimerPage = () => <Disclaimer />

export default DisclaimerPage
