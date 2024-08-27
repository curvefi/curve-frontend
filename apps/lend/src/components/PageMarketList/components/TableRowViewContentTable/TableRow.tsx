import type { TableCellProps, TableRowProps } from '@/components/PageMarketList/types'

import React, { useEffect, useRef, useState } from 'react'

import { FilterType } from '@/components/PageMarketList/utils'
import { TITLE } from '@/constants'
import { _showContent } from '@/utils/helpers'
import useStore from '@/store/useStore'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import { Tr, Td, CellInPool } from '@/ui/Table'
import CellLoanUserState from '@/components/SharedCellData/CellLoanUserState'
import CellLoanUserHealth from '@/components/SharedCellData/CellLoanUserHealth'
import CellToken from '@/components/SharedCellData/CellToken'
import CellBorrowRate from '@/components/SharedCellData/CellBorrowRate'
import CellRewards from '@/components/SharedCellData/CellRewards'
import CellSupplyTotalLiquidity from '@/components/SharedCellData/CellSupplyTotalLiquidity'
import CellUserVaultShares from '@/components/SharedCellData/CellUserVaultShares'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import CellMaxLeverage from '@/components/SharedCellData/CellMaxLeverage'
import CellUtilization from '@/components/SharedCellData/CellUtilization'

type Content = {
  className: string
  content: React.ReactNode
  show?: boolean
  title?: TitleKey
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
      { title: TITLE.isInMarket, className: '', content: <CellInPool isIn={userHaveLoan} type='market' />, show: showBorrowSignerCell },
      { title: TITLE.tokenCollateral, className: `left ${showBorrowSignerCell ? '' : 'paddingLeft'}`, content: <CellToken {...cellProps} type='collateral'  module='borrow' /> },
      { className: 'left', content: <CellToken {...cellProps} type='borrowed'  module='borrow' /> },
      { className: 'left', content: <CellMaxLeverage {...cellProps} /> },
      { className: 'center border-left', content: <CellLoanUserHealth {...cellProps} />, show: showBorrowSignerCell },
      { className: 'center border-right', content: <CellLoanUserState {...cellProps} type='debt' />, show: showBorrowSignerCell },
      { className: 'right', content: <CellBorrowRate {...cellProps} /> },
      { className: 'right', content: <CellUtilization {...cellProps}  /> },
      { className: 'right', content: <CellTotalCollateralValue {...cellProps} /> },
    ],
    [FilterType.supply]: [
      { title: TITLE.isInMarket, className: '', content: <CellInPool isIn={userSupplied} type='market' />, show: showSupplySignerCell },
      { title: TITLE.tokenBorrow, className: `left ${showSupplySignerCell ? '' : 'paddingLeft'}`, content: <CellToken {...cellProps}  type='borrowed' module='supply' /> },
      { className: 'left', content: <CellToken {...cellProps} type='collateral'  module='supply' /> },
      { className: 'left', content: <CellMaxLeverage {...cellProps} /> },
      { className: 'right border-left border-right', content: <CellUserVaultShares {...cellProps} />, show: showSupplySignerCell },
      { className: 'right', content: <CellRewards {...cellProps} /> },
      { className: 'right', content: <CellSupplyTotalLiquidity {...cellProps} /> },
    ]
  }

  return CONTENT[filterTypeKey].map(({ className, content, show, title = '' }, idx) => {
    const isFirst = idx === 1 ? (filterTypeKey === 'borrow' ? !userHaveLoan : !userSupplied) : false
    const isLast = idx === CONTENT[filterTypeKey].length - 1
    const isInMarketCell = title === TITLE.isInMarket
    const visible = _showContent(show)

    return (
      <React.Fragment key={`content${idx}`}>
        {!visible && null}
        {visible && isInMarketCell && content}
        {visible && !isInMarketCell && (
          <Td key={idx} className={className} $first={isFirst} $last={isLast}>
            {content}
          </Td>
        )}
      </React.Fragment>
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
    const refHeight = ref.current.getBoundingClientRect().height
    setHeight(refHeight > 53 ? refHeight : 53)
  }, [height, isVisible])

  return (
    <Tr
      ref={ref}
      onClick={(evt) => props.handleCellClick(evt.target)}
      {...(!isVisible ? (height > 53 ? { height: `${height}px` } : { className: 'pending' }) : {})}
    >
      {isVisible && <TableRowContent {...props} />}
    </Tr>
  )
}

export default TableRow
