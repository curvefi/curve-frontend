import type { Metadata } from 'next'
import Integrations from '@/dex/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'

type IntegrationPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Integrations - Curve' }

const IntegrationsPage = async ({ params }: IntegrationPageProps) => <Integrations {...await params} />

export default IntegrationsPage
