import styled from 'styled-components'

import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'

type Props = {
  message: string
  onClick: () => void
}

const ErrorMessage = ({ message, onClick }: Props) => {
  return (
    <>
      <Message>{message}</Message>
      <IconButton onClick={onClick}>
        <Icon name="Renew" size={16} />
      </IconButton>
    </>
  )
}

const Message = styled.p`
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
`

export default ErrorMessage
