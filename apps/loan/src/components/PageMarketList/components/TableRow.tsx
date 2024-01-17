import type { PageCollateralList } from '@/components/PageMarketList/types'
import type { TableRowProps } from '@/components/PageMarketList/types'

import { useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'
import useStore from '@/store/useStore'

import CollateralLabel from '@/components/CollateralLabel'
import TableCellAvailable from '@/components/PageMarketList/components/TableCellAvailable'
import TableCellCap from '@/components/PageMarketList/components/TableCellCap'
import TableCellInPool from '@/components/PageMarketList/components/TableCellInPool'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import TableCellTotalCollateral from '@/components/PageMarketList/components/TableCellTotalCollateral'
import TableCellTotalBorrowed from '@/components/PageMarketList/components/TableCellTotalBorrowed'
import TableCellUserDebt from '@/components/PageMarketList/components/TableCellUserDebt'
import TableCellUserHealth from '@/components/PageMarketList/components/TableCellUserHealth'

const TableRow = ({
  className,
  rChainId,
  collateralId,
  collateralData,
  collateralDataCachedOrApi,
  loanDetails,
  loanExists,
  someLoanExists,
  handleCellClick,
}: Pick<PageCollateralList, 'rChainId'> &
  TableRowProps & {
    someLoanExists: boolean
  }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const userDetails = useStore((state) => state.loans.userDetailsMapper[collateralId])

  const isVisible = !!entry?.isIntersecting

  return (
    <Item ref={ref} className={`${className} row--info ${isVisible ? '' : 'pending'}`} onClick={handleCellClick}>
      <TCellInPool className={`row-in-pool ${someLoanExists && loanExists ? 'active' : ''} `}>
        {someLoanExists && loanExists ? <TableCellInPool /> : null}
      </TCellInPool>
      <td>
        <CollateralLabel
          chainId={rChainId}
          isVisible={isVisible}
          collateralData={collateralDataCachedOrApi}
          tableListProps={{
            onClick: handleCellClick,
          }}
        />
      </td>
      {someLoanExists && (
        <>
          <td className="right">
            <TableCellUserHealth userHealth={userDetails?.userHealth} />
          </td>
          <td className="right border-right">
            <TableCellUserDebt userDebt={userDetails?.userState?.debt} />
          </td>
        </>
      )}
      <td className="right">
        <TableCellRate parameters={loanDetails?.parameters} />
      </td>
      <td className="right">
        <TableCellTotalBorrowed totalDebt={loanDetails?.totalDebt} />
      </td>
      <td className="right">
        <TableCellCap cap={loanDetails?.capAndAvailable?.cap} />
      </td>
      <td className="right">
        <TableCellAvailable available={loanDetails?.capAndAvailable?.available} />
      </td>
      <td className="right">
        <TableCellTotalCollateral llamma={collateralData?.llamma} loanDetails={loanDetails} />
      </td>
    </Item>
  )
}

TableRow.defaultProps = {
  className: '',
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
