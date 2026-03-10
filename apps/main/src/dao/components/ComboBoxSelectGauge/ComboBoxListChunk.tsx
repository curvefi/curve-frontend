import { RefObject, useRef } from 'react'
import { styled } from 'styled-components'
import { ComboBoxListItem as SelectGaugeListItem } from '@/dao/components/ComboBoxSelectGauge/ComboBoxListItem'
import type { ComboBoxSelectGaugeProps } from '@/dao/components/ComboBoxSelectGauge/types'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { useIntersectionObserver } from '@ui-kit/hooks/useIntersectionObserver'

export const SelectGaugeListChunk = ({
  testId,
  inputRef,
  selectedGauge,
  gauges,
  dialogClose,
  handleOnSelectChange,
}: Pick<ComboBoxSelectGaugeProps, 'testId'> & {
  inputRef?: RefObject<HTMLInputElement | null>
  selectedGauge: GaugeFormattedData | null
  gauges: GaugeFormattedData[]
  dialogClose: () => void
  handleOnSelectChange(selectedGauge: string): void
}) => {
  const ref = useRef<HTMLUListElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: false })

  return (
    <ItemsWrapper
      ref={ref}
      count={gauges.length}
      className={entry.isIntersecting ? 'visible' : ''}
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
      {entry.isIntersecting &&
        gauges.map((item) => (
          <SelectGaugeListItem
            key={item.address}
            testId={testId}
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
