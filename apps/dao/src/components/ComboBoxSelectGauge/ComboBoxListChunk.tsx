import type { ComboBoxSelectGaugeProps } from '@dao/components/ComboBoxSelectGauge/types'

import React, { useRef } from 'react'
import styled from 'styled-components'

import useIntersectionObserver from 'ui/src/hooks/useIntersectionObserver'

import SelectGaugeListItem from '@dao/components/ComboBoxSelectGauge/ComboBoxListItem'
import { GaugeFormattedData } from '@dao/types/dao.types'

const SelectGaugeListChunk = ({
  testId,
  imageBaseUrl,
  inputRef,
  selectedGauge,
  gauges,
  dialogClose,
  handleOnSelectChange,
}: Pick<ComboBoxSelectGaugeProps, 'testId' | 'imageBaseUrl'> & {
  inputRef?: React.RefObject<HTMLInputElement>
  selectedGauge: GaugeFormattedData | null
  gauges: GaugeFormattedData[]
  dialogClose: () => void
  handleOnSelectChange(selectedGauge: string): void
}) => {
  const ref = useRef<HTMLUListElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: false })

  const isVisible = !!entry?.isIntersecting

  return (
    <ItemsWrapper
      ref={ref}
      count={gauges.length}
      className={isVisible ? 'visible' : ''}
      onKeyDown={(evt) => {
        // scroll up/down list
        const activeElement = document.activeElement

        if (evt.key === 'ArrowUp') {
          const previousButton = activeElement?.parentElement?.previousElementSibling
          if (previousButton) {
            previousButton.querySelector('button')?.focus()
          } else if (inputRef?.current) {
            inputRef.current.focus()
          }
        } else if (evt.key === 'ArrowDown') {
          const nextButton = activeElement?.parentElement?.nextElementSibling
          if (nextButton) {
            nextButton.querySelector('button')?.focus()
          }
        } else if (evt.key === 'Escape') {
          dialogClose()
        }
      }}
    >
      {isVisible &&
        gauges.map((item) => (
          <SelectGaugeListItem
            key={item.address}
            testId={testId}
            imageBaseUrl={imageBaseUrl}
            selectedGauge={selectedGauge}
            {...item}
            handleOnSelectChange={handleOnSelectChange}
          />
        ))}
    </ItemsWrapper>
  )
}

const ItemsWrapper = styled.ul<{ count: number }>`
  height: ${({ count }) => `${count * 50}px`};
`

export default SelectGaugeListChunk
