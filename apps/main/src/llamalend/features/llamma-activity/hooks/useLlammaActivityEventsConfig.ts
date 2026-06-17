import { useMemo } from 'react'
import { getAmmAddress, getTokens } from '@/llamalend/llama.utils'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { LlammaEvent } from '@curvefi/prices-api/llamma'
import { maybe } from '@primitives/objects.utils'
import { scanAddressPath, scanTxPath } from '@ui/utils'
import {
  type LlammaEventRow,
  LLAMMA_EVENTS_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  getPageCount,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { LlammaActivityProps } from '..'

export const useLlammaActivityEventsConfig = ({
  marketQuery: { data: market },
  networkConfig,
}: LlammaActivityProps) => {
  const { isHydrated } = useCurve()
  const { eventsColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()
  const { collateralToken, borrowToken } = maybe(market, getTokens) ?? {}
  const networkId = networkConfig?.id.toLowerCase()
  const network = networkId && isPricesApiChain(networkId) ? networkId : undefined
  const ammAddress = getAmmAddress(market)
  const endpoint = market instanceof MintMarketTemplate ? 'crvusd' : 'lending'
  const isMarketAvailable = !!market

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useLlammaEvents({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(eventsData?.count, DEFAULT_PAGE_SIZE)

  // Transform events data with block explorer URLs
  const eventsWithUrls: LlammaEventRow[] = useMemo(
    () =>
      (network &&
        eventsData?.events.map((event: LlammaEvent) => ({
          ...event,
          providerUrl: scanAddressPath(networkConfig, event.provider),
          txUrl: scanTxPath(networkConfig, event.txHash),
          network,
          collateralToken,
          borrowToken,
        }))) ??
      [],
    [eventsData?.events, network, networkConfig, collateralToken, borrowToken],
  )

  const table = useTable({
    data: eventsWithUrls,
    columns: LLAMMA_EVENTS_COLUMNS,
    state: { columnVisibility: eventsColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(eventsWithUrls),
  })

  return {
    table,
    isLoading: isEventsLoading || !isHydrated || !isMarketAvailable,
    isError: isEventsError && isHydrated && isMarketAvailable,
    emptyMessage: t`No activity data found.`,
    errorMessage: t`Could not load activity data.`,
  }
}
