import { useOverlayTriggerState } from 'react-stately'
import { styled, css } from 'styled-components'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Spinner } from '@ui/Spinner/Spinner'
import { StepModal } from '@ui/Stepper/StepModal'
import type { Step, StepStatus } from '@ui/Stepper/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { isInProgress, taskStepStatusStyles } from './helpers'

const { Spacing } = SizesAndSpaces

export const StepAction = ({ step }: { step: Step }) => {
  const overlayTriggerState = useOverlayTriggerState({})

  const content = (
    <Stack direction="row" gap={Spacing.md} alignItems="center">
      {step.content}
      {isInProgress(step) ? <Spinner isDisabled size={18} /> : null}
    </Stack>
  )

  if (step.type === 'task' || step.status === 'succeeded' || step.status === 'failed') {
    return (
      <TaskStep className="step-box font-size-3" status={step.status}>
        {content}
      </TaskStep>
    )
  }

  return (
    <>
      <Button
        {...open}
        className="step-box"
        disabled={step.status !== 'current'}
        data-testid={step.key.toLowerCase()}
        onClick={'onClick' in step ? step.onClick : overlayTriggerState.open}
        fullWidth
        size="medium"
      >
        {content}
      </Button>

      {!('onClick' in step) && overlayTriggerState.isOpen && (
        <StepModal modal={step.modal} overlayTriggerState={overlayTriggerState} />
      )}
    </>
  )
}

const StepBox = styled.div`
  padding: var(--spacing-1) var(--spacing-2);
  min-height: var(--height-large);
  width: 100%;
`

const stepStyle = css`
  align-items: center;
  display: flex;
  justify-content: center;

  font-family: var(--button--font);
  font-size: var(--box_action--button--font-size);
  font-weight: var(--button--font-weight);
`

const TaskStep = styled(StepBox)<{ status: StepStatus }>`
  ${stepStyle}

  ${(props) => taskStepStatusStyles(props.status)}
  transition: all 0.5s ease;
`
