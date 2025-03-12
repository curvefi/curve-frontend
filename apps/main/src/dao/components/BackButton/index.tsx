import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Icon from '@ui/Icon'

type BackButtonProps = {
  path: string
  label: string
}

const BackButton = ({ path, label }: BackButtonProps) => {
  const { push } = useRouter()
  return (
    <BackButtonWrapper variant="secondary">
      <StyledButton variant="text" onClick={() => push(path)}>
        <Icon name="ArrowLeft" size={16} />
        {label}
      </StyledButton>
    </BackButtonWrapper>
  )
}

const BackButtonWrapper = styled(Box)`
  margin: 0 auto var(--spacing-2) var(--spacing-3);
`

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  font-size: var(--font-size-2);
  gap: var(--spacing-2);
  color: var(--page--text-color);
`

export default BackButton
