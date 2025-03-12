import type { Metadata } from 'next'
import { getBorrowedSymbol } from '@/app/lend/[network]/markets/[market]/market-name.utils'
import Vault from '@/lend/components/PageVault/Page'
import type { MarketUrlParams } from '@/lend/types/lend.types'

type VaultPageProps = { params: Promise<MarketUrlParams> }

export const generateMetadata = async ({ params }: VaultPageProps): Promise<Metadata> => ({
  title: `${await getBorrowedSymbol(await params)} | Supply - Curve Lend`,
})

const VaultPage = async ({ params }: VaultPageProps) => <Vault {...await params} />

export default VaultPage
