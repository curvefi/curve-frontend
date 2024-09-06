import { useButton } from '@react-aria/button'
import { useOverlayTriggerState } from '@react-stately/overlays'
import React, { useRef } from 'react'
import styled from 'styled-components'
import Icon from 'ui/src/Icon'
import IconButton from 'ui/src/IconButton'
import SandwichMenuPopover from './SandwichMenuPopover'

interface SandwichMenuProps {
  className?: string
  onItemClick: (key: string) => void
}

const SandwichMenu: React.FC<SandwichMenuProps> = ({ className, onItemClick }) => {
  const state = useOverlayTriggerState({})
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { buttonProps } = useButton(
    {
      onPress: () => state.toggle(),
    },
    buttonRef
  )

  return (
    <Wrapper className={className}>
      <StyledSandwichButton {...buttonProps} ref={buttonRef} isOpen={state.isOpen}>
        <Icon name="OverflowMenuVertical" size={24} aria-label="Menu" />
      </StyledSandwichButton>
      {state.isOpen && (
        <SandwichMenuPopover isOpen={true} onClose={state.close} triggerRef={buttonRef} onItemClick={onItemClick} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`

const StyledSandwichButton = styled(IconButton)<{ isOpen: boolean }>`
  padding: var(--spacing-1);
  background-color: ${(props) => (props.isOpen ? 'var(--tab--content--background-color)' : 'transparent')};
  :hover {
    background-color: var(--tab--content--background-color);
  }
`

export default SandwichMenu
