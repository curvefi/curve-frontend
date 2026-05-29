import { useMemo } from 'react'
import { Item } from '@/lend/components/AlertLoanSummary/components/Item'
import type { SummaryProps } from '@/lend/components/AlertLoanSummary/types'
import { format } from '@/lend/components/AlertLoanSummary/utils'
import { calculateReturnToWallet } from '@/llamalend/llama.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { decimal } from '@ui-kit/utils'

export const SummaryFull = ({
  title,
  pendingMessage,
  receive = '',
  formValueStateCollateral = '',
  userState,
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => {
  const { debt: stateDebt = '', borrowed: stateBorrowed = '' } = userState ?? {}
  const balance = +receive > 0 ? +stateDebt - (+receive + +stateBorrowed) : 0
  const returnToWallet = useMemo(
    () =>
      calculateReturnToWallet({
        totalBorrowed: decimal(receive),
        userState: userState && {
          debt: userState.debt as Decimal,
          collateral: userState.collateral as Decimal,
          stablecoin: userState.borrowed as Decimal,
        },
        stateCollateralDelta: decimal(formValueStateCollateral),
        collateralSymbol,
        borrowedSymbol,
      }),
    [borrowedSymbol, collateralSymbol, formValueStateCollateral, receive, userState],
  )

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
