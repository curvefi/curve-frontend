import useStore from '@/loan/store/useStore'
import { ChainId } from '@/loan/types/loan.types'
import CellMaxLeverage from '@ui-kit/shared/ui/CellMaxLeverage'

const TableCellMaxLeverage = ({
  className = '',
  rChainId,
  collateralId,
  showTitle,
}: {
  className?: string
  rChainId: ChainId
  collateralId: string
  showTitle?: boolean
}) => {
  const maxLeverageResp = useStore((state) => state.loans.maxLeverageMapper[collateralId])

  const { maxLeverage, error } = maxLeverageResp ?? {}

  return <CellMaxLeverage className={className} maxLeverage={maxLeverage} error={error} showTitle={showTitle} />
}

export default TableCellMaxLeverage
