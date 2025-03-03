import type { AriaDialogProps } from 'react-aria'
import { useDialog } from 'react-aria'
import { ReactNode, useRef } from 'react'

interface DialogProps extends AriaDialogProps {
  title?: ReactNode
  children: ReactNode
}

function Dialog({ title, children, ...props }: DialogProps) {
  let ref = useRef(null)
  let { dialogProps, titleProps } = useDialog(props, ref)

  return (
    <div {...dialogProps} ref={ref} style={{ padding: 30 }}>
      {title && (
        <h3 {...titleProps} style={{ marginTop: 0 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export default Dialog
