import type { Metadata } from 'next'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import LoanCreate from '@/lend/components/PageLoanCreate/Page'

type LoanCreatePageProps = { params: Promise<MarketUrlParams> }

export const metadata: Metadata = { title: 'Curve - Create Loan' }

const LoanCreatePage = async ({ params }: LoanCreatePageProps) => <LoanCreate {...await params} />

export default LoanCreatePage
