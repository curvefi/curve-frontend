import { styled } from 'styled-components'

export const BoxHeader = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-1);
  min-height: var(--box_header--height);
  width: 100%;

  color: var(--box_header--primary--color);
  background-color: var(--box_header--primary--background-color);

  font-size: var(--box_header--font-size);
  font-weight: var(--box_header--font-weight);
`
