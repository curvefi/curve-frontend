import { RefObject, useRef } from 'react'
import {
  AriaSliderProps,
  mergeProps,
  useFocusRing,
  useNumberFormatter,
  useSlider,
  useSliderThumb,
  VisuallyHidden,
} from 'react-aria'
import type { SliderState } from 'react-stately'
import { useSliderState } from 'react-stately'
import styled, { css } from 'styled-components'
import Spinner from 'ui/src/Spinner/Spinner'
import SpinnerWrapper from 'ui/src/Spinner/SpinnerWrapper'
import Chip from 'ui/src/Typography/Chip'
import type { NumberFormatOptions } from '@internationalized/number'

interface Props extends AriaSliderProps {
  formatOptions: NumberFormatOptions
  hideValue?: boolean
  hideLabel?: boolean
  loading?: boolean
}

const SliderMultiThumb = ({ loading, hideValue, hideLabel, ...props }: Props) => {
  const trackRef = useRef(null)
  const numberFormatter = useNumberFormatter(props.formatOptions)
  const state = useSliderState({ ...props, numberFormatter })
  const { groupProps, trackProps, labelProps, outputProps } = useSlider(props, state, trackRef)
  const isDisplayOnly = typeof props.onChange === 'undefined' && typeof props.onChangeEnd === 'undefined'

  return (
    <SliderWrapper {...groupProps} className={`slider ${state.orientation}`}>
      {props.label && (
        <SliderLabelContainer className={hideLabel && hideValue ? 'visually-hidden' : ''}>
          <LabelWrapper>
            <Label className={hideLabel ? 'visually-hidden' : ''} {...labelProps}>
              {props.label}
            </Label>
          </LabelWrapper>
          <output className={hideValue ? 'visually-hidden' : ''} {...outputProps}>
            {!loading && `${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`}
          </output>
        </SliderLabelContainer>
      )}
      <SliderContentWrapper>
        {loading && (
          <StyledSpinnerWrapper vSpacing={1}>
            <Spinner size={20} />
          </StyledSpinnerWrapper>
        )}
        <SliderTrackerWrapper className={loading ? 'loading' : ''}>
          <SliderTrack
            {...trackProps}
            ref={trackRef}
            className={`track ${state.isDisabled || loading || isDisplayOnly ? 'disabled' : ''} ${
              isDisplayOnly ? 'isDisplayOnly' : ''
            } `}
          >
            {state.values.map((_, idx) => (
              <Thumb key={idx} index={idx} isDisplayOnly={isDisplayOnly} state={state} trackRef={trackRef} />
            ))}
          </SliderTrack>
        </SliderTrackerWrapper>
      </SliderContentWrapper>
    </SliderWrapper>
  )
}

function Thumb(props: {
  index: number
  isDisplayOnly: boolean
  state: SliderState
  trackRef: RefObject<HTMLDivElement | null>
}) {
  const { state, trackRef, index, isDisplayOnly } = props
  const inputRef = useRef(null)
  const { thumbProps, inputProps, isDragging } = useSliderThumb(
    {
      index,
      trackRef,
      inputRef,
    },
    state,
  )

  const { focusProps, isFocusVisible } = useFocusRing()

  return isDisplayOnly ? (
    <DisplayThumbWrapper
      {...thumbProps}
      index={index}
      className={`thumb ${isFocusVisible ? 'focus' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <StyledChip
        tooltip={state.values[index].toFixed(2)}
        tooltipProps={
          index === 0 ? { placement: 'top left' } : index === state.values.length - 1 ? { placement: 'top right' } : {}
        }
      ></StyledChip>
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </DisplayThumbWrapper>
  ) : (
    <ThumbWrapper {...thumbProps} className={`thumb ${isFocusVisible ? 'focus' : ''} ${isDragging ? 'dragging' : ''}`}>
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </ThumbWrapper>
  )
}

const LabelWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`

const StyledChip = styled(Chip)`
  display: block;
  background-color: transparent;
  width: 100%;
  height: 100%;
`

const Label = styled.label`
  font-size: var(--font-size-2);
  margin-bottom: 0.25rem; // 4px
`

const thumbWrapperCss = css`
  width: 20px;
  height: 20px;

  &:not(.disabled) {
    cursor: pointer;
  }

  &.disabled {
    background: var(--button--disabled--background-color);
    box-shadow: none;
  }
`

const DisplayThumbWrapper = styled.div<{ index: number }>`
  ${thumbWrapperCss};
  width: 10px;

  background: ${({ index }) => {
    if (index === 0 || index === 1) {
      return `var(--button--disabled--background-color)`
    } else {
      return `var(--button--background-color)`
    }
  }};
`

const ThumbWrapper = styled.div`
  ${thumbWrapperCss};
  background: var(--button--background-color);
  box-shadow: 1px 1px 0 var(--button--shadow-color);

  .dragging {
    background: dimgray;
    box-shadow: none;
  }

  .focus {
    background: orange;
  }

  &:active {
    box-shadow: none;
  }
`

const SliderTrack = styled.div`
  &:before {
    content: attr(x);
    display: block;
    position: absolute;
    background: var(--switch--background-color);

    &:not(.isDisplayOnly) {
      opacity: 0.7;
      box-shadow: inset 1px 1px 2px var(--switch--box-shadow);
    }
  }

  .disabled {
    opacity: 0.4;
  }
`

const SliderTrackerWrapper = styled.div`
  padding: 0 0.7rem;

  &.loading {
    opacity: 0.7;
  }
`

const SliderContentWrapper = styled.div`
  position: relative;
  min-height: 1.875rem; //30px
`

const SliderWrapper = styled.div`
  display: flex;

  &.horizontal {
    flex-direction: column;
    width: 100%;

    ${SliderTrack} {
      height: 30px;
      width: 100%;

      &:before {
        height: 8px;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    ${DisplayThumbWrapper} {
      top: 50%;
    }

    ${ThumbWrapper} {
      top: 50%;
    }
  }
`

const SliderLabelContainer = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
  justify-content: space-between;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  position: absolute;
`

export default SliderMultiThumb
