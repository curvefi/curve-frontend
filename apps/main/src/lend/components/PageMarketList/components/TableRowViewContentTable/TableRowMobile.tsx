import type { TableCellProps, TableRowProps } from '@/lend/components/PageMarketList/types'
import { ReactNode, useEffect, useRef, useState } from 'react'
import useStore from '@/lend/store/useStore'
import useIntersectionObserver from '@ui-kit/hooks/useIntersectionObserver'
import TableRowMobileContent from '@/lend/components/PageMarketList/components/TableRowViewContentTable/TableRowMobileContent'
import TableRowMobileHead from '@/lend/components/PageMarketList/components/TableRowViewContentTable/TableRowMobileHead'
import { Tr } from '@ui/Table'
import { TitleKey } from '@/lend/types/lend.types'

export type Content = {
  tableKey: TitleKey
  show?: boolean
  showLine?: boolean
  content: ReactNode
}

const TableRowMobile = (props: TableRowProps) => {
  const { rChainId, api, filterTypeKey, owmId, market, userActiveKey } = props
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
    market,
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
