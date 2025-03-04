import type { TableRowProps } from '@/loan/components/PageMarketList/types'
import { t } from '@ui-kit/lib/i18n'
import { Fragment, ReactNode, useRef } from 'react'
import styled from 'styled-components'
import networks from '@/loan/networks'
import { TITLE } from '@/loan/constants'
import useIntersectionObserver from '@ui/hooks/useIntersectionObserver'
import { CellInPool, Td, Tr } from '@ui/Table'
import TokenLabel from '@/loan/components/TokenLabel'
import TableCellRate from '@/loan/components/SharedCells/TableCellRate'
import TableCellTotalCollateral from '@/loan/components/SharedCells/TableCellTotalCollateral'
import TableCellUser from '@/loan/components/SharedCells/TableCellUser'
import TableCellUtilization from '@/loan/components/SharedCells/TableCellUtilization'
import { TitleKey } from '@/loan/types/loan.types'

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

  const props = {
    rChainId,
    blockchainId: networks[rChainId].networkId,
    collateralId,
    collateralDataCachedOrApi,
  }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: ReactNode; show?: boolean; className?: string }[] = [
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
          <Fragment key={`td${idx}`}>
            {isVisible && isInMarket && content}
            {isVisible && !isInMarket && (
              <Td $first={isFirst} $last={isLast} className={className}>
                {content}
              </Td>
            )}
          </Fragment>
        )
      })}
    </StyledTr>
  )
}

const StyledTr = styled(Tr)`
  min-height: 3.5625rem; // 57px
`

export default TableRow
