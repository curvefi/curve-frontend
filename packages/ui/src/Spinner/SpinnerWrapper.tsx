import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type SpinnerWrapperProps = {
  vSpacing?: number
  minHeight?: string
}

export const SpinnerWrapper: IStyledComponent<'web', SpinnerWrapperProps & ComponentPropsWithRef<'div'>> =
  styled.div<SpinnerWrapperProps>`
    align-items: center;
    display: flex;
    justify-content: center;
    padding: var(--spacing-${({ vSpacing }) => vSpacing ?? '5'});
    width: 100%;

    ${({ minHeight }) => {
      if (minHeight) {
        return `
        min-height: ${minHeight};
        padding: 0;
      `
      }
    }}

    svg {
      vertical-align: baseline;

      circle:first-of-type {
        stroke: var(--spinner--foreground-color);
      }
      circle:last-of-type {
        stroke: var(--spinner--background-color);
      }
    }
  `
