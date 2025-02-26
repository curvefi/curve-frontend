import type { Metadata } from 'next'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import MarketList from '@/loan/components/PageMarketList/Page'

type MarketListPageProps = { params: Promise<CollateralUrlParams> }

export const metadata: Metadata = { title: 'Markets - Curve' }

const CreateLoanPage = async ({ params }: MarketListPageProps) => <MarketList {...await params} />

export default CreateLoanPage
