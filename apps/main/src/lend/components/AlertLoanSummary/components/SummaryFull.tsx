import { useMemo } from 'react'
import { Item } from '@/lend/components/AlertLoanSummary/components/Item'
import type { SummaryProps } from '@/lend/components/AlertLoanSummary/types'
import { format } from '@/lend/components/AlertLoanSummary/utils'
import { t } from '@ui-kit/lib/i18n'

export const SummaryFull = ({
  title,
  pendingMessage,
  receive = '',
  formValueStateCollateral = '',
  userState,
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => {
  const { debt: stateDebt = '', collateral: stateCollateral = '', borrowed: stateBorrowed = '' } = userState ?? {}

  const [balance, returnToWallet] = useMemo(() => {
    let balance = 0
    const returnToWallet: { value: number | string; symbol: string }[] = []

    if (+receive > 0) {
      const repayTotal = +receive + +stateBorrowed
      balance = +stateDebt - repayTotal

      const returnToWalletCollateral = +stateCollateral - +formValueStateCollateral
      if (returnToWalletCollateral) {
        returnToWallet.push({ value: returnToWalletCollateral, symbol: collateralSymbol })
      }

      const returnToWalletBorrowed = Math.abs(balance) >= 1 ? Math.abs(balance) : 0
      if (returnToWalletBorrowed) {
        returnToWallet.push({ value: returnToWalletBorrowed, symbol: borrowedSymbol })
      }
    } else {
      returnToWallet.push({ value: stateCollateral, symbol: collateralSymbol })
      if (+stateBorrowed - +stateDebt > 0) {
        returnToWallet.push({ value: +stateBorrowed - +stateDebt, symbol: borrowedSymbol })
      }
    }

    return [balance, returnToWallet]
  }, [borrowedSymbol, collateralSymbol, formValueStateCollateral, receive, stateBorrowed, stateCollateral, stateDebt])

  const minWidth = '170px;'

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item $minWidth={minWidth} label={t`Debt:`} value={`${format(stateDebt)} ${borrowedSymbol}`} />

      {+receive > 0 && (
        <>
          {+stateBorrowed > 0 && (
            <Item $minWidth={minWidth} label={t`Collateral:`} value={`-${format(stateBorrowed)} ${borrowedSymbol}`} />
          )}
          <Item $minWidth={minWidth} label={t`Receive:`} value={`-${format(receive || '0')} ${borrowedSymbol}`} />
          <Item $isDivider $minWidth={minWidth} label="" value={`${format(balance)} ${borrowedSymbol}`} />
        </>
      )}

      {+receive <= 0 && +stateBorrowed > 0 && (
        <>
          <Item $minWidth={minWidth} label={t`Collateral:`} value={`-${format(stateBorrowed)} ${borrowedSymbol}`} />
          {+stateDebt - +stateBorrowed > 0 && (
            <Item
              $minWidth={minWidth}
              label={t`Wallet:`}
              value={`-${format(+stateDebt - +stateBorrowed)} ${borrowedSymbol}`}
            />
          )}
          <Item $isDivider $minWidth={minWidth} label="" value={`0 ${borrowedSymbol}`} />
        </>
      )}

      {returnToWallet.map(({ value, symbol }, idx) => {
        const isFirst = idx === 0
        return (
          <Item
            key={symbol}
            {...(isFirst ? { $marginTop: 'var(--spacing-3)' } : {})}
            $minWidth={minWidth}
            label={isFirst ? t`Return to wallet ≈` : ''}
            value={`${format(value)} ${symbol}`}
          />
        )
      })}
    </>
  )
}
