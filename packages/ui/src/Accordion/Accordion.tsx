import type { AriaButtonProps } from 'react-aria'

import * as React from 'react'
import { useButton } from 'react-aria'
import { useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import Icon from 'ui/src/Icon/Icon'

interface ButtonProps extends AriaButtonProps {
  className?: string
}

function Button(props: ButtonProps) {
  let ref = useRef<HTMLButtonElement>(null)
  let { buttonProps } = useButton(props, ref)
  let { className, children } = props

  return (
    <StyledButton className={className} {...buttonProps} ref={ref}>
      {children}
    </StyledButton>
  )
}

Button.defaultProps = {
  className: '',
}

interface Props extends AriaButtonProps {
  btnLabel: string
}

const Accordion = ({ children, btnLabel, ...props }: React.PropsWithChildren<Props>) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const [show, setShow] = useState(false)

  const handleClickBtn = () => {
    if (contentRef.current) {
      // @ts-ignore
      contentRef.current.style.maxHeight = show ? null : `${contentRef.current.scrollHeight}px`
      setShow(!show)
    }
  }

  return (
    <div>
      <Button {...props} onPress={handleClickBtn} className={show ? 'show' : ''}>
        <h3>{btnLabel}</h3>
        <span>
          <Icon name="CaretDown" size={16} className={`caret-${!show}`} />
          <Icon name="CaretUp" size={16} className={`caret-${show}`} />
        </span>
      </Button>
      <CollapsibleContentWrapper ref={contentRef} className={show ? 'show' : ''}>
        <CollapsibleContent>{children}</CollapsibleContent>
      </CollapsibleContentWrapper>
    </div>
  )
}

const buttonOutlinedStyles = css`
  color: var(--button_outlined--color);
  background-color: transparent;
  border: 1px solid var(--button_outlined--border-color);

  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  :disabled {
    opacity: 0.5;
    cursor: initial;
    transition: none;
  }

  :hover:not(:disabled) {
    color: var(--button_outlined--hover--color);
    border-color: var(--button_outlined--hover--color);
    background-color: var(--button_outlined--hover--background-color);
  }
`

const StyledButton = styled.button`
  ${buttonOutlinedStyles};

  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 8px;
  width: 100%;

  color: inherit;

  :hover:not(:disabled) {
    color: inherit;
    border-color: inherit;
    opacity: 0.8;
  }

  &.show {
    border-bottom: none;
  }

  .caret-true {
    display: inline-block;
  }

  .caret-false {
    display: none;
  }
`

const CollapsibleContentWrapper = styled.div`
  max-height: 0;

  border: 1px solid var(--nav_button--border-color);
  border-top: none;

  overflow: hidden;
  transition: max-height 0.2s ease-out;

  &:not(.show) {
    border-bottom: none;
  }
`

const CollapsibleContent = styled.div`
  padding: 8px;
`

export default Accordion
