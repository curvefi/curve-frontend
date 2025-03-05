import styled from 'styled-components'
import IconButton from '@ui/IconButton'
import Icon from '@ui/Icon'
import { MouseEvent } from 'react'

type Props = {
  message: string
  onClick?: (e?: MouseEvent) => void
}

const ErrorMessage = ({ message, onClick }: Props) => (
  <>
    <Message>{message}</Message>
    {onClick && (
      <IconButton onClick={onClick} size="small">
        <Icon name="Renew" size={16} />
      </IconButton>
    )}
  </>
)

const Message = styled.p`
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-1);
`

export default ErrorMessage
