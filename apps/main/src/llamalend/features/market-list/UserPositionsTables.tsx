import { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import type { LlamaMarketsTableResult } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { t } from '@evm-ui/lib/i18n'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@evm-ui/shared/routes'
import { TableHeader } from '@evm-ui/shared/ui/DataTable/TableHeader'
import { EmptyStateCard } from '@evm-ui/shared/ui/EmptyStateCard'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketRateType } from '@evm-ui/types/market'
import { borderStyle, directChildrenAfterFirst } from '@evm-ui/utils/mui'
import Stack from '@mui/material/Stack'
import { fromEntries, maybe, recordValues } from '@primitives/objects.utils'
import { mapQuery, QueryProp } from '@ui/features/queries/util'
import { UserPositionsMarketRateTable } from './UserPositionsMarketRateTable'
import { UserPositionSummary } from './UserPositionsSummary'

const { Spacing } = SizesAndSpaces

type UserPositionsTableProps = {
  onReload: () => void
  tableQuery: QueryProp<LlamaMarketsTableResult>
}

const buildVaultUrl = (market: LlamaMarket) =>
  getInternalUrl(
    'lend',
    market.chain,
    `${LEND_ROUTES.PAGE_MARKETS}/${market.controllerAddress}${LEND_MARKET_ROUTES.PAGE_VAULT}`,
  )

const CenteredEmptyState = ({ children }: { children: ReactNode }) => (
  <Stack
    sx={{
      alignItems: 'center',
      paddingBlock: Spacing.md,
      backgroundColor: t => t.design.Layer[1].Fill,
    }}
  >
    {children}
  </Stack>
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
                <ErrorMessage
                  title={t`Could not load positions`}
                  subtitle={error.message}
                  error={error}
                  refreshData={onReload}
                />
              ) : (
                <EmptyStateCard
                  isLoading={isLoading}
                  title={t`No active positions`}
                  description={t`Borrow with LLAMMA to stay exposed and lend assets to earn yield.`}
                />
              )}
            </CenteredEmptyState>
          )
        ) : (
          <CenteredEmptyState>
            <EmptyStateCard button={{ type: 'connect-wallet', label: t`Connect to view positions` }} />
          </CenteredEmptyState>
        )}
      </Stack>
    </Stack>
  )
}
