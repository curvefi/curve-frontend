import Box from '@/ui/Box'
import Button from '@/ui/Button'
import ModalDialog, { OpenDialogIconButton } from '@/ui/Dialog'
import Icon from '@/ui/Icon'
import InputProvider, { InputField } from '@/ui/InputComp'
import type { InputVariant } from '@/ui/InputComp/types'

import { Radio, RadioGroup } from '@/ui/Radio'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import { Chip } from '@/ui/Typography'
import { formatNumber } from '@/ui/utils'
import { Trans, t } from '@lingui/macro'
import { useOverlayTriggerState } from '@react-stately/overlays'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'


type FormValues = {
  selected: string
  customValue: string
  error: 'too-high' | 'too-low' | ''
  errorVariant: InputVariant | ''
}

export type AdvancedSettingsProps = {
  className?: string
  buttonIcon?: React.ReactNode
  maxSlippage: string
  stateKey: string
  testId?: string
}

const DEFAULT_FORM_VALUES: FormValues = {
  selected: '',
  customValue: '',
  error: '',
  errorVariant: '',
}

const MIN_SLIPPAGE = 0.005

function getDefaultFormValuesState(formValues: FormValues, propsMaxSlippage: string) {
  let updatedFormValues = { ...formValues }
  const defaultSelected = propsMaxSlippage
  const isDefaultCustomValue = Number(defaultSelected) !== 0.1 && Number(defaultSelected) !== 0.5

  updatedFormValues.customValue = isDefaultCustomValue ? defaultSelected : ''
  updatedFormValues.selected = isDefaultCustomValue ? 'custom' : defaultSelected
  return updatedFormValues
}

/**
 * SLIPPAGE:
 * Min slippage should be >= 0.01, max slippage <5
 * If saved, it is custom slippage and should be used globally.
 * If custom slippage is not saved, set 0.1 for stablecoin and 0.5 for crypto.
 */
