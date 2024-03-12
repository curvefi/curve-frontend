import type { TableRowProps, TableCellProps } from '@/components/PageMarketList/types'

import React, { useRef } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import CellCap from '@/components/SharedCellData/CellCap'
import CellInPool from '@/components/SharedCellData/CellInPool'
import CellLoanUserState from '@/components/SharedCellData/CellLoanUserState'
import CellLoanUserHealth from '@/components/SharedCellData/CellLoanUserHealth'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import CellToken from '@/components/SharedCellData/CellToken'
import CellMarket from '@/components/SharedCellData/CellMarket'
import CellRate from '@/components/SharedCellData/CellRate'
import CellRewards from '@/components/SharedCellData/CellRewards'
import CellSupplyTotalLiquidity from '@/components/SharedCellData/CellSupplyTotalLiquidity'
import CellUserVaultShares from '@/components/SharedCellData/CellUserVaultShares'

type Content = {
  className: string
  content: React.ReactNode
  isInMarket?: boolean
  show?: boolean
}

const TableRow = ({
  rChainId,
  api,
  owmId,
  owmDataCachedOrApi,
  isBorrow,
  loanExists,
  showSignerCell,
  userActiveKey,
  handleCellClick,
}: TableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const marketsBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { signerAddress } = api ?? {}

  const isVisible = !!entry?.isIntersecting
  const userHaveLoan = !!signerAddress && !!loanExists
  const userSupplied = !!signerAddress && +(marketsBalancesResp?.vaultShares ?? '0') > 0

  const cellProps: TableCellProps = {
    rChainId,
    rOwmId: owmId,
    owmId,
    owmDataCachedOrApi,
    userActiveKey,
    isBorrow,
    isBold: false,
    size: 'md',
  }

  // prettier-ignore
  const CONTENT: { borrow: Content[], supply: Content[] } = {
    borrow: [
      { className: 'center noPadding border-right', content: <CellInPool {...cellProps} isInMarket={userHaveLoan} />, show: showSignerCell },
      { className: 'left', content: <CellMarket {...cellProps} isVisible={isVisible} /> },
      { className: 'center border-left', content: <CellLoanUserHealth {...cellProps} />, show: showSignerCell },
      { className: 'center border-right', content: <CellLoanUserState {...cellProps} type='debt' />, show: showSignerCell },
      { className: 'center', content: <CellToken {...cellProps} type='collateral' hideIcon /> },
      { className: 'center', content: <CellToken {...cellProps} type='borrowed' hideIcon /> },
      { className: 'center', content: <CellRate {...cellProps} type='borrow' /> },
      { className: 'right', content: <CellCap {...cellProps} type='available' /> },
      { className: 'right', content: <CellLoanTotalDebt {...cellProps} /> },
      { className: 'right', content: <CellCap {...cellProps} type='cap-utilization' /> },
    ],
    supply: [
      { className: 'center noPadding border-right', content: <CellInPool {...cellProps} isInMarket={userSupplied} />, show: showSignerCell },
      { className: 'left', content: <CellMarket {...cellProps} isVisible={isVisible} /> },
      { className: 'right border-left border-right', content: <CellUserVaultShares {...cellProps} />, show: showSignerCell },
      { className: 'center', content: <CellToken {...cellProps} type='borrowed' hideIcon /> },
      { className: 'center', content: <CellRate {...cellProps} type='supply' /> },
      { className: 'right', content: <CellRewards {...cellProps} type='crv-other' /> },
      { className: 'right', content: <CellSupplyTotalLiquidity {...cellProps} /> },
    ]
  }

  return (
    <Tr ref={ref} className={`row--info ${isVisible ? '' : 'pending'}`} onClick={handleCellClick}>
      {CONTENT[isBorrow ? 'borrow' : 'supply'].map(({ className, content, isInMarket, show }, idx) => {
        const showCell = typeof show === 'undefined' || (typeof show !== 'undefined' && show)
        const showCellContent = typeof isInMarket === 'undefined' || (typeof isInMarket !== 'undefined' && isInMarket)

        return (
          showCell && (
            <Td key={idx} className={className}>
              {showCellContent ? content : null}
            </Td>
          )
        )
      })}
    </Tr>
  )
}

export const Tr = styled.tr`
  &.pending {
    height: 3.25rem;
  }

  :hover:not(.disabled) {
    cursor: pointer;
    background-color: var(--table_row--hover--color);
  }
`

const Td = styled.td`
  padding: var(--spacing-1);
  padding-top: var(--spacing-2);

  &.noPadding {
    padding: 0;
  }
`

export default TableRow
