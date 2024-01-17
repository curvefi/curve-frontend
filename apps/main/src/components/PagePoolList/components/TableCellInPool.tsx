import { t } from '@lingui/macro'

import { Chip } from '@/ui/Typography'
import Icon from '@/ui/Icon'

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
