import * as React from 'react'
import type { AriaDialogProps } from 'react-aria'
import { useDialog } from 'react-aria'
import styled from 'styled-components'
import { focusVisible } from 'ui/src/utils/sharedStyles'

interface DialogProps extends AriaDialogProps {
  className?: string
  title?: React.ReactNode
  children: React.ReactNode
}

function Popover2Dialog({ title, children, ...props }: DialogProps) {
  let ref = React.useRef(null)
  let { dialogProps, titleProps } = useDialog(props, ref)

  return (
    <Wrapper {...dialogProps} className={props.className} ref={ref}>
      {title && (
        <h3 {...titleProps} style={{ marginTop: 0 }}>
          {title}
        </h3>
      )}
      {/* @ts-ignore */}
      {React.cloneElement(children, props)}
    </Wrapper>
  )
}

Popover2Dialog.defaultProps = {
  className: '',
}

const Wrapper = styled.div`
  ${focusVisible};

  padding: 1rem;
`

export default Popover2Dialog
