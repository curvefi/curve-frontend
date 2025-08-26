import useStore from '@/loan/store/useStore'
import CellMaxLeverage from '@ui-kit/shared/ui/CellMaxLeverage'

const TableCellMaxLeverage = ({
  className = '',
  collateralId,
  showTitle,
}: {
  className?: string
  collateralId: string
  showTitle?: boolean
}) => {
  const maxLeverageResp = useStore((state) => state.loans.maxLeverageMapper[collateralId])

  const { maxLeverage, error } = maxLeverageResp ?? {}

  return <CellMaxLeverage className={className} maxLeverage={maxLeverage} error={error} showTitle={showTitle} />
}

export default TableCellMaxLeverage
