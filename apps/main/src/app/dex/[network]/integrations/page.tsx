import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import Integrations from '@/dex/components/PageIntegrations/Page'

type IntegrationPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Curve - Integrations' }

const IntegrationsPage = async ({ params }: IntegrationPageProps) => <Integrations {...await params} />

export default IntegrationsPage
