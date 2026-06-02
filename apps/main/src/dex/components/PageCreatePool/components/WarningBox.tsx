import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { Icon } from '@ui/Icon'

type Props = {
  message: string
  children?: ReactNode
  informational?: boolean
}

export const WarningBox = ({ message, children, informational = false }: Props) => (
  <WarningBoxWrapper informational={informational}>
    <StyledIcon name={'InformationSquareFilled'} size={24} aria-label="Information Icon" />
    <p>{message}</p>
    {children}
  </WarningBoxWrapper>
)

const WarningBoxWrapper = styled.div<{ informational: boolean }>`
  display: flex;
  background: var(--box--primary--background);
  padding: var(--spacing-2) var(--spacing-3);
  margin: var(--spacing-3) auto var(--spacing-normal) auto;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  color: var(--box--primary--color);
  svg {
    margin: auto var(--spacing-2) auto 0;
    color: ${({ informational }) => (informational ? 'var(--box--primary--color)' : 'var(--warning-400)')};
  }
  p {
    margin: auto auto auto 0;
  }
`

const StyledIcon = styled(Icon)`
  min-width: 24px;
  min-height: 24px;
`
