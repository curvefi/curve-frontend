import useStore from '@/dex/store/useStore'
import styled, { keyframes } from 'styled-components'
import Button from '@ui/Button'
import Icon from '@ui/Icon'

type Props = {
  showScrollButton?: boolean
}

const Settings = ({ showScrollButton }: Props) => {
  const isShowScrollButton = useStore((state) => state.showScrollButton)

  const handleScrollTopClick = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }

  return (
    <Wrapper>
      <StyledScrollUpButton
        className={showScrollButton && isShowScrollButton ? 'pop-in' : ''}
        show={showScrollButton ? isShowScrollButton : false}
        variant="icon-filled"
        onClick={handleScrollTopClick}
      >
        <Icon name="UpToTop" size={24} />
      </StyledScrollUpButton>
    </Wrapper>
  )
}

type ScrollUpButtonProps = {
  show: boolean
}

const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
`

const StyledScrollUpButton = styled(Button)<ScrollUpButtonProps>`
  padding: 0.5rem;
  opacity: 0;

  &.pop-in {
    animation: ${popIn} 0.25s;
    animation-fill-mode: forwards;
  }
`

const Wrapper = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  padding: 1rem;
  z-index: var(--z-index-page-settings);
`

export default Settings
