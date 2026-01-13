import { styled } from 'styled-components'
import { DetailInfo } from '@ui/DetailInfo'
import { AlertBox } from 'ui/src/AlertBox'
import { Box } from 'ui/src/Box'
import { TextCaption } from 'ui/src/TextCaption'
import { formatNumber } from 'ui/src/utils'

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
        {errorMessage ? (
          errorMessage
        ) : (
          <>
            <div>
              <TextCaption isCaps isBold>
                {titleSelfLiquidation}
              </TextCaption>
              <div>
                <StyledDetailInfo label="Debt">{formatNumber(debtAmount, { defaultValue: '-' })}</StyledDetailInfo>
                <StyledDetailInfo label={`Collateral (${borrowedSymbol})`}>
                  {formatNumber(borrowedAmount, { defaultValue: '-' })}
                </StyledDetailInfo>
                <StyledDetailInfo isDivider label="">
                  {formatNumber(liquidationAmt)}
                </StyledDetailInfo>
              </div>
            </div>

            <div>
              <TextCaption isCaps isBold>
                {titleReceive}
              </TextCaption>
              <div>
                <StyledDetailInfo label={`${collateralSymbol}:`}>{formatNumber(collateralAmount)}</StyledDetailInfo>
                {showReturnedBorrowed && (
                  <StyledDetailInfo label={`${borrowedSymbol}:`}>{formatNumber(returnedBorrowed)}</StyledDetailInfo>
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
