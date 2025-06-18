import styled from 'styled-components'
import networks from '@/lend/networks'
import Box from '@ui/Box'
import Tooltip from '@ui/Tooltip'
import { Chip } from '@ui/Typography'
import { formatNumber, getFractionDigitsOptions, convertDate, convertTimeAgo, formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { LiquidityDataProps } from './types'

const LiquidityData = ({ lendControllerData, chainId, coins }: LiquidityDataProps) => (
  <>
    {coins &&
      lendControllerData.map((transaction, index) => (
        <TransactionRow key={`${transaction.txHash}-lp-${index}`}>
          <LiquidityEvent href={networks[chainId].scanTxPath(transaction.txHash)} rel="noopener" target="_blank">
            {!!transaction.deposit && (
              <>
                <Box flex flexColumn>
                  <LiquidityEventTitle>{t`Deposit`}</LiquidityEventTitle>
                  <Nrange>
                    N: {transaction.deposit.n1} / {transaction.deposit.n2}
                  </Nrange>
                </Box>
                <LiquidityEventRow>
                  <Chip isBold isNumber>
                    {formatNumber(transaction.deposit.amount, {
                      ...getFractionDigitsOptions(transaction.deposit.amount, 2),
                    })}
                  </Chip>
                  <LiquiditySymbol>{coins.collateralToken.symbol}</LiquiditySymbol>
                  <StyledTokenIcon
                    size="sm"
                    blockchainId={networks[chainId].networkId}
                    tooltip={coins.collateralToken.symbol}
                    address={coins.collateralToken.address}
                  />
                </LiquidityEventRow>
              </>
            )}
            {!!transaction.withdrawal && (
              <>
                <LiquidityEventTitle className="remove">{t`Withdrawal`}</LiquidityEventTitle>
                <Box flex flexColumn margin="0 0 0 auto">
                  {+transaction.withdrawal.amountCollateral !== 0 && (
                    <LiquidityEventRow>
                      <Chip isBold isNumber>
                        {formatNumber(transaction.withdrawal.amountCollateral, {
                          ...getFractionDigitsOptions(transaction.withdrawal.amountCollateral, 2),
                        })}
                      </Chip>
                      <LiquiditySymbol>{coins.collateralToken.symbol}</LiquiditySymbol>
                      <StyledTokenIcon
                        size="sm"
                        blockchainId={networks[chainId].networkId}
                        tooltip={coins.collateralToken.symbol}
                        address={coins.collateralToken.address}
                      />
                    </LiquidityEventRow>
                  )}
                  {+transaction.withdrawal.amountBorrowed !== 0 && (
                    <LiquidityEventRow>
                      <Chip isBold isNumber>
                        {formatNumber(transaction.withdrawal.amountBorrowed, {
                          ...getFractionDigitsOptions(transaction.withdrawal.amountBorrowed, 2),
                        })}
                      </Chip>
                      <LiquiditySymbol>{coins.borrowedToken.symbol}</LiquiditySymbol>
                      <StyledTokenIcon
                        size="sm"
                        blockchainId={networks[chainId].networkId}
                        tooltip={coins.borrowedToken.symbol}
                        address={coins.borrowedToken.address}
                      />
                    </LiquidityEventRow>
                  )}
                </Box>
              </>
            )}
          </LiquidityEvent>
          <TimestampColumn>
            <Tooltip tooltip={formatDate(convertDate(transaction.timestamp), 'long')}>
              {convertTimeAgo(transaction.timestamp)}
            </Tooltip>
          </TimestampColumn>
        </TransactionRow>
      ))}
  </>
)

const TransactionRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-bottom: 0.5px solid var(--border-600);
  &:hover {
    background: var(--dialog--background-color);
  }
`

const StyledTokenIcon = styled(TokenIcon)`
  margin: auto var(--spacing-1) auto 0;
  &.bought {
    margin: auto 0 auto var(--spacing-1);
  }
`

const LiquidityEvent = styled.a`
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  display: grid;
  grid-template-columns: 0.4fr 1fr;
  text-decoration: none;
  width: 100%;
  color: var(--page--text-color);
  padding: var(--spacing-1) var(--spacing-1);
  &:hover {
    background: var(--dialog--background-color);
  }
`

const LiquidityEventTitle = styled.span`
  text-align: left;
  margin: auto auto auto 0;
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  color: var(--chart-green);
  &.remove {
    color: var(--chart-red);
  }
`

const Nrange = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  margin: var(--spacing-1) 0 auto;
`

const LiquidityEventRow = styled.div`
  display: flex;
  margin: var(--spacing-1) 0 var(--spacing-1) auto;
  align-items: center;
`

const LiquiditySymbol = styled.span`
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  opacity: 0.7;
  margin: 0 var(--spacing-1);
`

const TimestampColumn = styled.span`
  min-width: 36px;
  text-align: right;
  opacity: 0.7;
  font-size: var(--font-size-2);
  margin: auto var(--spacing-1) auto 0;
  padding-left: var(--spacing-1);
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  display: flex;
  justify-content: end;
`

export default LiquidityData
