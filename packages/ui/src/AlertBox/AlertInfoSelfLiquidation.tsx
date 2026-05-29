import { styled } from 'styled-components'
import { formatNumber, amount } from '@ui-kit/utils'
import { Box } from '../Box'
import { DetailInfo } from '../DetailInfo'
import { TextCaption } from '../TextCaption'
import { AlertBox } from './AlertBox'

const formatAmount = (value: string | number) => formatNumber(amount(value), { abbreviate: false, fallback: '-' })

export const AlertInfoSelfLiquidation = ({
  errorMessage,
  titleSelfLiquidation,
  titleReceive,
  liquidationAmt,
  borrowedSymbol,
  borrowedAmount,
  collateralAmount,
  collateralSymbol,
  debtAmount,
}: {
  errorMessage?: string
  titleSelfLiquidation: string
  titleReceive: string
  liquidationAmt: string
  borrowedSymbol: string
  borrowedAmount: string
  collateralAmount: string
  collateralSymbol: string
  debtAmount: string
}) => {
  const returnedBorrowed = +borrowedAmount - +debtAmount
  const showReturnedBorrowed = returnedBorrowed > 0

  return (
    <AlertBox alertType="info">
      <Box flex flexDirection="column" fillWidth gridGap={1} padding="0 var(--spacing-3)">
        {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule. */}
        {errorMessage ? (
          errorMessage
        ) : (
          <>
            <div>
              <TextCaption isCaps isBold>
                {titleSelfLiquidation}
              </TextCaption>
              <div>
                <StyledDetailInfo label="Debt">{formatAmount(debtAmount)}</StyledDetailInfo>
                <StyledDetailInfo label={`Collateral (${borrowedSymbol})`}>
                  {formatAmount(borrowedAmount)}
                </StyledDetailInfo>
                <StyledDetailInfo isDivider label="">
                  {formatAmount(liquidationAmt)}
                </StyledDetailInfo>
              </div>
            </div>

            <div>
              <TextCaption isCaps isBold>
                {titleReceive}
              </TextCaption>
              <div>
                <StyledDetailInfo label={`${collateralSymbol}:`}>{formatAmount(collateralAmount)}</StyledDetailInfo>
                {showReturnedBorrowed && (
                  <StyledDetailInfo label={`${borrowedSymbol}:`}>{formatAmount(returnedBorrowed)}</StyledDetailInfo>
                )}
              </div>
            </div>
          </>
        )}
      </Box>
    </AlertBox>
  )
}

const StyledDetailInfo = styled(DetailInfo)`
  min-height: 1.2rem;
  border-color: inherit;
`
