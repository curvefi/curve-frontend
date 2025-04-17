import type { Metadata } from 'next'
import { DaoDisclaimerPage } from '@/dao/components/PageDisclaimer'
import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { t } from '@ui-kit/lib/i18n'
import type { DisclaimerTabId } from '@ui-kit/widgets/Disclaimer/Disclaimer'

export const metadata: Metadata = { title: t`Risk Disclaimer - Curve` }

type DisclaimerPageProps = {
  params: Promise<NetworkUrlParams>
  searchParams: Promise<{ tab?: DisclaimerTabId }>
}

const DisclaimerPage = async ({ params, searchParams }: DisclaimerPageProps) => (
  <DaoDisclaimerPage tab="dex" {...await params} {...await searchParams} />
)

export default DisclaimerPage
