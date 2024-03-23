import type { TableRowProps, TableCellProps } from '@/components/PageMarketList/types'

import React, { useRef } from 'react'
import styled, { css } from 'styled-components'

import { _showContent } from '@/utils/helpers'
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
  showBorrowSignerCell,
  showSupplySignerCell,
  userActiveKey,
  handleCellClick,
}: TableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const marketsBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { signerAddress } = api ?? {}
  const { gauge, vaultShares } = marketsBalancesResp ?? {}

  const isVisible = !!entry?.isIntersecting
  const userHaveLoan = !!signerAddress && !!loanExists
  const haveVaultShares = +(vaultShares ?? '0') > 0 || +(gauge ?? '0') > 0
  const userSupplied = !!signerAddress && haveVaultShares

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
      { className: 'center noPadding border-right', content: <CellInPool {...cellProps} isInMarket={userHaveLoan} />, show: showBorrowSignerCell },
      { className: `left ${showBorrowSignerCell ? '' : 'paddingLeft'}`, content: <CellToken {...cellProps} type='collateral' isVisible={isVisible} /> },
      { className: 'left', content: <CellToken {...cellProps} type='borrowed' isVisible={isVisible} /> },
      { className: 'center border-left', content: <CellLoanUserHealth {...cellProps} />, show: showBorrowSignerCell },
      { className: 'center border-right', content: <CellLoanUserState {...cellProps} type='debt' />, show: showBorrowSignerCell },
      { className: 'right', content: <CellRate {...cellProps} type='borrow' /> },
      { className: 'right', content: <CellCap {...cellProps} type='available' /> },
      { className: 'right', content: <CellLoanTotalDebt {...cellProps} /> },
      { className: 'right', content: <CellCap {...cellProps} type='cap' /> },
      { className: 'right', content: <CellCap {...cellProps} type='utilization' /> },
    ],
    supply: [
      { className: 'center noPadding border-right', content: <CellInPool {...cellProps} isInMarket={userSupplied} />, show: showSupplySignerCell },
      { className: `left ${showSupplySignerCell ? '' : 'paddingLeft'}`, content: <CellToken {...cellProps} isVisible={isVisible} type='borrowed' /> },
      { className: 'right border-left border-right', content: <CellUserVaultShares {...cellProps} />, show: showSupplySignerCell },
      { className: 'right', content: <CellRate {...cellProps} type='supply' /> },
      { className: 'right', content: <CellRewards {...cellProps} type='crv-other' /> },
      { className: 'right', content: <CellSupplyTotalLiquidity {...cellProps} /> },
    ]
  }

  return (
    <Tr ref={ref} className={`row--info ${isVisible ? '' : 'pending'}`} onClick={handleCellClick}>
      {CONTENT[isBorrow ? 'borrow' : 'supply'].map(({ className, content, isInMarket, show }, idx) => {
        return (
          _showContent(show) && (
            <Td key={idx} className={className}>
              {_showContent(isInMarket) ? content : null}
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

export const cellCss = css`
  padding-bottom: var(--spacing-1);
  padding-top: var(--spacing-2);
  padding-left: var(--spacing-2);
  padding-right: var(--spacing-2);

  &.noPadding {
    padding: 0;
  }
`

const Td = styled.td`
  ${cellCss};
`

export default TableRow
