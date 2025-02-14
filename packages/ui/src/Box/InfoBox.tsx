import * as React from 'react'
import styled from 'styled-components'

type Props = {}

const InfoBox = ({ children, ...rest }: React.PropsWithChildren<Props>) => (
  <Wrapper {...rest}>
    <Message>{children}</Message>
  </Wrapper>
)

export const Wrapper = styled.div`
  padding: var(--spacing-2);
  background-color: var(--info-400);
`

const Message = styled.span`
  width: 100%;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight--semi-bold);
  color: var(--white);

  &::before {
    content: '!';
    padding: 0 var(--spacing-2);
    margin-right: var(--spacing-2);
    color: var(--info-400);
    background-color: var(--white);
    border-radius: 2px;
  }
`

InfoBox.displayName = 'InfoBox'

export default InfoBox
