import type { Metadata } from 'next'
import MarketList from '@/llamalend/loan/components/PageMarketList/Page'
import type { CollateralUrlParams } from '@/llamalend/loan/types/loan.types'

type MarketListPageProps = { params: Promise<CollateralUrlParams> }

export const metadata: Metadata = { title: 'Mint Markets - Curve LlamaLend' }

const CreateLoanPage = async ({ params }: MarketListPageProps) => <MarketList {...await params} />

export default CreateLoanPage
