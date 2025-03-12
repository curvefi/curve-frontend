import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import type { DisclaimerTabId } from '@ui-kit/widgets/Disclaimer/Disclaimer'

export const metadata: Metadata = { title: t`Risk Disclaimer - Curve` }

type DisclaimerPageProps = {
  params: Promise<NetworkUrlParams>
  searchParams: Promise<{ tab?: DisclaimerTabId }>
}

const DisclaimerPage = async ({ params, searchParams }: DisclaimerPageProps) => (
  <Disclaimer tab="crvusd" {...await params} {...await searchParams} />
)

export default DisclaimerPage
