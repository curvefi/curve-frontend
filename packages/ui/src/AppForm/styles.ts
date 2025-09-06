import { styled } from 'styled-components'
import Box from 'ui/src/Box'
import { TabContentWrapper } from 'ui/src/Tab'
import SlideTab from 'ui/src/TabSlide/SlideTab'

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
  background-color: unset;

  // Copied straight from Figma. Do not judge; app forms will be replaced by proper mui cards.
  min-width: 374px;
  max-width: 464px;
`

export const AppFormSlideTab = styled(SlideTab)<{ moreSpace?: true }>`
  padding: var(--spacing-narrow) var(--spacing-narrow) 0 var(--spacing-narrow);

  ${({ moreSpace }) => {
    if (moreSpace) {
      return `padding-top: var(--spacing-normal);`
    }
  }}
`
