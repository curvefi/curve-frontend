import type { PageMarketList } from '@/lend/components/PageMarketList/types'

import { t, Trans } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { Filter } from '@/lend/components/PageMarketList/utils'

import { shortenAccount } from '@ui/utils'
import Box from '@ui/Box'
import AlertBox from '@ui/AlertBox'
import Button from '@ui/Button'
import ExternalLink from 'ui/src/Link/ExternalLink'
import { useChainId, useOneWayMarketMapping } from '@/lend/entities/chain'

enum ERROR {
  api = 'api',
  search = 'search',
  filter = 'filter',
}

const MarketListNoResult = ({
  searchParams,
  signerAddress,
  updatePath,
}: Pick<PageMarketList, 'searchParams' | 'updatePath'> & { signerAddress: string | undefined }) => {
  const chainId = useChainId()?.data
  const marketMappingError = useOneWayMarketMapping({ chainId })?.error

  const { searchText, filterKey } = searchParams

  const errorKey = useMemo(() => {
    if (searchText) return ERROR.search
    if (marketMappingError) return ERROR.api
    if (filterKey) return ERROR.filter
  }, [filterKey, marketMappingError, searchText])

  const errorSearchParams = useMemo(() => {
    if (errorKey === ERROR.search) return { searchText: '' }
    if (errorKey === ERROR.filter) return { filterKey: Filter.all }
  }, [errorKey])

  const errorSearchedValue = useMemo(() => {
    if (errorKey === ERROR.search) return searchText
    if (errorKey === ERROR.api) return ''
    if (errorKey === ERROR.filter) {
      if (filterKey === 'user' && !!signerAddress) return shortenAccount(signerAddress)
      return filterKey
    }
    return ''
  }, [filterKey, errorKey, searchText, signerAddress])

  return (
    <Wrapper>
      {errorKey === ERROR.api ? (
        <Box flex flexJustifyContent="center">
          <AlertBox alertType="error">{t`Unable to retrieve market list. Please try again later.`}</AlertBox>
        </Box>
      ) : errorKey === ERROR.search || errorKey === ERROR.filter ? (
        <>
          {filterKey === 'all' ? (
            t`No market found`
          ) : (
            <Trans>
              No market found for “{errorSearchedValue}”.
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
  )
}

const Wrapper = styled.div`
  padding: var(--spacing-5);
  text-align: center;
`

export default MarketListNoResult
