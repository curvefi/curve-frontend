import styled from 'styled-components'
import ShadowedBox from '@ui/ShadowedBox'
import TabSlide from '@ui/TabSlide'

export const Wrapper = styled(ShadowedBox)`
  justify-content: flex-start;
  margin-top: var(--spacing-4);
  margin-bottom: calc(var(--spacing-3) + var(--footer-mobile-height));
  width: 100%;

  color: var(--box--primary--color);
  background: var(--box--primary--background);
`

export const StyledTabSlide = styled(TabSlide)`
  margin-bottom: var(--spacing-2);
`

export const FieldsWrapper = styled.div`
  display: grid;
  width: 100%;

  row-gap: 0.5rem;
`
