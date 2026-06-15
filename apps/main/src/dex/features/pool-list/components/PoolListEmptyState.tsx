import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { Trans } from '@ui-kit/lib/i18n'
import type { PoolListPoolType } from '../hooks/usePoolListUrlState'

enum ERROR {
  api = 'api',
  search = 'search',
  filter = 'filter',
}

type Props = {
  poolType: PoolListPoolType | undefined
  resetFilters: () => void
  searchText: string
  isError?: boolean
}

export const PoolListEmptyState = ({ poolType, resetFilters, searchText, isError }: Props) => {
  const errorKey = isError ? ERROR.api : searchText ? ERROR.search : poolType ? ERROR.filter : undefined
  const errorSearchedValue = errorKey === ERROR.search ? searchText : errorKey === ERROR.filter ? poolType : undefined

  return errorKey === ERROR.api ? (
    <Box flex flexJustifyContent="center">
      <AlertBox alertType="error">Unable to retrieve pool list. Please try again later.</AlertBox>
    </Box>
  ) : errorKey === ERROR.search || errorKey === ERROR.filter ? (
    <Trans>
      No pool found {errorSearchedValue && `for "${errorSearchedValue}"`}.
      <br />{' '}
      <Button variant="text" onClick={resetFilters}>
        View all
      </Button>
    </Trans>
  ) : (
    <Trans>
      Can&apos;t find what you&apos;re looking for?{' '}
      <ExternalLink $noStyles href="https://t.me/curvefi">
        Feel free to ask us on Telegram
      </ExternalLink>
    </Trans>
  )
}
