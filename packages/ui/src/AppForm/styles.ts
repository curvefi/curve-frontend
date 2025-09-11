import { styled } from 'styled-components'
import Box from 'ui/src/Box'

export const AppFormContentWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;
  grid-row-gap: var(--spacing-3);
  padding: var(--spacing-3);
  position: relative;

  min-height: 17.125rem;

  // Copied straight from Figma. Do not judge; app forms will be replaced by proper mui cards.
  //min-width: 374px;
  //max-width: 464px;
  width: 419px;
`
