import { Fragment, ReactNode, useEffect, useRef, useState } from 'react'
import type { TableCellProps, TableRowProps } from '@/lend/components/PageMarketList/types'
import { FilterType } from '@/lend/components/PageMarketList/utils'
import CellBorrowRate from '@/lend/components/SharedCellData/CellBorrowRate'
import CellLoanUserHealth from '@/lend/components/SharedCellData/CellLoanUserHealth'
import CellLoanUserState from '@/lend/components/SharedCellData/CellLoanUserState'
import CellMaxLeverage from '@/lend/components/SharedCellData/CellMaxLeverage'
import CellRewards from '@/lend/components/SharedCellData/CellRewards'
import CellSupplyTotalLiquidity from '@/lend/components/SharedCellData/CellSupplyTotalLiquidity'
import CellToken from '@/lend/components/SharedCellData/CellToken'
import CellTotalCollateralValue from '@/lend/components/SharedCellData/CellTotalCollateralValue'
import CellUserVaultShares from '@/lend/components/SharedCellData/CellUserVaultShares'
import CellUtilization from '@/lend/components/SharedCellData/CellUtilization'
import { TITLE } from '@/lend/constants'
import useStore from '@/lend/store/useStore'
import { TitleKey } from '@/lend/types/lend.types'
import { _showContent } from '@/lend/utils/helpers'
import { Tr, Td, CellInPool } from '@ui/Table'
import useIntersectionObserver from '@ui-kit/hooks/useIntersectionObserver'
import { t } from '@ui-kit/lib/i18n'

type Content = {
  className: string
  content: ReactNode
  show?: boolean
  title?: TitleKey
}

const MIN_ROW_HEIGHT = 53

const TableRowContent = ({
  rChainId,
  api,
  owmId,
  market,
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
  const inMarketTooltip = t`You have a balance in this market`

  const cellProps: TableCellProps = {
    rChainId,
    rOwmId: owmId,
    owmId,
    market,
    userActiveKey,
    filterTypeKey,
    isBold: false,
    size: 'md',
  }

  // prettier-ignore
  const CONTENT: { borrow: Content[], supply: Content[] } = {
    [FilterType.borrow]: [
      { title: TITLE.isInMarket, className: '', content: <CellInPool isIn={userHaveLoan} type='market' tooltip={userHaveLoan ? inMarketTooltip : ''} />, show: showBorrowSignerCell },
      { title: TITLE.tokenCollateral, className: `left ${showBorrowSignerCell ? '' : 'paddingLeft'}`, content: <CellToken {...cellProps} type='collateral'  module='borrow' /> },
      { className: 'left', content: <CellToken {...cellProps} type='borrowed'  module='borrow' /> },
      { className: 'left', content: <CellMaxLeverage {...cellProps} /> },
      { className: 'center border-left', content: <CellLoanUserHealth {...cellProps} />, show: showBorrowSignerCell },
      { className: 'center border-right', content: <CellLoanUserState {...cellProps} />, show: showBorrowSignerCell },
      { className: 'right', content: <CellBorrowRate {...cellProps} /> },
      { className: 'right', content: <CellUtilization {...cellProps}  /> },
      { className: 'right', content: <CellTotalCollateralValue {...cellProps} /> },
    ],
    [FilterType.supply]: [
      { title: TITLE.isInMarket, className: '', content: <CellInPool isIn={userSupplied} type='market' tooltip={userSupplied ? inMarketTooltip : ''} />, show: showSupplySignerCell },
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
      <Fragment key={`content${idx}`}>
        {visible && isInMarketCell && content}
        {visible && !isInMarketCell && (
          <Td key={idx} className={className} $first={isFirst} $last={isLast}>
            {content}
          </Td>
        )}
      </Fragment>
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
    setHeight(Math.max(refHeight, MIN_ROW_HEIGHT))
  }, [height, isVisible])

  return (
    <Tr
      ref={ref}
      onClick={(evt) => props.handleCellClick(evt.target)}
      {...(!isVisible ? (height > MIN_ROW_HEIGHT ? { height: `${height}px` } : { className: 'pending' }) : {})}
    >
      {isVisible && <TableRowContent {...props} />}
    </Tr>
  )
}

export default TableRow
