import React from 'react'

export type AlertSummaryProps = Pick<PageContentProps, 'borrowed_token' | 'collateral_token'> & {
  pendingMessage: React.ReactNode
  receive: string | undefined
  formValueStateDebt?: string | undefined
  formValueStateCollateral?: string
  formValueUserBorrowed?: string
  formValueUserCollateral?: string
  userState: Omit<UserLoanState, 'error'> | undefined
  userWallet: UserMarketBalances | undefined
  type: 'create' | 'full' | 'partial' | 'self' | 'change'
}

export type SummaryProps = Omit<AlertSummaryProps, 'borrowed_token' | 'collateral_token' | 'type'> & {
  title: React.ReactNode
  borrowedSymbol: string
  collateralSymbol: string
}
