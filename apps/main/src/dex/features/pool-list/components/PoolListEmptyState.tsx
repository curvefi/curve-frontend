import { isEmpty } from 'lodash'
import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import type { PartialRecord } from '@curvefi/prices-api/objects.util'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { shortenAccount } from '@ui/utils'
import { Trans } from '@ui-kit/lib/i18n'
import type { Address } from '@ui-kit/utils'
import { PoolColumnId } from '../columns'
import type { PoolTag } from '../types'

enum ERROR {
  api = 'api',
  search = 'search',
  filter = 'filter',
}

type Props = {
  columnFiltersById: PartialRecord<PoolColumnId, string>
  signerAddress: Address | undefined
  resetFilters: () => void
}

export const PoolListEmptyState = ({ signerAddress, columnFiltersById, resetFilters }: Props) => {
  const searchText = columnFiltersById[PoolColumnId.PoolName] as string | undefined

  const userPoolListLoaded = useStore((state) => state.user.poolListLoaded)
  const userPoolListError = useStore((state) => state.user.poolListError)

  const errorKey = useMemo(() => {
    if (searchText) return ERROR.search
    if (columnFiltersById[PoolColumnId.PoolTags]) return ERROR.filter
    if (userPoolListLoaded && userPoolListError) return ERROR.api
  }, [columnFiltersById, searchText, userPoolListError, userPoolListLoaded])

  const errorSearchedValue = useMemo(
    (): string | undefined =>
      errorKey === ERROR.search
        ? searchText
        : errorKey === ERROR.filter
          ? columnFiltersById[PoolColumnId.UserHasPositions] && signerAddress
            ? shortenAccount(signerAddress)
            : (columnFiltersById[PoolColumnId.PoolTags] as PoolTag | undefined)
          : undefined,
    [errorKey, searchText, columnFiltersById, signerAddress],
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
      <ExternalLink $noStyles href="https://t.me/curvefi">
        Feel free to ask us on Telegram
      </ExternalLink>
    </Trans>
  )
}
