import type { TableRowProps } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import React, { useRef } from 'react'
import styled from 'styled-components'

import { TITLE } from '@/constants'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import { Tr, Td, CellInPool } from '@/ui/Table'
import TokenLabel from '@/components/TokenLabel'
import TableCellRate from '@/components/SharedCells/TableCellRate'
import TableCellTotalCollateral from '@/components/SharedCells/TableCellTotalCollateral'
import TableCellUser from '@/components/SharedCells/TableCellUser'
import TableCellUtilization from '@/components/SharedCells/TableCellUtilization'

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
    { titleKey: TITLE.isInMarket, content: <CellInPool isIn={loanExists} type='market' tooltip={loanExists ? t`You have a balance in this market`: ''} />, show: loanExists || someLoanExists },
    { titleKey: TITLE.name, content: <TokenLabel showAlert {...props} type="collateral" size='lg' minHeight={35} /> },
    { titleKey: TITLE.myHealth, content: <TableCellUser {...props} type='health' />, show: someLoanExists, className: 'right' },
    { titleKey: TITLE.myDebt, content: <TableCellUser {...props} type='debt' />, show: someLoanExists, className: 'right border-right' },
    { titleKey: TITLE.rate, content: <TableCellRate {...props} />, className: 'right' },
    { titleKey: TITLE.totalBorrowed, content: <TableCellUtilization {...props} type='borrowed' />, className: 'right' },
    { titleKey: TITLE.cap, content: <TableCellUtilization {...props} type='cap' />, className: 'right' },
    { titleKey: TITLE.available, content: <TableCellUtilization {...props} type='available' />, className: 'right' },
    { titleKey: TITLE.totalCollateral, content: <TableCellTotalCollateral {...props} />, className: 'right' },
  ]

  return (
    <StyledTr ref={ref} className={`${className} ${isVisible ? '' : 'pending'}`} onClick={handleCellClick}>
      {contents.map(({ titleKey, content, show, className = '' }, idx) => {
        const isFirst = idx === 1 ? !someLoanExists : false
        const isLast = contents.length - 1 === idx
        const isInMarket = titleKey === TITLE.isInMarket
        const isVisible = !(typeof show !== 'undefined' && !show)

        return (
          <React.Fragment key={`td${idx}`}>
            {isVisible && isInMarket && content}
            {isVisible && !isInMarket && (
              <Td $first={isFirst} $last={isLast} className={className}>
                {content}
              </Td>
            )}
          </React.Fragment>
        )
      })}
    </StyledTr>
  )
}

const StyledTr = styled(Tr)`
  min-height: 3.5625rem; // 57px
`

export default TableRow
