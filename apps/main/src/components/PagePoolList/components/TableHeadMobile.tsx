import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'

type Props = {
  showInPoolColumn: boolean
}

const TableHeadMobile = ({ showInPoolColumn }: Props) => {
  return (
    <>
      <colgroup>
        {showInPoolColumn && <ColInPool className="row-in-pool" />}
        <Col className="left pool" />
      </colgroup>
      <thead>
        <tr></tr>
      </thead>
    </>
  )
}

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

export default TableHeadMobile