export const AdvancedSettings = ({
  className,
  buttonIcon,
  maxSlippage,
  stateKey, // object key for state
  testId,
}: React.PropsWithChildren<AdvancedSettingsProps>) => {
  const overlayTriggerState = useOverlayTriggerState({})
  const updateMaxSlippage = useStore((state) => state.updateMaxSlippage)

  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES)

  const handleSave = () => {
    const updatedCustomSlippage = formValues.selected === 'custom' ? formValues.customValue : formValues.selected
    updateMaxSlippage(stateKey, updatedCustomSlippage)
    overlayTriggerState.close()
  }

  const handleDiscard = () => {
    setFormValues(getDefaultFormValuesState(DEFAULT_FORM_VALUES, maxSlippage))
    updateMaxSlippage(stateKey, null)
    overlayTriggerState.close()
  }

  const handleSelChangeSlippage = (selected: string) => {
    const updatedFormValues: FormValues = {
      selected,
      customValue: '',
      error: '',
      errorVariant: '',
    }
    setFormValues(updatedFormValues)
  }

  const handleInpChangeCustomSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const updatedFormValues: FormValues = {
      selected: 'custom',
      customValue: value,
      error: '',
      errorVariant: '',
    }

    if (Number(value) > 0) {
      if (Number(value) > 5) {
        updatedFormValues.error = 'too-high'
        updatedFormValues.errorVariant = 'warning'
      } else if (Number(value) < MIN_SLIPPAGE) {
        updatedFormValues.error = 'too-low'
        updatedFormValues.errorVariant = 'error'
      }
    }
    setFormValues(updatedFormValues)
  }

  const inputErrorMapper = {
    'too-high': { message: 'Too high', helperText: '' },
    'too-low': { message: 'Too low', helperText: t`Min. slippage is ${MIN_SLIPPAGE}%` },
  }

  useEffect(() => {
    const initialFormValues = getDefaultFormValuesState(DEFAULT_FORM_VALUES, maxSlippage)
    setFormValues(initialFormValues)
  }, [maxSlippage])

  const formatted01 = formatNumber(0.1, { style: 'percent', maximumFractionDigits: 1 })
  const formatted05 = formatNumber(0.5, { style: 'percent', maximumFractionDigits: 1 })

  return (
    <>
      <OpenDialogIconButton
        testId={`open-modal-${testId}`}
        className={className}
        overlayTriggerState={overlayTriggerState}
      >
        {buttonIcon || <Icon name="SettingsAdjust" size={24} aria-label="Advanced Settings" />}
      </OpenDialogIconButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog
          testId={testId}
          title={t`Advanced Settings`}
          state={{ ...overlayTriggerState, close: handleDiscard }}
          footerContent={
            <StyledFooter grid gridTemplateColumns="repeat(2, auto)" gridColumnGap="normal">
              <Button testId={`${testId}-discard`} size="large" variant="text" onClick={handleDiscard}>
                {t`Discard`}
              </Button>
              <Button
                testId={`${testId}-save`}
                size="large"
                variant="filled"
                onClick={handleSave}
                disabled={
                  !!formValues.error ||
                  formValues.selected === '' ||
                  (formValues.selected === 'custom' && formValues.customValue === '')
                }
              >
                {t`Save`}
              </Button>
            </StyledFooter>
          }
        >
          <Box grid gridRowGap={3}>
            <div>
              <Box flex flexAlignItems="center">
                <Trans>Max Slippage</Trans>
                <IconTooltip>
                  <Trans>
                    Maximum difference between expected price of the trade, versus the price when the trade is executed.
                  </Trans>
                </IconTooltip>
              </Box>

              <RadioGroupWrapper>
                <StyledRadioGroup
                  aria-label="Max Slippage"
                  testId={`${testId}-max-slippages`}
                  value={formValues.selected}
                  onChange={handleSelChangeSlippage}
                >
                  <Radio value="0.1" aria-label={`Max slippage set to ${formatted01}`}>
                    {formatted01}
                  </Radio>
                  <Radio value="0.5" aria-label={`Max slippage set to ${formatted05}`}>
                    {formatted05}
                  </Radio>
                  <Radio
                    testId={`${testId}-custom`}
                    className="custom"
                    aria-label="Max slippage set to custom"
                    value="custom"
                  />
                </StyledRadioGroup>
                <CustomInput>
                  <CustomInputTextField>
                    <StyledInputProvider id="inpCustom" inputVariant={formValues.errorVariant}>
                      <InputField
                        id="inpCustomSlippage"
                        type="number"
                        labelProps={{ label: '' }}
                        minHeight="medium"
                        message={!!formValues.error ? inputErrorMapper[formValues.error].message : ''}
                        value={formValues.customValue}
                        placeholder={t`Custom`}
                        testId={`${testId}-custom-slippage`}
                        onChange={handleInpChangeCustomSlippage}
                      />
                    </StyledInputProvider>
                    %
                  </CustomInputTextField>
                  <Chip isError size="sm">
                    {!!formValues.error ? inputErrorMapper[formValues.error].helperText : ''}
                  </Chip>
                </CustomInput>
              </RadioGroupWrapper>
            </div>
          </Box>
        </ModalDialog>
      )}
    </>
  )
}

AdvancedSettings.defaultProps = {
  className: '',
}

const StyledFooter = styled(Box)`
  margin-top: 1rem;
`

const CustomInputTextField = styled.div`
  align-items: center;
  display: flex;
`

const CustomInput = styled.div`
  position: absolute;
  left: 1.8125rem;
  top: 4.6875rem;
`

const StyledInputProvider = styled(InputProvider)`
  margin-right: 0.25rem;
`

const StyledRadioGroup = styled(RadioGroup)`
  display: grid;
  grid-template-rows: 2.25rem 2.25rem 3.75rem;
`

const RadioGroupWrapper = styled.div`
  position: relative;
`

export default AdvancedSettings
