import { styled, type IStyledComponent } from 'styled-components'

export const ShadowedBox: IStyledComponent<'web'> = styled.div`
  width: 100%;

  border: 3px solid var(--border-400);
  box-shadow: 6px 6px 0 var(--box--primary--shadow-color);
`
