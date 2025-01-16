import type { SearchParams } from '@/loan/components/PageMarketList/types'

import { Trans } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import useStore from '@/loan/store/useStore'

import { Td, Tr } from '@ui/Table'
import Button from '@ui/Button'
import ExternalLink from '@ui/Link/ExternalLink'

const TableRowNoResult = ({
  colSpan,
  updatePath,
}: {
  colSpan: number
  updatePath: (updatedSearchParams: Partial<SearchParams>) => void
}) => {
  const searchParams = useStore((state) => state.collateralList.searchParams)
  const { searchText } = searchParams

  return (
    <Tr>
      <Td colSpan={colSpan}>
        <Wrapper>
          {searchText ? (
            <Trans>
              No market found for “{searchText}”.
              <br />{' '}
              <Button variant="text" onClick={() => updatePath({ searchText: '' })}>
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

export default TableRowNoResult
