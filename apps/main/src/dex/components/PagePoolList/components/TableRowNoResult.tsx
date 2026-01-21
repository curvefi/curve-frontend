import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import type { SearchParams } from '@/dex/components/PagePoolList/types'
import { useChainId } from '@/dex/hooks/useChainId'
import { useUserPools } from '@/dex/queries/user-pools.query'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { Td, Tr } from '@ui/Table'
import { shortenAccount } from '@ui/utils'
import { useParams } from '@ui-kit/hooks/router'
import { Trans } from '@ui-kit/lib/i18n'

enum ERROR {
  api = 'api',
  search = 'search',
  filter = 'filter',
}

type Props = {
  colSpan: number
  searchParams: SearchParams
  updatePath(searchParams: Partial<SearchParams>): void
}

export const TableRowNoResult = ({ colSpan, searchParams, updatePath }: Props) => {
  const { filterKey, searchText } = searchParams

  const props = useParams<NetworkUrlParams>()
  const chainId = useChainId(props.network)
  const { address: userAddress } = useConnection()
  const { isError: isUserPoolsError } = useUserPools({ chainId, userAddress })

  const errorKey = useMemo(() => {
    if (searchText) return ERROR.search
    if (filterKey) return ERROR.filter
    if (isUserPoolsError) return ERROR.api
  }, [filterKey, searchText, isUserPoolsError])

  const errorSearchParams = useMemo<Partial<SearchParams> | undefined>(() => {
    if (errorKey === ERROR.search) return { searchText: '' }
    if (errorKey === ERROR.filter) return { filterKey: 'all' }
  }, [errorKey])

  const errorSearchedValue = useMemo(() => {
    if (errorKey === ERROR.search) return searchText
    if (errorKey === ERROR.filter) {
      if (filterKey === 'user' && !!userAddress) return shortenAccount(userAddress)
      return filterKey
    }
    return ''
  }, [filterKey, errorKey, searchText, userAddress])

  return (
    <Tr>
      <Td colSpan={colSpan}>
        <Wrapper>
          {errorKey === ERROR.api ? (
            <Box flex flexJustifyContent="center">
              <AlertBox alertType="error">Unable to retrieve pool list. Please try again later.</AlertBox>
            </Box>
          ) : errorKey === ERROR.search || errorKey === ERROR.filter ? (
            <>
              {filterKey === 'all' ? (
                <Trans>No pool found</Trans>
              ) : (
                <Trans>
                  No pool found for “{errorSearchedValue}”.
                  {errorSearchParams && (
                    <>
                      <br />{' '}
                      <Button variant="text" onClick={() => updatePath(errorSearchParams)}>
                        View all
                      </Button>
                    </>
                  )}
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
          )}
        </Wrapper>
      </Td>
    </Tr>
  )
}

const Wrapper = styled.div`
  padding: var(--spacing-5);
  text-align: center;
`
