
import Box from '@/ui/Box'
import Tooltip from '@/ui/Tooltip'
import { Chip } from '@/ui/Typography'
import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { convertFullTime, convertTime, convertTimeAgo } from '@/components/ChartOhlcWrapper/utils'
import TokenIcon from '@/components/TokenIcon'
import networks from '@/networks'
import { getImageBaseUrl } from '@/utils/utilsCurvejs'

import { LiqudityDataProps } from './types'

const LiquidityData: React.FC<LiqudityDataProps> = ({ llammaControllerData, chainId, coins }) => {
  return (
    <>
      {coins &&
        llammaControllerData.map((transaction, index) => {
          return (
            <TransactionRow key={`${transaction.transaction_hash}-lp-${index}`}>
              <LiquidityEvent
                href={networks[chainId].scanTxPath(transaction.transaction_hash)}
                rel="noopener"
                target="_blank"
              >
                {transaction.deposit !== null && (
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
                      <LiquiditySymbol>{coins.collateral.symbol}</LiquiditySymbol>
                      <StyledTokenIcon
                        size="sm"
                        imageBaseUrl={getImageBaseUrl(chainId)}
                        token={coins.collateral.address}
                        address={coins.collateral.address}
                      />
                    </LiquidityEventRow>
                  </>
                )}
                {transaction.withdrawal !== null && (
                  <>
                    <LiquidityEventTitle className="remove">{t`Withdrawal`}</LiquidityEventTitle>
                    <Box flex flexColumn margin="0 0 0 auto">
                      {+transaction.withdrawal.amount_collateral !== 0 && (
                        <LiquidityEventRow>
                          <Chip isBold isNumber>
                            {formatNumber(transaction.withdrawal.amount_collateral, {
                              ...getFractionDigitsOptions(transaction.withdrawal.amount_collateral, 2),
                            })}
                          </Chip>
                          <LiquiditySymbol>{coins.collateral.symbol}</LiquiditySymbol>
                          <StyledTokenIcon
                            size="sm"
                            imageBaseUrl={getImageBaseUrl(chainId)}
                            token={coins.collateral.address}
                            address={coins.collateral.address}
                          />
                        </LiquidityEventRow>
                      )}
                      {+transaction.withdrawal.amount_borrowed !== 0 && (
                        <LiquidityEventRow>
                          <Chip isBold isNumber>
                            {formatNumber(transaction.withdrawal.amount_borrowed, {
                              ...getFractionDigitsOptions(transaction.withdrawal.amount_borrowed, 2),
                            })}
                          </Chip>
                          <LiquiditySymbol>{coins.crvusd.symbol}</LiquiditySymbol>
                          <StyledTokenIcon
                            size="sm"
                            imageBaseUrl={getImageBaseUrl(chainId)}
                            token={coins.crvusd.address}
                            address={coins.crvusd.address}
                          />
                        </LiquidityEventRow>
                      )}
                    </Box>
                  </>
                )}
              </LiquidityEvent>
              <TimestampColumn>
                <Tooltip tooltip={`${convertTime(transaction.timestamp)} ${convertFullTime(transaction.timestamp)}`}>
                  {convertTimeAgo(transaction.timestamp)}
                </Tooltip>
              </TimestampColumn>
            </TransactionRow>
          )
        })}
    </>
  )
}

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
