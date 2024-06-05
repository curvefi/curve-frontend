import type { AlertSummaryProps } from '@/components/AlertLoanSummary/types'

import { t } from '@lingui/macro'
import styled from 'styled-components'

import Box from '@/ui/Box'
import SummaryCreate from '@/components/AlertLoanSummary/components/SummaryCreate'
import SummaryFull from '@/components/AlertLoanSummary/components/SummaryFull'
import SummaryPartial from '@/components/AlertLoanSummary/components/SummaryPartial'
import SummarySelfLiquidate from '@/components/AlertLoanSummary/components/SummarySelfLiquidate'
import SummaryChange from '@/components/AlertLoanSummary/components/SummaryChange'

const AlertLoanSummary = ({ borrowed_token, collateral_token, type, ...props }: AlertSummaryProps) => {
  const { symbol: collateralSymbol = '' } = collateral_token ?? {}
  const { symbol: borrowedSymbol = '' } = borrowed_token ?? {}

  const message = {
    repayAndClose: t`Repay and Close Loan Details:`,
    change: t`Loan Change Details:`,
    create: t`Create Loan Details:`,
  }

  const titleText = {
    full: message.repayAndClose,
    self: message.repayAndClose,
    partial: message.change,
    change: message.change,
    create: message.create,
  }

  const alertProps = {
    ...props,
    title: <Title>{titleText[type]}</Title>,
    collateralSymbol,
    borrowedSymbol,
  }

  return (
    <>
      <Wrapper fillWidth grid gridGap={1} padding="0 var(--spacing-1) 0 0">
        {type === 'full' ? (
          <SummaryFull {...alertProps} />
        ) : type === 'partial' ? (
          <SummaryPartial {...alertProps} />
        ) : type === 'self' ? (
          <SummarySelfLiquidate {...alertProps} />
        ) : type === 'change' ? (
          <SummaryChange {...alertProps} />
        ) : type === 'create' ? (
          <SummaryCreate {...alertProps} />
        ) : null}
      </Wrapper>
    </>
  )
}

const Wrapper = styled(Box)`
  font-size: var(--font-size-2);
`

const Title = styled.h3`
  margin-bottom: var(--spacing-1);
  margin-top: var(--spacing-3);
  font-size: inherit;
  text-transform: uppercase;
`

export default AlertLoanSummary
