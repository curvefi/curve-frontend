import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { t } from '@ui-kit/lib/i18n'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'

export const metadata: Metadata = { title: t`Risk Disclaimer - Curve Lend` }

type DisclaimerPageProps = {
  params: Promise<NetworkUrlParams>
}

const DisclaimerPage = async ({ params }: DisclaimerPageProps) => <Disclaimer defaultTab="lend" {...await params} />

export default DisclaimerPage
