import { MouseEvent } from 'react'
import { styled } from 'styled-components'
import { IconButton } from '@legacy-ui/IconButton'
import { ReloadIcon } from '@ui/icons/ReloadIcon'

type Props = { message: string; onClick?: (e?: MouseEvent) => void }

export const ErrorMessage = ({ message, onClick }: Props) => (
  <>
    <Message>{message}</Message>
    {onClick && (
      <IconButton onClick={onClick} size="small">
        <ReloadIcon sx={{ fontSize: 16 }} />
      </IconButton>
    )}
  </>
)

const Message = styled.p`
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-1);
`
