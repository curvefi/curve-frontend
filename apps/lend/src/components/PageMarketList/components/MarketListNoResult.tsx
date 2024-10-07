


import AlertBox from '@/ui/AlertBox'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import { shortenAccount } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'
import ExternalLink from 'ui/src/Link/ExternalLink'
import type { PageMarketList } from '@/components/PageMarketList/types'
import { Filter } from '@/components/PageMarketList/utils'
import useStore from '@/store/useStore'

const MarketListNoResult = ({
  searchParams,
  signerAddress,
  updatePath,
}: Pick<PageMarketList, 'searchParams' | 'updatePath'> & { signerAddress: string | undefined }) => {
  const owmDatasError = useStore((state) => state.markets.error)

  return (
    <TableRowNotFound>
      {owmDatasError ? (
        <Box flex flexJustifyContent="center">
          <AlertBox alertType="error">{t`Unable to retrieve markets`}</AlertBox>
        </Box>
      ) : searchParams.searchText.length > 0 ? (
        <>
          {t`No market found for "${searchParams.searchText}". Feel free to search other tabs, or`}{' '}
          <Button variant="text" onClick={() => updatePath({ searchText: '' })}>
            {t`view all markets.`}
          </Button>
        </>
      ) : searchParams.filterKey === 'user' && signerAddress ? (
        <>
          {t`No market found for "${shortenAccount(signerAddress)}".`}
          <br />{' '}
          <Button variant="text" onClick={() => updatePath({ filterKey: Filter.all })}>
            {t`view all markets`}
          </Button>
        </>
      ) : (
        <>
          {t`Didn't find what you're looking for?`}{' '}
          <ExternalLink $noStyles href="https://t.me/curvefi">
            {t`Join the Telegram`}
          </ExternalLink>
        </>
      )}
    </TableRowNotFound>
  )
}

const TableRowNotFound = styled.div`
  padding: var(--spacing-5);
  text-align: center;
`

export default MarketListNoResult
