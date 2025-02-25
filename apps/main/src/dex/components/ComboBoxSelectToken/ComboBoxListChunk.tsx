import type { ComboBoxSelectTokenProps } from '@/dex/components/ComboBoxSelectToken/types'

import React, { useRef } from 'react'
import styled from 'styled-components'

import useIntersectionObserver from 'ui/src/hooks/useIntersectionObserver'

import SelectTokenListItem from '@/dex/components/ComboBoxSelectToken/ComboBoxListItem'
import { Token } from '@/dex/types/main.types'

const SelectTokenListChunk = ({
  testId,
  blockchainId,
  inputRef,
  showBalances,
  selectedToken,
  tokens,
  dialogClose,
  handleOnSelectChange,
}: Pick<ComboBoxSelectTokenProps, 'testId' | 'blockchainId' | 'showBalances'> & {
  inputRef?: React.RefObject<HTMLInputElement | null>
  selectedToken: string
  tokens: Token[]
  dialogClose: () => void
  handleOnSelectChange(selectedToken: string): void
}) => {
  const ref = useRef<HTMLUListElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: false })

  const isVisible = !!entry?.isIntersecting

  return (
    <ItemsWrapper
      ref={ref}
      count={tokens.length}
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
        tokens.map((item) => (
          <SelectTokenListItem
            key={item.address}
            testId={testId}
            blockchainId={blockchainId}
            showBalances={showBalances}
            selectedToken={selectedToken}
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

export default SelectTokenListChunk
