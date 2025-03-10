import { ReactNode, useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

type Props = {
  children: ReactNode
  prevVal: string | number | null | undefined
  newVal: string | number | null | undefined
}

const CompareValues = ({ children, prevVal, newVal }: Props) => {
  const [indicator, setIndicator] = useState('')

  useEffect(() => {
    let indicator = ''
    if (prevVal && newVal && +prevVal !== +newVal) {
      if (+prevVal > +newVal) {
        indicator = 'negative'
      } else if (+prevVal < +newVal) {
        indicator = 'positive'
      }
    }

    if (indicator) {
      setIndicator('')
      setIndicator(indicator)
    }
  }, [prevVal, newVal])

  return <CompareValuesWrapper className={indicator}>{children}</CompareValuesWrapper>
}

export const positiveFadeIn = keyframes`
  from {
    color: green;
  }
  to {
    color: inherit;
  }
`

export const negativeFadeIn = keyframes`
  from {
    color: red;
  }
  to {
    color: inherit;
  }
`

const CompareValuesWrapper = styled.span`
  &.negative {
    animation: ${negativeFadeIn} 0.5s ease-in-out;
  }

  &.positive {
    animation: ${positiveFadeIn} 0.5s ease-in-out;
  }
`

export default CompareValues
