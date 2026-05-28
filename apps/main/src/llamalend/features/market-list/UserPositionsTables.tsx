import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { MarketRateType } from '@ui-kit/types/market'
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import { borderStyle, directChildrenAfterFirst } from '@ui-kit/utils/mui'
import type { LlamaMarket, LlamaMarketsResult } from '../../queries/market-list/llama-markets'
import { UserPositionsMarketRateTable } from './UserPositionsMarketRateTable'
import { UserPositionSummary } from './UserPositionsSummary'

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

export const UserPositionsTables = ({
  onReload,
  tableQuery,
  tableQuery: { data: queryData, isLoading },
}: UserPositionsTableProps) => (
  <Stack>
    <TableHeader title={t`Your Positions`} onReload={onReload} isLoading={isLoading} />
    <Stack sx={directChildrenAfterFirst({ borderTop: borderStyle })}>
      <UserPositionSummary markets={queryData?.markets} selectedChains={undefined} />
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
  </Stack>
)
