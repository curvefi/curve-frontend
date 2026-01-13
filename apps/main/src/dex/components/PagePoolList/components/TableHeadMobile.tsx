import { styled } from 'styled-components'
import { Th, Tr } from '@ui/Table'
import { breakpoints } from '@ui/utils/responsive'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  showInPoolColumn: boolean
}

export const TableHeadMobile = ({ showInPoolColumn }: Props) => (
  <>
    <colgroup>
      {showInPoolColumn && <ColInPool />}
      <Col className="left pool" />
    </colgroup>
    <thead>
      <Tr>
        <Th $first className="left">{t`Pools`}</Th>
      </Tr>
    </thead>
  </>
)

TableHeadMobile.displayName = 'TableHeadMobile'

const Col = styled.col`
  @media (min-width: ${breakpoints.lg}rem) {
    &.pool {
      min-width: 400px;
    }
    &.rewards {
      min-width: 310px;
    }
  }
`

const ColInPool = styled.col`
  width: 25px;
`
