import { ReactNode, useLayoutEffect, useRef, useState } from 'react'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import { styled } from 'styled-components'
import { Icon } from 'ui/src/Icon/Icon'

function Button(
  props: AriaButtonProps & {
    className?: string
    isHideTopBorder?: boolean
  },
) {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)
  const { className = '', children, isHideTopBorder } = props

  return (
    <StyledButton className={className} isHideTopBorder={isHideTopBorder} {...buttonProps} ref={ref}>
      {children}
    </StyledButton>
  )
}

export const Accordion = ({
  className,
  children,
  btnLabel,
  defaultOpen,
  isHideTopBorder,
  ...props
}: AriaButtonProps & {
  className?: string
  btnLabel: ReactNode
  defaultOpen?: boolean
  isHideTopBorder?: boolean
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const [show, setShow] = useState(defaultOpen ?? false)

  // eslint-disable-next-line react-hooks/refs
  const { scrollHeight } = contentRef.current ?? {}

  const MAX_HEIGHT = '1000px'

  const handleClickBtn = () => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = show ? '0px' : MAX_HEIGHT
      setShow(!show)
    }
  }

  useLayoutEffect(() => {
    if (defaultOpen && contentRef.current) {
      contentRef.current.style.maxHeight = MAX_HEIGHT
    }
  }, [defaultOpen, scrollHeight])

  return (
    <div>
      <Button
        {...props}
        onPress={handleClickBtn}
        isHideTopBorder={isHideTopBorder}
        className={`${className} ${show ? 'show' : ''} `}
      >
        {typeof btnLabel === 'string' ? <h3>{btnLabel}</h3> : btnLabel}
        <span>
          <Icon name="CaretDown" size={16} className={`caret-${!show}`} />
          <Icon name="CaretUp" size={16} className={`caret-${show}`} />
        </span>
      </Button>
      <CollapsibleContentWrapper ref={contentRef} $show={show} className={show ? 'show' : ''}>
        <CollapsibleContent>{children}</CollapsibleContent>
      </CollapsibleContentWrapper>
    </div>
  )
}

const StyledButton = styled.button<{ isHideTopBorder?: boolean }>`
  align-items: center;
  background-color: transparent;
  border: 1px solid var(--button_outlined--border-color);
  ${({ isHideTopBorder }) => isHideTopBorder && `border-top: none;`}
  color: inherit;
  display: flex;
  justify-content: space-between;
  opacity: 0.8;
  padding: 8px;
  width: 100%;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:disabled {
    opacity: 0.5;
    cursor: initial;
    transition: none;
  }

  &:hover:not(:disabled) {
    color: inherit;
    cursor: pointer;
    opacity: 1;
  }

  &.show {
    background-color: var(--button_outlined--hover--background-color);
    border-bottom: none;
    opacity: 1;
  }

  .caret-true {
    display: inline-block;
  }

  .caret-false {
    display: none;
  }
`

const CollapsibleContentWrapper = styled.div<{ $show: boolean }>`
  max-height: 0;

  border: 1px solid var(--button_outlined--border-color);
  border-top: none;

  overflow: hidden;
  transition: max-height 0.2s ease-out;

  &:not(.show) {
    border-bottom: none;
  }
`

const CollapsibleContent = styled.div`
  padding: var(--spacing-narrow);
`
