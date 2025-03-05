import { PageContentProps, UserLoanState, UserMarketBalances } from '@/lend/types/lend.types'
import { ReactNode } from 'react'

export type AlertSummaryProps = Pick<PageContentProps, 'market'> & {
  pendingMessage: ReactNode
  receive: string | undefined
  formValueStateDebt?: string | undefined
  formValueStateCollateral?: string
  formValueUserBorrowed?: string
  formValueUserCollateral?: string
  userState: Omit<UserLoanState, 'error'> | undefined
  userWallet: UserMarketBalances | undefined
  type: 'create' | 'full' | 'partial' | 'self' | 'change'
}

export type SummaryProps = Omit<AlertSummaryProps, 'market' | 'type'> & {
  title: ReactNode
  borrowedSymbol: string
  collateralSymbol: string
}
