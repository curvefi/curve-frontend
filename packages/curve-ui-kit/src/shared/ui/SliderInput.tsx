import { clamp } from 'lodash'
import { useCallback, useMemo } from 'react'
import { TextFieldProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import { useDebounce } from '@ui-kit/hooks/useDebounce'
import { SliderSize } from '@ui-kit/themes/components/slider/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import { NumericTextField, NumericTextFieldProps } from './NumericTextField'
import { Slider, type SliderProps } from './Slider'

const { Spacing, MaxWidth } = SizesAndSpaces

export type RangeValue = [number, number]
export type DecimalRangeValue = [Decimal, Decimal]
type ControlledValue = Decimal | DecimalRangeValue

export type SliderInputProps = {
  /** The direction of the layout. Row: inputs on the left and right of the slider. Column: inputs below the slider. */
  layoutDirection?: 'column' | 'row'
  /** The size of the slider and inputs. Sizes of the inputs are calculated based on the size of the slider. */
  size?: SliderSize
  /** Value controlled by the slider and inputs. Pass an array to enable a range slider. */
  value: ControlledValue
  /** Change handler shared between the slider and inputs. */
  onChange: (value: ControlledValue) => void
  /** Minimum allowed value for both inputs and slider */
  min?: number
  /** Maximum allowed value for both inputs and slider */
  max?: number
  /** Step increment for the slider */
  step?: number
  /** Propagated to both inputs and slider */
  disabled?: boolean
  /** The debounce time in milliseconds for the slider and inputs */
  debounceMs?: number
  /** Optional transform that maps values between the inputs and the slider */
  sliderValueTransform?: {
    toSlider: (value: number) => number
    fromSlider: (value: number) => number
    sliderMin?: number
    sliderMax?: number
    sliderStep?: number | null
  }
  /** Test ID for the slider and inputs */
  testId?: string
  /** Additional props forwarded to the slider */
  sliderProps?: Omit<SliderProps, 'size' | 'value' | 'onChange' | 'step' | 'disabled' | 'aria-label' | 'scale'>
  /** Additional props forwarded to the inputs */
  inputProps?: Omit<NumericTextFieldProps, 'size' | 'value' | 'onChange' | 'min' | 'max' | 'disabled' | 'aria-label'>
}

const DEBOUNCE_VALUE = 700

/**
 * Mapping between the slider sizes and correspoding input sizes
 */
const sliderInputSizeMap: Record<SliderSize, TextFieldProps['size']> = {
  small: 'tiny',
  medium: 'tiny',
}

/**
 * Mapping between the layout direction and correspoding max width of the input
 */
const sliderInputMaxWidthMap: Record<NonNullable<SliderInputProps['layoutDirection']>, string> = {
  row: MaxWidth.sliderInput.sm,
  column: MaxWidth.sliderInput.md,
}

/** Clamps a Decimal or Decimal range between min and max bounds */
const clampDecimal = (value: Decimal | DecimalRangeValue, min: number, max: number): ControlledValue => {
  if (isRangeValue(value)) {
    const clamped: RangeValue = [Number(value[0]), Number(value[1])]
    clamped[0] = clamp(clamped[0], min, max)
    clamped[1] = clamp(clamped[1], min, max)
    return [decimal(clamped[0]) as Decimal, decimal(clamped[1]) as Decimal]
  }
  return decimal(clamp(Number(value), min, max)) as Decimal
}

const isRangeValue = (value: ControlledValue) => Array.isArray(value)

/**
 * A controlled slider component with synchronized numeric input fields.
 * With multiple inputs and layout orientations
 * Supports both single value and range modes. User interactions are debounced
 * during drag and typing, then immediately committed on blur or release.
 */
export const SliderInput = ({
  layoutDirection = 'row',
  size = 'medium',
  value,
  onChange,
  min = 0,
  max = Infinity,
  step,
  disabled,
  sliderProps,
  inputProps,
  sliderValueTransform,
  testId,
  debounceMs = DEBOUNCE_VALUE,
}: SliderInputProps) => {
  const isRange = isRangeValue(value)
  const sliderMinValue = sliderValueTransform?.sliderMin ?? min
  const sliderMaxValue = sliderValueTransform?.sliderMax ?? max
  const sliderStepValue = sliderValueTransform?.sliderStep ?? step

  /** Translate a value into the slider space expected by MUI Slider. */
  const mapToSliderValue = useMemo(
    () => sliderValueTransform?.toSlider ?? ((sliderValue: number) => sliderValue),
    [sliderValueTransform?.toSlider],
  )
  /** Transform slider values back into the original value space used by the inputs. */
  const mapFromSliderValue = useMemo(
    () => sliderValueTransform?.fromSlider ?? ((sliderValue: number) => sliderValue),
    [sliderValueTransform?.fromSlider],
  )

  /** Internal debounced value state for slider and inputs during drag and typing */
  const [internalValue, setInternalValue, cancelDebounce] = useDebounce<ControlledValue>(
    value,
    debounceMs,
    useCallback(
      (nextValue) => {
        if (isRange) {
          onChange(clampDecimal([nextValue[0], nextValue[1]] as DecimalRangeValue, min, max))
          return
        }
        onChange(clampDecimal(nextValue as Decimal, min, max))
      },
      [isRange, onChange, min, max],
    ),
  )

  /** The current display values for slider and inputs */
  const displayValue = useMemo<ControlledValue>(() => {
    if (isRange) {
      const currentRange = (isRangeValue(internalValue) ? internalValue : value) as DecimalRangeValue | undefined
      return currentRange ?? value
    }
    return (isRangeValue(internalValue) ? value : internalValue) ?? value
  }, [internalValue, isRange, value])

  /** The slider's numeric value with sliderValueTransform mapping if provided (e.g. logarithmic scales) */
  const sliderValue = useMemo<number | RangeValue>(() => {
    if (isRange) {
      const [first, second] = (displayValue as DecimalRangeValue) ?? []
      return [mapToSliderValue(Number(first)), mapToSliderValue(Number(second))]
    }
    const numericValue = Number(displayValue as Decimal | undefined)
    return mapToSliderValue(numericValue)
  }, [displayValue, isRange, mapToSliderValue])

  /** Commits value without debouncing for slider and inputs on slider release and input blur */
  const commitValue = useCallback(
    (nextValue: ControlledValue | undefined) => {
      if (nextValue == null) {
        return
      }
      setInternalValue(nextValue)
      cancelDebounce()
      if (isRange) {
        const [first, second] = nextValue as DecimalRangeValue
        if (first != null && second != null) {
          onChange([first, second])
        }
      } else {
        onChange(nextValue as Decimal)
      }
    },
    [cancelDebounce, isRange, onChange, setInternalValue],
  )

  /**Converts slider's numeric value to Decimal and maps back to original value space */
  const computeSliderValue = useCallback(
    (rawValue: number | RangeValue): ControlledValue | undefined => {
      if (Array.isArray(rawValue)) {
        const [first, second] = rawValue
        const firstDecimal = decimal(mapFromSliderValue(first))
        const secondDecimal = decimal(mapFromSliderValue(second))
        if (firstDecimal == null || secondDecimal == null) {
          return undefined
        }
        return [firstDecimal, secondDecimal]
      }
      const singleDecimal = decimal(mapFromSliderValue(rawValue))
      return singleDecimal ?? undefined
    },
    [mapFromSliderValue],
  )

  const handleSliderChange = useCallback<NonNullable<SliderProps['onChange']>>(
    (_e, newValue) => {
      const next = computeSliderValue(newValue as number | RangeValue)
      if (next != null) {
        setInternalValue(next)
      }
    },
    [computeSliderValue, setInternalValue],
  )

  const handleSliderCommit = useCallback<NonNullable<SliderProps['onChangeCommitted']>>(
    (_e, newValue) => {
      const next = computeSliderValue(newValue as number | RangeValue)
      if (next != null) {
        commitValue(next)
      }
    },
    [commitValue, computeSliderValue],
  )

  const handleInputChange = useCallback(
    (index: number) => (newValue: string | undefined) => {
      const numericValue = Number(newValue)
      if (isRange) {
        const currentRange = (displayValue as DecimalRangeValue) ?? []
        const nextFirst = index === 0 ? numericValue : Number(currentRange[0])
        let nextSecond = index === 1 ? numericValue : Number(currentRange[1])
        if (nextFirst > nextSecond) {
          // Left input (index === 0) should not be bigger than the right input value
          if (index === 0) nextSecond = nextFirst
          // For the right input it is allowed because when selecting "800" for example,
          // the user first types "8" which can be smaller than the first input.
          else return
        }
        setInternalValue([decimal(nextFirst) as Decimal, decimal(nextSecond) as Decimal])
        return
      }
      setInternalValue(decimal(numericValue) as Decimal)
    },
    [displayValue, isRange, setInternalValue],
  )

  const handleInputBlur = useCallback(
    (index: number) => (blurValue: Decimal | undefined) => {
      if (blurValue == null) {
        return
      }
      if (isRange) {
        const currentRange = (displayValue as DecimalRangeValue) ?? []
        let firstNumber = index === 0 ? Number(blurValue) : Number(currentRange[0])
        let secondNumber = index === 1 ? Number(blurValue) : Number(currentRange[1])
        if (firstNumber > secondNumber) {
          if (index === 0) {
            secondNumber = firstNumber
          } else {
            firstNumber = secondNumber
          }
        }
        commitValue([decimal(firstNumber) as Decimal, decimal(secondNumber) as Decimal])
        return
      }
      commitValue(blurValue)
    },
    [commitValue, displayValue, isRange],
  )

  const { onBlur: inputOnBlur, ...restInputProps } = inputProps ?? {}
  const { onChangeCommitted: sliderOnChangeCommitted, ...restSliderProps } = sliderProps ?? {}

  /** First input's value */
  const currentFirst = isRange ? (displayValue as DecimalRangeValue)?.[0] : (displayValue as Decimal | undefined)
  /** Second input's value */
  const currentSecond = isRange ? (displayValue as DecimalRangeValue)?.[1] : (displayValue as Decimal | undefined)

  const renderInput = (inputValue: Decimal | undefined, index: 0 | 1) => (
    <NumericTextField
      size={sliderInputSizeMap[size]}
      variant="standard"
      value={inputValue}
      min={decimal(min)}
      max={decimal(max)}
      onChange={(newValue) => {
        handleInputChange(index)(newValue)
      }}
      onBlur={(newValue) => {
        handleInputBlur(index)(newValue)
        inputOnBlur?.(newValue)
      }}
      disabled={disabled}
      sx={{ maxWidth: sliderInputMaxWidthMap[layoutDirection] }}
      data-testid={`slider-input-${testId}-${index}`}
      {...restInputProps}
    />
  )

  const renderSlider = (
    <Slider
      size={size}
      value={sliderValue}
      onChange={handleSliderChange}
      onChangeCommitted={(event, newValue) => {
        handleSliderCommit(event, newValue)
        sliderOnChangeCommitted?.(event, newValue)
      }}
      min={sliderMinValue}
      max={sliderMaxValue}
      step={sliderStepValue}
      disabled={disabled}
      scale={mapFromSliderValue}
      data-testid={`slider-${testId}`}
      {...restSliderProps}
    />
  )

  return (
    <Stack direction={layoutDirection} alignItems="center" columnGap={Spacing.sm} rowGap={Spacing.xs} width="100%">
      {layoutDirection === 'row' ? (
        <>
          {isRange && renderInput(currentFirst, 0)}
          {renderSlider}
          {renderInput(currentSecond, 1)}
        </>
      ) : (
        <>
          {renderSlider}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={isRange ? 'space-between' : 'flex-end'}
            columnGap={Spacing.sm}
            rowGap={Spacing.xs}
            width="100%"
          >
            {isRange && renderInput(currentFirst, 0)}
            {renderInput(currentSecond, 1)}
          </Stack>
        </>
      )}
    </Stack>
  )
}
