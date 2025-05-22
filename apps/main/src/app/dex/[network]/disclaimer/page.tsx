import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { t } from '@ui-kit/lib/i18n'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'

export const metadata: Metadata = { title: t`Risk Disclaimer - Curve` }

type DisclaimerPageProps = {
  params: Promise<NetworkUrlParams>
}

const DisclaimerPage = async ({ params }: DisclaimerPageProps) => <Disclaimer defaultTab="dex" {...await params} />

export default DisclaimerPage
