import type { DetailInfoLeverageExpectedProps } from '@/lend/components/DetailInfoLeverageAdvancedExpected/types'

import React, { useState } from 'react'
import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'

import Button from '@ui/Button'
import ExpectedLabel from '@/lend/components/DetailInfoLeverageAdvancedExpected/components/ExpectedLabel'
import ExpectedSummary from '@/lend/components/DetailInfoLeverageAdvancedExpected/components/ExpectedSummary'
import ExpectedSwapDetails from '@/lend/components/DetailInfoLeverageAdvancedExpected/components/ExpectedSwapDetails'
import TextCaption from '@ui/TextCaption'

const DetailInfoLeverageAdvancedExpected = ({
  rChainId,
  loading,
  swapFrom,
  swapFromAmounts,
  swapTo,
  swapToAmounts,
  nonSwapAmount,
  total,
  avgPrice,
  routeImage,
  type,
  $minWidth,
}: DetailInfoLeverageExpectedProps) => {
  const [showDetails, toggleShowDetails] = useState(false)

  const { address: swapToAddress = '', symbol: swapToSymbol = '' } = swapTo ?? {}
  const { address: swapFromAddress = '', symbol: swapFromSymbol = '' } = swapFrom ?? {}

  const label = type === 'collateral' ? t`Expected` : t`Receive`

  return (
    <>
      <ExpectedLabel
        loading={loading}
        total={total}
        label={label}
        showDetails={showDetails}
        swapToSymbol={swapToSymbol}
        toggleShowDetails={toggleShowDetails}
      />

      {showDetails && (
        <Wrapper>
          {/* summary */}
          <ExpectedSummary
            label={
              <SectionTitle>
                {label} {t`breakdown`}
              </SectionTitle>
            }
            $minWidth={$minWidth}
            nonSwapAmount={nonSwapAmount}
            swapFromAmounts={swapFromAmounts}
            swapFromSymbol={swapFromSymbol}
            swapToAmounts={swapToAmounts}
            swapToSymbol={swapToSymbol}
            total={total}
          />

          {/* swap routes */}
          <ExpectedSwapDetails
            label={<SectionTitle>{t`Route Details`}</SectionTitle>}
            loading={loading}
            rChainId={rChainId}
            swapFromAddress={swapFromAddress}
            swapFromSymbol={swapFromSymbol}
            swapFromAmounts={swapFromAmounts}
            swapToAddress={swapToAddress}
            swapToSymbol={swapToSymbol}
            swapToAmounts={swapToAmounts}
            routeImage={routeImage}
            avgPrice={avgPrice}
          />
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  border: 1px solid var(--button_outlined--border-color);
  margin-bottom: var(--spacing-3);
  margin-top: -1px;
`

const SectionTitle = styled(TextCaption).attrs(() => ({ as: 'h3', isBold: true, isCaps: true }))`
  margin-bottom: var(--spacing-2);
  opacity: 0.8;
`

export const DetailsButton = styled(Button)<{ $isOpen?: boolean }>`
  align-items: center;
  color: inherit;
  display: inline-flex;
  font-size: var(--font-size-1);
  grid-gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  margin-left: var(--spacing-2);
  white-space: nowrap;

  ${({ $isOpen }) => $isOpen && `border-bottom: 1px solid var(--box--primary--background);`};

  &:hover:not(:disabled) {
    border-color: inherit;
    color: inherit;
  }
`

export default DetailInfoLeverageAdvancedExpected
