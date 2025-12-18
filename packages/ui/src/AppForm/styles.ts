import { styled } from 'styled-components'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Box from 'ui/src/Box'

const { MaxWidth } = SizesAndSpaces

export const AppFormContentWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;
  grid-row-gap: var(--spacing-3);
  padding: var(--spacing-3);
`
