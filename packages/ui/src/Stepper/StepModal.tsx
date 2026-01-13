import { type MouseEvent, useEffect } from 'react'
import Button from '@mui/material/Button'
import type { OverlayTriggerState } from '@react-stately/overlays'
import { Box } from 'ui/src/Box'
import { ModalDialog } from 'ui/src/Dialog/ModalDialog'
import type { StepActionModal } from 'ui/src/Stepper/types'

interface StepModalProps extends Pick<StepActionModal, 'modal'> {
  overlayTriggerState: OverlayTriggerState
}

export const StepModal = ({ modal, overlayTriggerState }: StepModalProps) => {
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
          <Button color="ghost" onClick={handleCancel}>
            {cancelBtnProps?.label ?? 'Cancel'}
          </Button>
          <Button color="primary" {...primaryBtnProps} onClick={handlePrimaryBtnClick}>
            {primaryBtnLabel}
          </Button>
        </Box>
      }
    >
      {content}
    </ModalDialog>
  )
}
