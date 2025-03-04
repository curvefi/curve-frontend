import { t } from '@ui-kit/lib/i18n'
import { Thead, Th } from '@ui/Table'

const TableHeadMobile = () => (
  <Thead>
    <tr>
      <Th $first className="left">{t`Markets`}</Th>
    </tr>
  </Thead>
)

export default TableHeadMobile
