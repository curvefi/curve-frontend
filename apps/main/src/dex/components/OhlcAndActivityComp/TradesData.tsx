import { styled } from 'styled-components'
import { useNetworkByChain } from '@/dex/entities/networks'
import { ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { TooltipButton as Tooltip } from '@ui/Tooltip/TooltipButton'
import { Chip } from '@ui/Typography'
import { formatNumber, getFractionDigitsOptions, convertDate, convertTimeAgo, formatDate, scanTxPath } from '@ui/utils'
import type { LpTradesData, LpTradeToken } from '@ui-kit/features/candle-chart/types'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'

export type TradesDataProps = {
  lpTradesData: LpTradesData[]
  chainId: ChainId
  tradesTokens: LpTradeToken[]
}

export const TradesData = ({ lpTradesData, chainId, tradesTokens }: TradesDataProps) => {
  const { data: network } = useNetworkByChain({ chainId })
  return lpTradesData.map((transaction, index) => {
    const boughtToken = tradesTokens.find((token) => token.event_index === transaction.bought_id)
    const soldToken = tradesTokens.find((token) => token.event_index === transaction.sold_id)

    return (
      <TransactionRow key={`${transaction.transaction_hash}-${transaction.sold_id}-trade-${index}`}>
        <Event href={scanTxPath(network, transaction.transaction_hash)} rel="noopener" target="_blank">
          <TradeFrom>
            <StyledTokenIcon
              size="sm"
              blockchainId={network?.networkId ?? ''}
              tooltip={soldToken?.symbol ?? transaction.token_sold_symbol}
              address={soldToken?.address ?? transaction.token_sold}
            />
            <Box flex flexColumn>
              <TradeFromSymbol>{soldToken?.symbol ?? transaction.token_sold_symbol}</TradeFromSymbol>
              <TradeFromAmount>
                <Chip isBold isNumber>
                  {formatNumber(transaction.tokens_sold, {
                    ...getFractionDigitsOptions(transaction.tokens_sold, 2),
                  })}
                </Chip>
              </TradeFromAmount>
            </Box>
          </TradeFrom>
          <Arrow>→</Arrow>
          <TradeTo>
            <Box flex flexColumn>
              <TradeToSymbol>{boughtToken?.symbol ?? transaction.token_bought_symbol}</TradeToSymbol>
              <TradeToAmount>
                <Chip isBold isNumber>
                  {formatNumber(transaction.tokens_bought, {
                    ...getFractionDigitsOptions(transaction.tokens_bought, 2),
                  })}
                </Chip>
              </TradeToAmount>
            </Box>
            <StyledTokenIcon
              className="bought"
              size="sm"
              blockchainId={network?.networkId ?? ''}
              tooltip={boughtToken?.symbol ?? transaction.token_bought_symbol}
              address={boughtToken?.address ?? transaction.token_bought}
            />
          </TradeTo>
        </Event>
        <TimestampColumn>
          <Tooltip tooltip={formatDate(convertDate(transaction.time), 'long')}>
            {convertTimeAgo(transaction.time)}
          </Tooltip>
        </TimestampColumn>
      </TransactionRow>
    )
  })
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

const StyledTokenIcon = styled(TokenIcon)`
  margin: auto var(--spacing-1) auto 0;
  &.bought {
    margin: auto 0 auto var(--spacing-1);
  }
`

const Event = styled.a`
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  display: grid;
  grid-template-columns: 1fr 0.1fr 1fr;
  text-decoration: none;
  width: 100%;
  color: var(--page--text-color);
  padding: var(--spacing-1) var(--spacing-1);
`

const TradeFrom = styled.div`
  margin-right: auto;
  display: flex;
  flex-direction: row;
`

const TradeFromSymbol = styled.span`
  text-align: left;
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  color: #ef5350;
`

const TradeFromAmount = styled.span`
  text-align: left;
  font-weight: var(--bold);
  font-size: var(--font-size-2);
`

const Arrow = styled.span`
  margin: auto 0;
  font-size: var(--font-size-3);
  font-weight: var(--bold);
  text-align: center;
`

const TradeTo = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: row;
`

const TradeToSymbol = styled.span`
  text-align: right;
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  color: #26a69a;
`

const TradeToAmount = styled.span`
  text-align: right;
  font-weight: var(--bold);
  font-size: var(--font-size-2);
`
