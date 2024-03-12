import styled from 'styled-components'

import Box from '@/ui/Box'
import SlideTab from '@/ui/TabSlide/SlideTab'
import TabContentWrapper from '@/ui/Tab/TabContentWrapper'

// TODO: move to UI Packages
export const FormContentWrapper = styled(TabContentWrapper)`
  align-items: flex-start;
  padding-top: 0.5rem;
  position: relative;
  min-height: 14rem; // 224px;
`

export const FormContent = styled(Box)`
  position: relative;
  min-height: 17.125rem;
`

export const FormSlideTab = styled(SlideTab)<{ moreSpace?: true }>`
  padding: var(--spacing-narrow) var(--spacing-narrow) 0 var(--spacing-narrow);

  ${({ moreSpace }) => {
    if (moreSpace) {
      return `padding-top: var(--spacing-normal);`
    }
  }}
`
