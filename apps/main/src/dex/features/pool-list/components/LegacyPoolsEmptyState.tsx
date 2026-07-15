import { isEmpty } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useChainId } from '@/dex/hooks/useChainId'
import { useUserPools } from '@/dex/queries/user-pools.query'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import type { PartialRecord } from '@primitives/objects.utils'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { CURVE_SOCIALS, shortenAccount } from '@ui/utils'
import { useParams } from '@ui-kit/hooks/router'
import { Trans } from '@ui-kit/lib/i18n'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolTag } from '../legacy-pools.types'

enum ERROR {
  api = 'api',
  search = 'search',
  filter = 'filter',
}

type Props = {
  columnFiltersById: PartialRecord<LegacyPoolColumnId, string>
  resetFilters: () => void
}

export const LegacyPoolsEmptyState = ({ columnFiltersById, resetFilters }: Props) => {
  const searchText = columnFiltersById[LegacyPoolColumnId.PoolName]

  const props = useParams<NetworkUrlParams>()
  const chainId = useChainId(props.network)
  const { address: userAddress } = useConnection()
  const { isError: isUserPoolsError } = useUserPools({ chainId, userAddress })

  const errorKey = useMemo(() => {
    if (searchText) return ERROR.search
    if (columnFiltersById[LegacyPoolColumnId.PoolTags]) return ERROR.filter
    if (isUserPoolsError) return ERROR.api
  }, [columnFiltersById, searchText, isUserPoolsError])

  const errorSearchedValue = useMemo(
    (): string | undefined =>
      errorKey === ERROR.search
        ? searchText
        : errorKey === ERROR.filter
          ? columnFiltersById[LegacyPoolColumnId.UserHasPositions] && userAddress
            ? shortenAccount(userAddress)
            : (columnFiltersById[LegacyPoolColumnId.PoolTags] as LegacyPoolTag | undefined)
          : undefined,
    [errorKey, searchText, columnFiltersById, userAddress],
  )

  return errorKey === ERROR.api ? (
    <Box flex flexJustifyContent="center">
      <AlertBox alertType="error">Unable to retrieve pool list. Please try again later.</AlertBox>
    </Box>
  ) : errorKey === ERROR.search || errorKey === ERROR.filter ? (
    <>
      {isEmpty(columnFiltersById) ? (
        <Trans>No pool found</Trans>
      ) : (
        <Trans>
          No pool found {errorSearchedValue && `for “${errorSearchedValue}”`}.
          <br />{' '}
          <Button variant="text" onClick={resetFilters}>
            View all
          </Button>
        </Trans>
      )}
    </>
  ) : (
    <Trans>
      Can&apos;t find what you&apos;re looking for?{' '}
      <ExternalLink $noStyles href={CURVE_SOCIALS.telegram.en}>
        Feel free to ask us on Telegram
      </ExternalLink>
    </Trans>
  )
}
