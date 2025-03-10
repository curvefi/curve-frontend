import type { Metadata } from 'next'
import Integrations from '@/loan/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

export const metadata: Metadata = { title: t`Integrations - Curve` }

const IntegrationsPage = async ({ params }: { params: Promise<NetworkUrlParams> }) => <Integrations {...await params} />

export default IntegrationsPage
