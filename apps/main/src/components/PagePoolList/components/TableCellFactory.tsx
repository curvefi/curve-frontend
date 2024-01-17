import { t } from '@lingui/macro'
import styled from 'styled-components'

import { Chip } from '@/ui/Typography'

type Props = {
  isFactory: boolean | undefined
}

const TableCellFactory = ({ isFactory }: Props) => {
  return isFactory ? (
    <FactoryLabel
      size="xs"
      tooltip={t`Factory pools are permissionless, deployed by anyone.`}
    >{t`Factory`}</FactoryLabel>
  ) : null
}

const FactoryLabel = styled(Chip)`
  margin-left: var(--spacing-1);
  padding: 0 2px;
  background-color: var(--warning-400);
  color: var(--black);
  letter-spacing: 0;
`

export default TableCellFactory
