import type { TableCellProps, TableRowProps } from '@/components/PageMarketList/types'

import React, { useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { FilterType } from '@/components/PageMarketList/utils'
import { _showContent } from '@/utils/helpers'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import CellCap from '@/components/SharedCellData/CellCap'
import CellInPool from '@/components/SharedCellData/CellInPool'
import CellLoanUserState from '@/components/SharedCellData/CellLoanUserState'
import CellLoanUserHealth from '@/components/SharedCellData/CellLoanUserHealth'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import CellToken from '@/components/SharedCellData/CellToken'
import CellRate from '@/components/SharedCellData/CellRate'
import CellRewards from '@/components/SharedCellData/CellRewards'
import CellSupplyTotalLiquidity from '@/components/SharedCellData/CellSupplyTotalLiquidity'
import CellUserVaultShares from '@/components/SharedCellData/CellUserVaultShares'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import CellMaxLeverage from '@/components/SharedCellData/CellMaxLeverage'

type Content = {
  className: string
  content: React.ReactNode
  show?: boolean
}

const TableRowContent = ({
  rChainId,
  api,
  owmId,
  owmDataCachedOrApi,
  filterTypeKey,
  loanExists,
  showBorrowSignerCell,
  showSupplySignerCell,
  userActiveKey,
}: TableRowProps) => {
  const marketsBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { signerAddress } = api ?? {}
  const { gauge, vaultShares } = marketsBalancesResp ?? {}

  const userHaveLoan = !!signerAddress && loanExists
  const haveVaultShares = +(vaultShares ?? '0') > 0 || +(gauge ?? '0') > 0
  const userSupplied = !!signerAddress && haveVaultShares

  const cellProps: TableCellProps = {
    rChainId,
    rOwmId: owmId,
    owmId,
    owmDataCachedOrApi,
    userActiveKey,
    filterTypeKey,
    isBold: false,
    size: 'md',
  }

  // prettier-ignore
  const CONTENT: { borrow: Content[], supply: Content[] } = {
    [FilterType.borrow]: [
      { className: 'center noPadding border-right', content: <CellInPool {...cellProps} isInMarket={userHaveLoan} />, show: showBorrowSignerCell },
      { className: `left ${showBorrowSignerCell ? '' : 'paddingLeft'}`, content: <CellToken {...cellProps} type='collateral'  module='borrow' /> },
      { className: 'left', content: <CellToken {...cellProps} type='borrowed'  module='borrow' /> },
      { className: 'left', content: <CellMaxLeverage {...cellProps} /> },
      { className: 'center border-left', content: <CellLoanUserHealth {...cellProps} />, show: showBorrowSignerCell },
      { className: 'center border-right', content: <CellLoanUserState {...cellProps} type='debt' />, show: showBorrowSignerCell },
      { className: 'right', content: <CellRate {...cellProps} type='borrow' /> },
      { className: 'right', content: <CellCap {...cellProps} type='available' /> },
      { className: 'right', content: <CellLoanTotalDebt {...cellProps} /> },
      { className: 'right', content: <CellCap {...cellProps} type='cap' /> },
      { className: 'right', content: <CellCap {...cellProps} type='utilization' /> },
      { className: 'right', content: <CellTotalCollateralValue {...cellProps} /> },
    ],
    [FilterType.supply]: [
      { className: 'center noPadding border-right', content: <CellInPool {...cellProps} isInMarket={userSupplied} />, show: showSupplySignerCell },
      { className: `left ${showSupplySignerCell ? '' : 'paddingLeft'}`, content: <CellToken {...cellProps}  type='borrowed' module='supply' /> },
      { className: 'left', content: <CellToken {...cellProps} type='collateral'  module='supply' /> },
      { className: 'left', content: <CellMaxLeverage {...cellProps} /> },
      { className: 'right border-left border-right', content: <CellUserVaultShares {...cellProps} />, show: showSupplySignerCell },
      { className: 'right', content: <CellRewards {...cellProps} type='crv-other' /> },
      { className: 'right', content: <CellSupplyTotalLiquidity {...cellProps} /> },
    ]
  }

  return CONTENT[filterTypeKey].map(({ className, content, show }, idx) => {
    if (!_showContent(show)) return null

    return (
      <Td key={idx} className={className}>
        {content}
      </Td>
    )
  })
}

const TableRow = (props: TableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref)

  const [height, setHeight] = useState(0)

  const isVisible = !!entry?.isIntersecting

  useEffect(() => {
    if (!isVisible || !ref.current || height !== 0) return
    setHeight(ref.current.getBoundingClientRect().height)
  }, [height, isVisible])

  return (
    <Tr
      ref={ref}
      className={`row--info ${isVisible ? '' : 'pending'}`}
      onClick={(evt) => props.handleCellClick(evt.target)}
      rowHeight={height}
    >
      {isVisible && <TableRowContent {...props} />}
    </Tr>
  )
}

export const Tr = styled.tr<{ rowHeight: number }>`
  &.pending {
    height: ${({ rowHeight }) => `${rowHeight}px` || '2.8125rem'}; // default 45px
  }

  :hover:not(.disabled) {
    cursor: pointer;
    background-color: var(--table_row--hover--color);
  }
`

export const cellCss = css`
  padding-bottom: var(--spacing-narrow);
  padding-top: var(--spacing-narrow);
  padding-left: var(--spacing-1);
  padding-right: var(--spacing-1);

  @media (min-width: ${breakpoints.lg}rem) {
    padding-left: var(--spacing-2);
    padding-right: var(--spacing-2);
  }

  &.noPadding {
    padding: 0;
  }
`

const Td = styled.td`
  ${cellCss};
`

export default TableRow
