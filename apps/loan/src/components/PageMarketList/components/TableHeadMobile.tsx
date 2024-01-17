import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'

const TableHeadMobile = () => {
  return (
    <>
      <colgroup>
        <Col className="left collateral" />
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
    &.collateral {
      min-width: 400px;
    }
  }
`

export default TableHeadMobile
