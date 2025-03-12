import { ReactNode, useRef } from 'react'
import IconButton from 'ui/src/IconButton'
import { useButton } from '@react-aria/button'
import type { OverlayTriggerState } from '@react-stately/overlays'

const OpenDialogIconButton = ({
  className,
  children,
  overlayTriggerState,
  testId,
}: {
  children: ReactNode
  className?: string
  overlayTriggerState: OverlayTriggerState
  testId?: string
}) => {
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton({ onPress: () => overlayTriggerState.open() }, openButtonRef)

  return (
    <IconButton className={className} {...buttonProps} ref={openButtonRef} padding={2} testId={testId}>
      <>{children}</>
    </IconButton>
  )
}

OpenDialogIconButton.displayName = 'OpenDialogIconButton'

export default OpenDialogIconButton
