import { t } from '@ui-kit/lib/i18n'
import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Integrations from '@/loan/components/PageIntegrations/Page'

export const metadata: Metadata = { title: t`Integrations - Curve` }

const IntegrationsPage = async ({ params }: { params: Promise<NetworkUrlParams> }) => <Integrations {...await params} />

export default IntegrationsPage
