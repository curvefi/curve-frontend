import { type MouseEvent, useEffect, useRef } from 'react'
import { useButton } from 'react-aria'
import type { OverlayTriggerState } from '@react-stately/overlays'
import Box from 'ui/src/Box'
import Button from 'ui/src/Button'
import ModalDialog from 'ui/src/Dialog/ModalDialog'
import type { StepActionModal } from 'ui/src/Stepper/types'

interface StepModalProps extends Pick<StepActionModal, 'modal'> {
  overlayTriggerState: OverlayTriggerState
}

const StepModal = ({ modal, overlayTriggerState }: StepModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: closeButtonProps } = useButton({}, closeButtonRef)

  const { title, testId, content, cancelBtnProps, primaryBtnProps, primaryBtnLabel } = modal
  const { onClick: onClickCancel } = cancelBtnProps ?? {}
  const { onClick } = primaryBtnProps

  const handleCancel = () => {
    if (typeof onClickCancel === 'function') onClickCancel()
    overlayTriggerState.close()
  }

  const handlePrimaryBtnClick = (evt: MouseEvent<HTMLButtonElement>) => {
    if (typeof onClick === 'function') onClick(evt)
    overlayTriggerState.close()
  }

  useEffect(() => {
    if (typeof modal.initFn === 'function') modal.initFn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ModalDialog
      title={title}
      testId={testId}
      state={{ ...overlayTriggerState, ...modal, close: handleCancel }}
      footerContent={
        <Box grid gridTemplateColumns="repeat(2, 1fr)" gridColumnGap="3">
          <Button
            fillWidth
            variant="text"
            size="large"
            {...closeButtonProps}
            ref={closeButtonRef}
            onClick={handleCancel}
          >
            {cancelBtnProps?.label ?? 'Cancel'}
          </Button>
          <Button fillWidth size="large" variant="filled" {...primaryBtnProps} onClick={handlePrimaryBtnClick}>
            {primaryBtnLabel}
          </Button>
        </Box>
      }
    >
      {content}
    </ModalDialog>
  )
}

export default StepModal
