import type { Metadata } from 'next'
import { NetworkUrlParams } from '@/llamalend/llamalend.types'
import { t } from '@ui-kit/lib/i18n'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'

export const metadata: Metadata = { title: t`Risk Disclaimer - Curve Llamalend` }

type DisclaimerPageProps = {
  params: Promise<NetworkUrlParams>
}

const DisclaimerPage = async ({ params }: DisclaimerPageProps) => (
  <Disclaimer currentApp="llamalend" {...await params} />
)

export default DisclaimerPage
