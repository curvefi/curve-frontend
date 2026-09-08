import { type MouseEvent, useEffect } from 'react'
import { OverlayTriggerState } from 'react-stately'
import { Box } from '@legacy-ui/Box'
import { ModalDialog } from '@legacy-ui/Dialog/ModalDialog'
import type { StepActionModal } from '@legacy-ui/Stepper/types'
import Button from '@mui/material/Button'

type StepModalProps = {
  overlayTriggerState: OverlayTriggerState
} & Pick<StepActionModal, 'modal'>

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
    // eslint-disable-next-line @eslint-react/exhaustive-deps
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
