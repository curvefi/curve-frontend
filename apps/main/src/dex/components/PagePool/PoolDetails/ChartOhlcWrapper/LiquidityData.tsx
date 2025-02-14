import type { LpLiquidityEventsData, PricesApiCoin } from '@ui/Chart/types'
import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import useStore from '@/dex/store/useStore'
import { formatNumber, getFractionDigitsOptions, convertDate, convertTime, convertTimeAgo } from '@ui/utils'
import Box from '@ui/Box'
import TokenIcon from '@/dex/components/TokenIcon'
import { Chip } from '@ui/Typography'
import Tooltip from '@ui/Tooltip'
import type React from 'react'
import { ChainId } from '@/dex/types/main.types'

const LiquidityData: React.FC<{ lpEventsData: LpLiquidityEventsData[]; chainId: ChainId; coins: PricesApiCoin[] }> = ({
  lpEventsData,
  chainId,
  coins,
}) => {
  const tokensMapper = useStore((state) => state.tokens.tokensMapper)
  const network = useStore((state) => state.networks.networks[chainId])

  return (
    <>
      {lpEventsData
        .filter((transaction) => {
          if (transaction.token_amounts.reduce((acc, data) => acc + data, 0) !== 0) return transaction
        })
        .map((transaction, index) => (
          <TransactionRow key={`${transaction.transaction_hash}-lp-${index}`}>
            <LpEvent href={network.scanTxPath(transaction.transaction_hash)} rel="noopener" target="_blank">
              {transaction.liquidity_event_type === 'AddLiquidity' ? (
                <>
                  <LpEventType>{t`Add`}</LpEventType>
                  <Box flex flexColumn>
                    {transaction.token_amounts.map(
                      (tx, index) =>
                        tx !== 0 && (
                          <LpAssetRow key={`${transaction.transaction_hash}-${tx}-${index}`}>
                            <Chip isBold isNumber>
                              {formatNumber(transaction.token_amounts[index], {
                                ...getFractionDigitsOptions(transaction.token_amounts[index], 2),
                              })}
                            </Chip>
                            <LpSymbol>{coins[index].symbol}</LpSymbol>
                            <StyledTokenIcon
                              size="sm"
                              imageBaseUrl={network?.imageBaseUrl ?? ''}
                              token={coins[index].address}
                              address={
                                tokensMapper[chainId]?.[coins[index].address]?.ethAddress || coins[index].address
                              }
                            />
                          </LpAssetRow>
                        ),
                    )}
                  </Box>
                </>
              ) : (
                <>
                  <LpEventType className="remove">{t`Remove`}</LpEventType>
                  <LpTokensContainer>
                    {transaction.token_amounts.map(
                      (tx, index) =>
                        tx !== 0 && (
                          <LpAssetRow key={`${transaction.transaction_hash}-${tx}-${index}`}>
                            <Chip isBold isNumber>
                              {formatNumber(transaction.token_amounts[index], {
                                ...getFractionDigitsOptions(transaction.token_amounts[index], 2),
                              })}
                            </Chip>
                            <LpSymbol>{coins[index].symbol}</LpSymbol>
                            <StyledTokenIcon
                              size="sm"
                              imageBaseUrl={network?.imageBaseUrl ?? ''}
                              token={coins[index].address}
                              address={
                                tokensMapper[chainId]?.[coins[index].address]?.ethAddress || coins[index].address
                              }
                            />
                          </LpAssetRow>
                        ),
                    )}
                  </LpTokensContainer>
                </>
              )}
            </LpEvent>
            <TimestampColumn>
              <Tooltip
                tooltip={`${convertTime(transaction.time)} ${convertDate(transaction.time).toLocaleDateString()}`}
              >
                {convertTimeAgo(transaction.time)}
              </Tooltip>
            </TimestampColumn>
          </TransactionRow>
        ))}
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

const LpEvent = styled.a`
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

const LpEventType = styled.span`
  text-align: left;
  margin: auto 0;
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  color: var(--chart-green);
  &.remove {
    color: var(--chart-red);
  }
`

const LpTokensContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const LpAssetRow = styled.div`
  display: flex;
  margin: var(--spacing-1) 0 var(--spacing-1) auto;
  align-items: center;
`

const LpSymbol = styled.span`
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
