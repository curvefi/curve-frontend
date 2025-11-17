import { styled } from 'styled-components'
import { basicMuiTheme } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Box from 'ui/src/Box'

const { MaxWidth } = SizesAndSpaces

export const AppFormContentWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;
  grid-row-gap: var(--spacing-3);
  padding: var(--spacing-3);
  min-height: 17.125rem;
  width: ${MaxWidth.actionCard};
  max-width: ${MaxWidth.actionCard};
  // let the action card take the full width below the tablet breakpoint
  @media (max-width: ${basicMuiTheme.breakpoints.values.tablet}px) {
    width: 100%;
    max-width: 100%;
  }
`
