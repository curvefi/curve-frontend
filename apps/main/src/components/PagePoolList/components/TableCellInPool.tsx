import Icon from '@/ui/Icon'
import { Chip } from '@/ui/Typography'
import { t } from '@lingui/macro'


const TableCellInPool = () => {
  return (
    <Chip
      tooltip={t`You have a balance in this pool`}
      tooltipProps={{
        placement: 'top left',
      }}
    >
      <Icon name="CurrencyDollar" size={16} />
    </Chip>
  )
}

export default TableCellInPool
