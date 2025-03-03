import type { Metadata } from 'next'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import Vault from '@/lend/components/PageVault/Page'

type VaultPageProps = { params: Promise<MarketUrlParams> }

export const metadata: Metadata = { title: 'Curve - Vault' }

const VaultPage = async ({ params }: VaultPageProps) => <Vault {...await params} />

export default VaultPage
