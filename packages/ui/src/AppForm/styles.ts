import styled from 'styled-components'

import Box from 'ui/src/Box'
import SlideTab from 'ui/src/TabSlide/SlideTab'
import TabContentWrapper from 'ui/src/Tab/TabContentWrapper'

export const AppFormContentWrapper = styled(TabContentWrapper)`
  align-items: flex-start;
  display: grid;
  grid-row-gap: var(--spacing-3);
  padding: var(--spacing-3);
  padding-top: 0.5rem;
  position: relative;
  min-height: 14rem; // 224px;
`

export const AppFormContent = styled(Box)`
  position: relative;
  min-height: 17.125rem;
`

export const AppFormSlideTab = styled(SlideTab)<{ moreSpace?: true }>`
  padding: var(--spacing-narrow) var(--spacing-narrow) 0 var(--spacing-narrow);

  ${({ moreSpace }) => {
    if (moreSpace) {
      return `padding-top: var(--spacing-normal);`
    }
  }}
`
