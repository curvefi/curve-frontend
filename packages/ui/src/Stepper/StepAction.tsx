import type { ButtonProps } from 'ui/src/Button/types'
import type { Step, StepStatus } from 'ui/src/Stepper/types'

import * as React from 'react'
import { useOverlayTriggerState } from 'react-stately'
import { useRef } from 'react'
import { useButton } from 'react-aria'
import styled, { css } from 'styled-components'

import { isInProgress, taskStepStatusStyles } from './helpers'
import Button from 'ui/src/Button'
import Spinner from 'ui/src/Spinner/Spinner'
import StepModal from 'ui/src/Stepper/StepModal'

const StepAction = ({ className, step }: { className?: string; step: Step }) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const classNames = `${className} custom-font step-box`

  const { buttonProps: openButtonProps } = useButton({ onPress: () => overlayTriggerState.open() }, openButtonRef)

  if (step.type === 'task' || step.status === 'succeeded' || step.status === 'failed') {
    return (
      <TaskStep className={`${classNames} font-size-3`} status={step.status}>
        <Content className="content">
          {step.content} {isInProgress(step) ? <StyledSpinner isDisabled size={18} /> : null}
        </Content>
      </TaskStep>
    )
  }

  if (step.status === 'in-progress') {
    return (
      <ActionBox className={`${classNames} font-size-3`}>
        <Content className="content">
          {step.content} {isInProgress(step) ? <StyledSpinner size={15} /> : null}
        </Content>
      </ActionBox>
    )
  }

  const buttonProps: ButtonProps = {
    fillWidth: true,
    size: 'large',
    variant: 'filled',
  }

  return 'onClick' in step ? (
    <>
      <StyledButton
        className={classNames}
        {...buttonProps}
        disabled={step.status !== 'current'}
        testId={step.key.toLowerCase()}
        onClick={step.onClick}
      >
        {step.content} {isInProgress(step) ? <StyledSpinner isDisabled size={15} /> : null}
      </StyledButton>
    </>
  ) : (
    <>
      <StyledButton
        className={classNames}
        {...buttonProps}
        {...openButtonProps}
        ref={openButtonRef}
        disabled={step.status !== 'current'}
        testId={step.key.toLowerCase()}
      >
        {step.content} {isInProgress(step) ? <StyledSpinner isDisabled size={15} /> : null}
      </StyledButton>
      {overlayTriggerState.isOpen && <StepModal modal={step.modal} overlayTriggerState={overlayTriggerState} />}
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

const StyledSpinner = styled(Spinner)`
  margin-left: var(--spacing-2);
`

const StyledButton = styled(Button)`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: var(--spacing-1);

  text-transform: var(--box_action--button--text-transform);
`

const ActionBox = styled(StepBox)`
  ${stepStyle};

  color: var(--box_action--button--loading--color);
  background-color: var(--box_action--button--loading--background-color);
  box-shadow: 3px 3px var(--box_action--button--loading--shadow-color);

  text-align: center;

  ${StyledSpinner} {
    > div {
      border-color: var(--box_action--button--loading--color) transparent transparent transparent;
    }
  }
`

const TaskStep = styled(StepBox)<{ status: StepStatus }>`
  ${stepStyle}

  ${(props) => taskStepStatusStyles(props.status)}
  transition: all 0.5s ease;
`

const Content = styled.div`
  align-items: center;
  display: flex;
  text-align: center;
`

export default StepAction
