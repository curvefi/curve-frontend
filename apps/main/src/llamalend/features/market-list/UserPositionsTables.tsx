import Stack from '@mui/material/Stack'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { MarketRateType } from '@ui-kit/types/market'
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import type { LlamaMarket, LlamaMarketsResult } from '../../queries/market-list/llama-markets'
import { UserPositionsMarketRateTable } from './UserPositionsMarketRateTable'

type UserPositionsTableProps = {
  onReload: () => void
  tableQuery: QueryProp<LlamaMarketsResult>
}

const buildVaultUrl = (market: LlamaMarket) =>
  getInternalUrl(
    'lend',
    market.chain,
    `${LEND_ROUTES.PAGE_MARKETS}/${market.controllerAddress}${LEND_MARKET_ROUTES.PAGE_VAULT}`,
  )

export const UserPositionsTables = ({ onReload, tableQuery }: UserPositionsTableProps) => (
  <Stack>
    <UserPositionsMarketRateTable
      tableQuery={mapQuery(tableQuery, ({ markets }) =>
        markets.filter(market => market.userHasPositions?.[MarketRateType.Borrow]),
      )}
      marketRateType={MarketRateType.Borrow}
      onReload={onReload}
    />
    <UserPositionsMarketRateTable
      tableQuery={mapQuery(tableQuery, ({ markets }) =>
        markets
          .filter(market => market.userHasPositions?.[MarketRateType.Supply])
          // For supply positions, navigate to vault page instead of borrow page
          .map(market => ({ ...market, url: buildVaultUrl(market) })),
      )}
      marketRateType={MarketRateType.Supply}
      onReload={onReload}
    />
  </Stack>
)
