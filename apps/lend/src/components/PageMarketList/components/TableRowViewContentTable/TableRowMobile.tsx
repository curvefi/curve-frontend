import type { TableCellProps, TableRowProps } from '@/components/PageMarketList/types'

import React, { useEffect, useRef, useState } from 'react'

import useStore from '@/store/useStore'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import TableRowMobileContent from '@/components/PageMarketList/components/TableRowViewContentTable/TableRowMobileContent'
import TableRowMobileHead from '@/components/PageMarketList/components/TableRowViewContentTable/TableRowMobileHead'
import { Tr } from '@/ui/Table'

export type Content = {
  tableKey: TitleKey
  show?: boolean
  showLine?: boolean
  content: React.ReactNode
}

const TableRowMobile = (props: TableRowProps) => {
  const { rChainId, api, filterTypeKey, owmId, owmDataCachedOrApi, userActiveKey } = props
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref)

  const userVaultShares = useStore((state) => state.user.marketsBalancesMapper[userActiveKey]?.vaultShares)

  const { signerAddress } = api ?? {}

  const [showDetail, setShowDetail] = useState<string>('')

  const isVisible = !!entry?.isIntersecting
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!isVisible || !ref.current || height !== 0) return

    setHeight(ref.current.getBoundingClientRect().height)
  }, [height, isVisible])

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

  const isHideDetail = showDetail === owmId
  const showMyVaultCell = !!signerAddress && typeof userVaultShares !== 'undefined' && +userVaultShares > 0

  return (
    <Tr ref={ref} {...(!isVisible ? (height > 53 ? { height: `${height}px` } : { className: 'pending' }) : {})}>
      {isVisible && (
        <td>
          <TableRowMobileHead
            {...props}
            cellProps={cellProps}
            isHideDetail={isHideDetail}
            showMyVaultCell={showMyVaultCell}
            setShowDetail={setShowDetail}
          />
          <TableRowMobileContent
            {...props}
            cellProps={cellProps}
            isHideDetail={isHideDetail}
            showMyVaultCell={showMyVaultCell}
          />
        </td>
      )}
    </Tr>
  )
}

export default TableRowMobile
