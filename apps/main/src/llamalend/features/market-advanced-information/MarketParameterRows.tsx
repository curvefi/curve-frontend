import { isAddress } from 'viem'
import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import { useMarketOraclePrice, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { fakeLoadingQ, fallbackQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

type MarketPricesRowsProps = {
  chainId: IChainId
  marketId: string | undefined
  enablePricePerShare: boolean
  apiMarket: QueryProp<LlamaMarket>
  tokens: MarketTokensOrEmpty
}

export const MarketPricesRows = ({
  chainId,
  marketId,
  enablePricePerShare,
  apiMarket,
  tokens: { collateralToken, borrowToken },
}: MarketPricesRowsProps) => {
  const oraclePriceOnChain = useMarketOraclePrice({ chainId, marketId })
  const pricePerShare = useMarketVaultPricePerShare({ chainId, marketId }, enablePricePerShare)
  const oraclePrice = fallbackQ(
    q(oraclePriceOnChain),
    mapQuery(apiMarket, m => decimal(m.oraclePrice)),
  )
  return (
    <>
      <ActionInfo
        testId="market-price-oracle"
        label={t`Oracle price`}
        labelTooltip={{
          title: t`The price source that determines your collateral value, health, and when your position moves toward soft liquidation.`,
        }}
        value={mapQuery(oraclePrice, data =>
          formatToken(data, [collateralToken?.symbol, borrowToken?.symbol], 'precise'),
        )}
      />
      {enablePricePerShare && marketId && (
        <ActionInfo
          testId="market-price-per-share"
          label={t`Price per share`}
          labelTooltip={{
            title: t`The current value of one vault share, which increases as lending interest accrues.`,
          }}
          value={mapQuery(pricePerShare, data => formatNumber(data, 'pool.parameter'))}
        />
      )}
    </>
  )
}

const MARKET_ID = { testId: 'market-id', label: t`Market ID` }

export const MarketIdRow = ({ chainId, marketId }: { chainId: IChainId; marketId: string | undefined }) =>
  marketId && isAddress(marketId) ? (
    <AddressActionInfo chainId={chainId} testId={MARKET_ID.testId} title={MARKET_ID.label} address={marketId} />
  ) : (
    <ActionInfo testId={MARKET_ID.testId} label={MARKET_ID.label} value={fakeLoadingQ(marketId)} />
  )
