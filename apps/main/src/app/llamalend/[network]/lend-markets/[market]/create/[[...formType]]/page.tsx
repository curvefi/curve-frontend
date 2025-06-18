import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getLendMarketSymbols } from '../../market-name.utils'
import LoanCreate from '@/lend/components/PageLoanCreate/Page'
import type { MarketUrlParams } from '@/lend/types/lend.types'

type LoanCreatePageProps = { params: Promise<MarketUrlParams> }

export const generateMetadata = async ({ params }: LoanCreatePageProps): Promise<Metadata> => ({
  title: `${(await getLendMarketSymbols(...(await Promise.all([params, headers()])))).filter(Boolean).join(', ')} | Create Loan - Curve LlamaLend`,
})

const LoanCreatePage = async ({ params }: LoanCreatePageProps) => <LoanCreate {...await params} />

export default LoanCreatePage
