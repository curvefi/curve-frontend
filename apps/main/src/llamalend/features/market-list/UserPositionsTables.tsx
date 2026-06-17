import { useConnection } from 'wagmi'
import Stack from '@mui/material/Stack'
import { fromEntries, maybe, recordValues } from '@primitives/objects.utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { CONNECT_WALLET_TEST_ID } from '@ui-kit/features/connect-wallet/ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import { borderStyle, directChildrenAfterFirst } from '@ui-kit/utils/mui'
import type { LlamaMarket, LlamaMarketsResult } from '../../queries/market-list/llama-markets'
import { UserPositionsMarketRateTable } from './UserPositionsMarketRateTable'
import { UserPositionSummary } from './UserPositionsSummary'

const { Spacing } = SizesAndSpaces

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
}: UserPositionsTableProps) => {
  const { address, isConnecting } = useConnection()
  const { connect } = useWallet()
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
        {(!hasUserPositions || !address) && (
          <Stack
            sx={{
              alignItems: 'center',
              paddingBlock: Spacing.md,
              backgroundColor: t => t.design.Layer[1].Fill,
            }}
          >
            {address ? (
              !hasUserPositions && (
                <EmptyStateCard
                  isLoading={isLoading}
                  title={t`No active positions`}
                  subtitle={t`Borrow with LLAMMA to stay exposed and lend assets to earn yield.`}
                />
              )
            ) : (
              <EmptyStateCard
                action={{
                  label: t`Connect to view positions`,
                  onClick: () => void connect(),
                  testId: CONNECT_WALLET_TEST_ID,
                  loading: isConnecting,
                }}
              />
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
