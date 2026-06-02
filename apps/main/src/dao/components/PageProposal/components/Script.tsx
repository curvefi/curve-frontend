import { styled } from 'styled-components'

type Props = {
  script: string
}

export const Script = ({ script }: Props) => (
  <Wrapper>
    <SubTitle>Calldata</SubTitle>
    <CallData>
      <ScriptText>{script}</ScriptText>
    </CallData>
  </Wrapper>
)

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`

const SubTitle = styled.h4`
  font-size: var(--font-size-1);
  opacity: 0.5;
  padding: 0 var(--spacing-3);
`

const CallData = styled.div`
  margin: 0 var(--spacing-3);
  max-height: 25rem;
  padding: var(--spacing-3);
  line-height: 1.5;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  background: var(--gray-100);
  color: var(--white);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  overflow-y: scroll;
`

const ScriptText = styled.div``
