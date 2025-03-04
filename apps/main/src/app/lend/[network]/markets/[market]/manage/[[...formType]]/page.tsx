import type { Metadata } from 'next'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import LoanManage from '@/lend/components/PageLoanManage/Page'
import React from 'react'
import { getLendMarketSymbols } from '@/app/lend/[network]/markets/[market]/market-name.utils'

type LoanManagePageProps = { params: Promise<MarketUrlParams> }

export const generateMetadata = async ({ params }: LoanManagePageProps): Promise<Metadata> => ({
  title: `${(await getLendMarketSymbols(await params)).join(', ')} | Manage Loan - Curve Lend`,
})

const LoanManagePage = async ({ params }: LoanManagePageProps) => <LoanManage {...await params} />

export default LoanManagePage
