import type { Metadata } from 'next'
import { PageCreatePool } from '@/dex/components/PageCreatePool/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'

export const metadata: Metadata = { title: 'Create Pool - Curve' }

const CreatePoolPage = async ({ params }: { params: Promise<NetworkUrlParams> }) => <PageCreatePool {...await params} />

export default CreatePoolPage
