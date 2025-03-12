import type { Metadata } from 'next'
import Integrations from '@/lend/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/lend/types/lend.types'

type IntegrationsPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Integrations - Curve Lend' }

const IntegrationsPage = async ({ params }: IntegrationsPageProps) => <Integrations {...await params} />

export default IntegrationsPage
