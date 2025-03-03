import type { AriaDialogProps } from 'react-aria'
import { useDialog } from 'react-aria'
import { focusVisible } from 'ui/src/utils/sharedStyles'
import styled from 'styled-components'
import { ReactNode, useRef } from 'react'

interface DialogProps extends AriaDialogProps {
  className?: string
  title?: ReactNode
  children: ReactNode
}

function Popover2Dialog({ title, children, ...props }: DialogProps) {
  const ref = useRef(null)
  const { dialogProps, titleProps } = useDialog(props, ref)

  return (
    <Wrapper {...dialogProps} className={props.className} ref={ref}>
      {title && (
        <h3 {...titleProps} style={{ marginTop: 0 }}>
          {title}
        </h3>
      )}
      {/* @ts-ignore */}
      {cloneElement(children, props)}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${focusVisible};

  padding: 1rem;
`

export default Popover2Dialog
