import type { Step, StepStatus } from 'ui/src/Stepper/types'

import * as React from 'react'
import styled from 'styled-components'

import { statusColorMap } from 'ui/src/Stepper/helpers'

import { RCCross, RCCheck } from 'ui/src/images'
import Box from 'ui/src/Box/Box'
import StepAction from 'ui/src/Stepper/StepAction'
import StepNumberConnector from 'ui/src/Stepper/StepNumberConnector'

const Stepper = ({ steps, testId }: { steps: Step[]; testId?: string }) => (
  <StepsContainer data-testid={`stepper-${testId}`}>
    {steps.map((step, i) => (
      <StepContainer key={i} flex flexAlignItems="center" flexJustifyContent="space-between" fillWidth>
        <StepNumber index={i} step={step} steps={steps} />
        <StepAction step={step} />
      </StepContainer>
    ))}
  </StepsContainer>
)

type StepNumberProps = {
  index: number
  step: Step
  steps: Step[]
}

const StepNumber = ({ index, step, steps }: React.PropsWithChildren<StepNumberProps>) => (
  <StepNumberContainer flex flexColumn flexAlignItems="center">
    <StepNumberConnector visible={index > 0} status={step.status} direction="up" />
    <Number className="custom-font" flex flexAlignItems="center" flexJustifyContent="center" status={step.status}>
      {step.status === 'succeeded' ? <RCCheck className="check" /> : step.status === 'failed' ? <RCCross /> : index + 1}
    </Number>
    <StepNumberConnector
      visible={index < steps.length - 1}
      status={step.status}
      nextStatus={steps[index + 1]?.status}
      direction="down"
    />
  </StepNumberContainer>
)

const StepNumberContainer = styled(Box)`
  align-self: stretch;
`

const StepContainer = styled(Box)``

const StepsContainer = styled.div`
  width: 100%;

  font-size: var(--box_action--button--font-size);

  ${StepContainer}:not(:last-child) .step-box {
    margin-bottom: var(--spacing-narrow);
  }
`

const Number = styled(Box)<{ status: StepStatus }>`
  width: 24px;
  height: 24px;
  margin-right: 20px;

  font-family: var(--button--font);
  font-weight: var(--button--font-weight);

  color: var(--button--color);
  background-color: ${(props) => statusColorMap(props.status)};
  box-shadow: 2px 2px 0 var(--box--primary--shadow-color);
  transition: all 0.5s ease;

  svg:not(.check) {
    fill: var(--white);
  }

  ${({ status }) => {
    if (status === 'pending') {
      return `
        margin-top: -1px;

        color: var(--input--disabled--color);
        box-shadow: none;
        background-color: var(--button--disabled--background-color);
        border: 1px solid var(--button--disabled--background-color);
      `
    }
  }}
`

export default Stepper
