import { some } from 'lodash'
import Stack from '@mui/material/Stack'
import { fromEntries, maybe, recordValues } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { MarketRateType } from '@ui-kit/types/market'
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import { borderStyle, directChildrenAfterFirst } from '@ui-kit/utils/mui'
import type { LlamaMarket, LlamaMarketsResult } from '../../queries/market-list/llama-markets'
import { UserPositionsMarketRateTable } from './UserPositionsMarketRateTable'
import { UserPositionSummary } from './UserPositionsSummary'

interface UserPositionsTableProps {
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
}: UserPositionsTableProps) => {
  // Tracks whether the user has any positions for each market rate type.
  const hasUserPositions = maybe(queryData?.userHasPositions, userHasPositions =>
    fromEntries(
      recordValues(MarketRateType).map(rateType => [
        rateType,
        some(userHasPositions, marketHasPositions => marketHasPositions[rateType]),
      ]),
    ),
  )

  return (
    <Stack>
      <TableHeader title={t`Your Positions`} onReload={onReload} isLoading={isLoading} />
      <Stack sx={directChildrenAfterFirst({ borderTop: borderStyle })}>
        <UserPositionSummary markets={queryData?.markets} selectedChains={undefined} />
        {hasUserPositions?.[MarketRateType.Borrow] && (
          <UserPositionsMarketRateTable
            tableQuery={mapQuery(tableQuery, ({ markets }) =>
              markets.filter(market => market.userHasPositions?.[MarketRateType.Borrow]),
            )}
            marketRateType={MarketRateType.Borrow}
            onReload={onReload}
          />
        )}
        {hasUserPositions?.[MarketRateType.Supply] && (
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
        )}
      </Stack>
    </Stack>
  )
}
