import type { Metadata } from 'next'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import LoanManage from '@/lend/components/PageLoanManage/Page'

type LoanManagePageProps = { params: Promise<MarketUrlParams> }

export const metadata: Metadata = { title: 'Curve - Manage Loan' }

const LoanManagePage = async ({ params }: LoanManagePageProps) => <LoanManage {...await params} />

export default LoanManagePage
