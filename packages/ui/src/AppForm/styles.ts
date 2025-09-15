import { styled } from 'styled-components'
import Box from 'ui/src/Box'

export const AppFormContentWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;
  grid-row-gap: var(--spacing-3);
  padding: var(--spacing-3);
  margin: 0 auto;
  position: relative;

  min-height: 17.125rem;

  // Copied straight from Figma. Do not judge; app forms will be replaced by proper mui cards.
  // Used to be min-width and max-width, but alerts would make the card width annoyingly jump around
  width: 374px;
`
