import { styled } from 'styled-components'
import Box from 'ui/src/Box'

const TabContentWrapper = styled(Box)<{ variant?: 'secondary' }>`
  background-color: ${({ variant }) =>
    variant === 'secondary'
      ? `var(--tab-secondary--content--background-color)`
      : `var(--tab--content--background-color)`};
`

export const AppFormContentWrapper = styled(TabContentWrapper)`
  align-items: flex-start;
  display: grid;
  grid-row-gap: var(--spacing-3);
  padding: var(--spacing-3);
  position: relative;
  min-height: 14rem; // 224px;
`

export const AppFormContent = styled(Box)`
  position: relative;
  min-height: 17.125rem;
  background-color: unset;

  // Copied straight from Figma. Do not judge; app forms will be replaced by proper mui cards.
  min-width: 374px;
  max-width: 464px;
`
