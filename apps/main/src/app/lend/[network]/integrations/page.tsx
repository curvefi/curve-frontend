import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import Integrations from '@/lend/components/PageIntegrations/Page'

type IntegrationsPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Curve - Integrations' }

const IntegrationsPage = async ({ params }: IntegrationsPageProps) => <Integrations {...await params} />

export default IntegrationsPage
