import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import Th from '@/ui/Table/Th'

const TableHeadMobile = () => {
  return (
    <>
      <colgroup>
        <Col className="left collateral" />
      </colgroup>
      <thead>
        <Th className="left">Markets</Th>
      </thead>
    </>
  )
}

TableHeadMobile.displayName = 'TableHeadMobile'

const Col = styled.col`
  @media (min-width: ${breakpoints.lg}rem) {
    &.collateral {
      min-width: 400px;
    }
  }
`

export default TableHeadMobile
