import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils/responsive'
import { Context, Slider } from './SlideTabsWrapper'

type TabProps = {
  className?: string
  disabled?: boolean
  label: string
  tabIdx: number
  tabLeft: number
  tabTop: number
  tabWidth: number
  onChange: () => void
}

export const SlideTab = ({ className, disabled, label, tabIdx, tabLeft, tabWidth, tabTop, onChange }: TabProps) => {
  const { activeIdx, setSliderPosition } = useContext(Context)
  const checked = tabIdx === activeIdx

  useEffect(() => {
    if (checked && tabWidth) setSliderPosition({ width: tabWidth, top: tabTop })
  }, [checked, setSliderPosition, tabTop, tabWidth])

  return (
    <>
      <Input
        disabled={disabled}
        type="radio"
        tabLeft={tabLeft}
        id={label}
        name={label}
        checked={checked}
        onChange={onChange}
      />
      <Label htmlFor={label} className={`tab ${className} ${disabled ? 'disabled' : ''} ${checked && 'active'}`.trim()}>
        {label}
      </Label>
    </>
  )
}

SlideTab.defaultProps = {
  className: '',
}

const Label = styled.label`
  display: inline-block;
  padding: 0 var(--spacing-2);
  padding-bottom: var(--spacing-1);

  color: var(--tab--color);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight--bold);
  &:not(.disabled) {
    cursor: pointer;
  }

  opacity: 0.7;

  :hover:not(.disabled) {
    opacity: 1;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 0 var(--spacing-narrow);
  }
`

const Input = styled.input<{ tabLeft: number }>`
  display: none;
  &:checked ~ ${Slider} {
    ${({ tabLeft }) => `left: ${tabLeft}px;`}
  }

  &:checked + ${Label} {
    opacity: 1;
  }
`

export default SlideTab
