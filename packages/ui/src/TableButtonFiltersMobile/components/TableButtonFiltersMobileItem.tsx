import { styled } from 'styled-components'
import { Radio } from 'ui/src/Radio'
import { TableButtonFiltersMobileItemIcon } from './TableButtonFiltersMobileItemIcon'

export const TableButtonFiltersMobileItem = ({
  item,
}: {
  item: { id: string; displayName: string; color?: string }
}) => {
  const { id, displayName, color } = item
  return (
    <StyledRadio key={id} aria-label={`filter by ${displayName}`} value={id}>
      {color && <TableButtonFiltersMobileItemIcon color={color} />}
      <strong>{displayName}</strong>
    </StyledRadio>
  )
}

const StyledRadio = styled(Radio)`
  min-height: var(--height-medium);
`
