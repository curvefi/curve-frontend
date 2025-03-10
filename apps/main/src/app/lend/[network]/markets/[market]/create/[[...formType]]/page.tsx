import type { Metadata } from 'next'
import { getLendMarketSymbols } from '@/app/lend/[network]/markets/[market]/market-name.utils'
import LoanCreate from '@/lend/components/PageLoanCreate/Page'
import type { MarketUrlParams } from '@/lend/types/lend.types'

type LoanCreatePageProps = { params: Promise<MarketUrlParams> }

export const generateMetadata = async ({ params }: LoanCreatePageProps): Promise<Metadata> => ({
  title: `${(await getLendMarketSymbols(await params)).join(', ')} | Create Loan - Curve Lend`,
})

const LoanCreatePage = async ({ params }: LoanCreatePageProps) => <LoanCreate {...await params} />

export default LoanCreatePage
