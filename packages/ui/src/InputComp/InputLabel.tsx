import { useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { Loader } from '@ui/Loader'
import { useInputContext } from './InputContext'
import type { InputLabelProps } from './types'

export const InputLabel = ({
  className,
  label,
  description,
  descriptionLoading,
  testId,
  ...props
}: InputLabelProps & { testId?: string }) => {
  const descriptionRef = useRef<HTMLSpanElement | null>(null)
  const { id } = useInputContext()
  const [skeleton, setSkeleton] = useState<[number, number] | null>(null)

  const descriptionEl = descriptionRef.current

  useEffect(() => {
    const { offsetWidth, offsetHeight } = descriptionEl ?? {}
    if (offsetWidth && offsetHeight && description !== '-') {
      setSkeleton([offsetWidth > 10 ? offsetWidth : 20, offsetHeight - 4] as [number, number])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptionEl?.offsetHeight, descriptionEl?.offsetWidth])

  return (
    <StyledLabel
      {...props}
      data-testid={`inp-label-${testId}`}
      className={className}
      htmlFor={id}
      descriptionLoading={typeof descriptionLoading !== 'undefined'}
    >
      {label}{' '}
      {descriptionLoading && skeleton ? (
        <Loader isLightBg skeleton={skeleton} />
      ) : description ? (
        <span data-testid={`inp-label-description-${testId}`} ref={descriptionRef}>
          {description}
        </span>
      ) : null}
    </StyledLabel>
  )
}

const StyledLabel = styled.label<{ descriptionLoading: boolean }>`
  display: inline-block;
  font-size: var(--font-size-1);
  font-weight: 500;
  line-height: 1;
  margin-top: 0.1875rem; // 3px;
`

InputLabel.displayName = 'InputLabel'
