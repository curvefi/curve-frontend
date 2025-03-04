import type { TableProps } from '@/lend/components/PageMarketList/types'
import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils'
import useStore from '@/lend/store/useStore'
import Box from '@ui/Box'
import Table, { Tbody, Th } from '@ui/Table'
import TableHead from '@/lend/components/PageMarketList/components/TableRowViewContentTable/TableHead'
import TableRowContainer from '@/lend/components/PageMarketList/components/TableRowViewContentTable/TableRowContainer'
import TextCaption from '@ui/TextCaption'

const MarketListTable = ({
  className = '',
  pageProps,
  address,
  markets,
  tableLabels,
  tableSettings,
  ...rest
}: TableProps) => {
  const { searchParams, titleMapper } = pageProps
  const { filterTypeKey, sortBy } = searchParams

  const isMdUp = useStore((state) => state.layout.isMdUp)

  return (
    <StyledTable className={className} $haveSortBy={!!sortBy}>
      {/* TABLE HEAD */}
      {isMdUp ? (
        <TableHead
          {...pageProps}
          {...rest}
          address={address}
          filterTypeKey={filterTypeKey}
          tableLabels={tableLabels}
          titleMapper={titleMapper}
        />
      ) : !!sortBy ? (
        <thead>
          <tr>
            <Th className="left">{t`Markets`}</Th>
          </tr>
        </thead>
      ) : null}

      {/* TABLE BODY */}
      <StyledTbody $haveSortBy={!!sortBy}>
        {Array.isArray(markets) && markets.length > 0 ? (
          markets.map((owmId, idx) => (
            <TableRowContainer
              key={`${owmId}${idx}${filterTypeKey}`}
              {...pageProps}
              {...rest}
              owmId={owmId}
              filterTypeKey={filterTypeKey}
            />
          ))
        ) : (
          <tr>
            <td colSpan={tableLabels.length + 1}>
              <Box flex flexJustifyContent="center" fillWidth padding="var(--spacing-normal)">
                <TextCaption isCaps isBold>{t`No market found`}</TextCaption>
              </Box>
            </td>
          </tr>
        )}
      </StyledTbody>
    </StyledTable>
  )
}

const StyledTable = styled(Table)<{ $haveSortBy: boolean }>`
  ${({ $haveSortBy }) =>
    !$haveSortBy && `border-top: 1px solid var(--border-400); border-bottom: 1px solid var(--border-400);`};

  @media (min-width: ${breakpoints.sm}rem) {
    ${({ $haveSortBy }) => !$haveSortBy && `border: 1px solid var(--border-400);`};
  }
`

const StyledTbody = styled(Tbody)<{ $haveSortBy: boolean }>`
  border-bottom: 1px solid var(--border-400);

  ${({ $haveSortBy }) => $haveSortBy && `border-top: 1px solid var(--border-400);`};

  @media (min-width: ${breakpoints.lg}rem) {
    ${({ $haveSortBy }) => $haveSortBy && `border-top: none;`};
  }
`

export default MarketListTable
