import type { TableRowProps } from '@/components/PageMarketList/types'

import { useRef } from 'react'
import styled from 'styled-components'

import { TITLE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import TokenLabel from '@/components/TokenLabel'
import TableCellInPool from '@/components/PageMarketList/components/TableCellInPool'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import TableCellTotalCollateral from '@/components/PageMarketList/components/TableCellTotalCollateral'
import TableCellUser from '@/components/PageMarketList/components/TableCellUser'
import TableCellUtilization from '@/components/PageMarketList/components/TableCellUtilization'

const TableRow = ({
  className,
  rChainId,
  collateralId,
  collateralDataCachedOrApi,
  loanExists,
  someLoanExists,
  handleCellClick,
}: TableRowProps & {
  someLoanExists: boolean | undefined
}) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const isVisible = !!entry?.isIntersecting

  const props = { rChainId, collateralId, collateralDataCachedOrApi }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: React.ReactNode; show?: boolean; className?: string }[] = [
    { titleKey: TITLE.isInMarket, content: <TableCellInPool />, show: someLoanExists, className: `row-in-pool ${loanExists ? 'active' : ''}` },
    { titleKey: TITLE.name, content: <TokenLabel showAlert {...props} type="collateral" size='lg' /> },
    { titleKey: TITLE.myHealth, content: <TableCellUser {...props} type='health' />, show: someLoanExists, className: 'right' },
    { titleKey: TITLE.myDebt, content: <TableCellUser {...props} type='debt' />, show: someLoanExists, className: 'right border-right' },
    { titleKey: TITLE.rate, content: <TableCellRate {...props} />, className: 'right' },
    { titleKey: TITLE.totalBorrowed, content: <TableCellUtilization {...props} type='borrowed' />, className: 'right' },
    { titleKey: TITLE.cap, content: <TableCellUtilization {...props} type='cap' />, className: 'right' },
    { titleKey: TITLE.available, content: <TableCellUtilization {...props} type='available' />, className: 'right' },
    { titleKey: TITLE.totalCollateral, content: <TableCellTotalCollateral {...props} />, className: 'right' },
  ]

  return (
    <Item ref={ref} className={`${className} row--info ${isVisible ? '' : 'pending'}`} onClick={handleCellClick}>
      {contents.map(({ titleKey, content, show, className }, idx) => {
        if (typeof show !== 'undefined' && !show) return null

        const key = `td${idx}`

        if (titleKey === TITLE.isInMarket) {
          return (
            <TCellInPool key={key} className={className}>
              {loanExists && content}
            </TCellInPool>
          )
        }

        return (
          <td key={key} className={className}>
            {content}
          </td>
        )
      })}
    </Item>
  )
}

export const TCellInPool = styled.td`
  &.active {
    color: var(--box--primary--color);
    background-color: var(--table_detail_row--active--background-color);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    border-bottom: none;
  }
`

export const Item = styled.tr`
  &.pending {
    height: 3.25rem;
  }

  :hover:not(.disabled) {
    background-color: var(--table_row--hover--color);
  }
`

export default TableRow
