import type { Metadata } from 'next'
// todo: we import the lend integrations page for now, we should refactor the integrations page to be shared between all apps
// eslint-disable-next-line import/no-restricted-paths
import Integrations from '@/lend/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/llamalend/llamalend.types'

type IntegrationsPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Integrations - Curve Llamalend' }

const IntegrationsPage = async ({ params }: IntegrationsPageProps) => <Integrations {...await params} />

export default IntegrationsPage
