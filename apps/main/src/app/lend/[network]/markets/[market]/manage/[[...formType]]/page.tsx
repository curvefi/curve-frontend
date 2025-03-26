import type { Metadata } from 'next'
import { headers } from 'next/headers'
import React from 'react'
import { getLendMarketSymbols } from '@/app/lend/[network]/markets/[market]/market-name.utils'
import LoanManage from '@/lend/components/PageLoanManage/Page'
import type { MarketUrlParams } from '@/lend/types/lend.types'

type LoanManagePageProps = { params: Promise<MarketUrlParams> }

export const generateMetadata = async ({ params }: LoanManagePageProps): Promise<Metadata> => ({
  title: `${(await getLendMarketSymbols(...(await Promise.all([params, headers()])))).filter(Boolean).join(', ')} | Manage Loan - Curve Lend`,
})

const LoanManagePage = async ({ params }: LoanManagePageProps) => <LoanManage {...await params} />

export default LoanManagePage
