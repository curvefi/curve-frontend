import { useConnection } from 'wagmi'
import type { LlamaMarketsTableResult } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@evm-ui/shared/routes'
import { TableHeader } from '@evm-ui/shared/ui/DataTable/TableHeader'
import { EmptyStateEvmCard } from '@evm-ui/shared/ui/EmptyStateEvmCard'
import { EvmErrorMessage } from '@evm-ui/shared/ui/EvmErrorMessage'
import { MarketRateType } from '@evm-ui/types/market'
import Stack from '@mui/material/Stack'
import { fromEntries, maybe, recordValues } from '@primitives/objects.utils'
import { mapQuery, QueryProp } from '@ui/features/queries/util'
import { CenteredEmptyState } from '@ui/features/tables/CenteredEmptyState'
import { t } from '@ui/lib/i18n'
import { borderStyle, directChildrenAfterFirst } from '@ui/lib/mui'
import { UserPositionsMarketRateTable } from './UserPositionsMarketRateTable'
import { UserPositionSummary } from './UserPositionsSummary'

type UserPositionsTableProps = { onReload: () => void; tableQuery: QueryProp<LlamaMarketsTableResult> }

const buildVaultUrl = (market: LlamaMarket) =>
  getInternalUrl(
    'lend',
    market.chain,
    `${LEND_ROUTES.PAGE_MARKETS}/${market.controllerAddress}${LEND_MARKET_ROUTES.PAGE_VAULT}`,
  )

export const UserPositionsTables = ({
  onReload,
  tableQuery,
  tableQuery: { data: queryData, isLoading, error },
}: UserPositionsTableProps) => {
  const { address } = useConnection()
  // Tracks whether the user has any positions for each market rate type.
  const hasUserPositions = maybe(queryData?.userHasPositions, userHasPositions =>
    fromEntries(
      recordValues(MarketRateType).map(rateType => [
        rateType,
        recordValues(userHasPositions).some(marketHasPositions => marketHasPositions[rateType]),
      ]),
    ),
  )

  return (
    <Stack>
      <TableHeader title={t`Your Positions`} onReload={onReload} isLoading={isLoading} />
      <Stack sx={directChildrenAfterFirst({ borderTop: borderStyle })}>
        <UserPositionSummary markets={queryData?.markets} selectedChains={undefined} />

        {address ? (
          hasUserPositions ? (
            <>
              {[hasUserPositions?.[MarketRateType.Borrow], error].some(Boolean) && (
                <UserPositionsMarketRateTable
                  tableQuery={mapQuery(tableQuery, ({ markets }) =>
                    markets.filter(market => market.userHasPositions?.[MarketRateType.Borrow]),
                  )}
                  marketRateType={MarketRateType.Borrow}
                  onReload={onReload}
                />
              )}
              {[hasUserPositions?.[MarketRateType.Supply], error].some(Boolean) && (
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
            </>
          ) : (
            <CenteredEmptyState>
              {error ? (
                <EvmErrorMessage
                  title={t`Could not load positions`}
                  subtitle={error.message}
                  error={error}
                  refreshData={onReload}
                />
              ) : (
                <EmptyStateEvmCard
                  isLoading={isLoading}
                  title={t`No active positions`}
                  description={t`Borrow with LLAMMA to stay exposed and lend assets to earn yield.`}
                />
              )}
            </CenteredEmptyState>
          )
        ) : (
          <CenteredEmptyState>
            <EmptyStateEvmCard button={{ type: 'connect-wallet', label: t`Connect to view positions` }} />
          </CenteredEmptyState>
        )}
      </Stack>
    </Stack>
  )
}
