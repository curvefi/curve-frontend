import { cloneElement, ReactElement, ReactNode, useRef } from 'react'
import type { AriaDialogProps } from 'react-aria'
import { useDialog } from 'react-aria'
import { styled } from 'styled-components'
import { focusVisible } from '@ui/utils/sharedStyles'

export type DialogProps = {
  className?: string
  title?: ReactNode
  children: ReactElement<AriaDialogProps>
} & AriaDialogProps

export function Popover2Dialog({ title, children, ...props }: DialogProps) {
  const ref = useRef(null)
  const { dialogProps, titleProps } = useDialog(props, ref)

  return (
    <Wrapper {...dialogProps} className={props.className} ref={ref}>
      {title && (
        <h3 {...titleProps} style={{ marginTop: 0 }}>
          {title}
        </h3>
      )}
      {/* eslint-disable-next-line @eslint-react/no-clone-element -- Existing violation before enabling this rule. */}
      {cloneElement(children, props)}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${focusVisible};

  padding: 1rem;
`
