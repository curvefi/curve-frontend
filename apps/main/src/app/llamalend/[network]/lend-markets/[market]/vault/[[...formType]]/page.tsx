import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getBorrowedSymbol } from '../../market-name.utils'
import Vault from '@/lend/components/PageVault/Page'
import type { MarketUrlParams } from '@/lend/types/lend.types'

type VaultPageProps = { params: Promise<MarketUrlParams> }

export const generateMetadata = async ({ params }: VaultPageProps): Promise<Metadata> => ({
  title: `${await getBorrowedSymbol(...(await Promise.all([params, headers()])))} | Supply - Curve LlamaLend`,
})

const VaultPage = async ({ params }: VaultPageProps) => <Vault {...await params} />

export default VaultPage
