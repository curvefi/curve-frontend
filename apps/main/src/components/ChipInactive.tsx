import Chip from '@/ui/Typography/Chip'
import React from 'react'
import styled from 'styled-components'


const ChipInactive = ({ children }: React.PropsWithChildren<{}>) => {
  return <StyledInactiveChip>{children}</StyledInactiveChip>
}

const StyledInactiveChip = styled(Chip)`
  opacity: 0.7;
  border: 1px solid var(--border-400);
  padding: 0 2px;
  margin-left: auto;
`

export default ChipInactive
