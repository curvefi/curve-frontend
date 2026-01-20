import { styled } from 'styled-components'
import { networks } from '@/lend/networks'
import { Box } from '@ui/Box'
import { TooltipButton as Tooltip } from '@ui/Tooltip/TooltipButton'
import { Chip } from '@ui/Typography'
import { formatNumber, getFractionDigitsOptions, convertDate, convertTimeAgo, formatDate, scanTxPath } from '@ui/utils'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TradesDataProps } from './types'

export const TradesData = ({ lendTradesData, chainId }: TradesDataProps) => (
  <>
    {lendTradesData.map((transaction, index) => (
      <TransactionRow key={`${transaction.txHash}-${transaction.idSold}-trade-${index}`}>
        <Event href={scanTxPath(networks[chainId], transaction.txHash)} rel="noopener" target="_blank">
          <TradeFrom>
            <StyledTokenIcon
              size="sm"
              blockchainId={networks[chainId].networkId}
              tooltip={transaction.tokenSold.symbol}
              address={transaction.tokenSold.address}
            />
            <Box flex flexColumn>
              <TradeFromSymbol>{transaction.tokenSold.symbol}</TradeFromSymbol>
              <TradeFromAmount>
                <Chip isBold isNumber>
                  {formatNumber(transaction.amountSold, {
                    ...getFractionDigitsOptions(transaction.amountSold, 2),
                  })}
                </Chip>
              </TradeFromAmount>
            </Box>
          </TradeFrom>
          <Arrow>→</Arrow>
          <TradeTo>
            <Box flex flexColumn>
              <TradeToSymbol>{transaction.tokenBought.symbol}</TradeToSymbol>
              <TradeToAmount>
                <Chip isBold isNumber>
                  {formatNumber(transaction.amountBought, {
                    ...getFractionDigitsOptions(transaction.amountBought, 2),
                  })}
                </Chip>
              </TradeToAmount>
            </Box>
            <StyledTokenIcon
              className="bought"
              size="sm"
              blockchainId={networks[chainId].networkId}
              tooltip={transaction.tokenBought.symbol}
              address={transaction.tokenBought.address}
            />
          </TradeTo>
        </Event>
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
