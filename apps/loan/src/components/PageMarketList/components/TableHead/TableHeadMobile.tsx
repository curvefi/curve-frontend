import { t } from '@lingui/macro'

import { Thead, Th } from '@/ui/Table'

const TableHeadMobile = () => {
  return (
    <Thead>
      <tr>
        <Th $first className="left">{t`Markets`}</Th>
      </tr>
    </Thead>
  )
}

export default TableHeadMobile
