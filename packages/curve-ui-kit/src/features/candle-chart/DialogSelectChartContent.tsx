import { styled } from 'styled-components'
import { Button } from 'ui/src/Button/Button'
import type { LabelList } from './types'

type Props = {
  data: LabelList[]
  currentData: number | string
  setCurrentData: (index: number) => void
  close?: () => void
}

export const DialogSelectChart = ({ data, currentData, setCurrentData, ...props }: Props) => {
  const handleClick = (index: number) => {
    setCurrentData(index)
    if (props.close) {
      props.close()
    }
  }

  return (
    <Wrapper>
      {data.map((item, index) => (
        <StyledSelectButton
          className={index === currentData ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick(index)}
          key={index}
        >
          {item.label}
        </StyledSelectButton>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-2) auto 0 0;
  border-top: 1px solid var(--border-600);
`

const StyledSelectButton = styled(Button)`
  color: var(--page--text-color);
  margin-right: auto;
  margin-top: var(--spacing-2);
  font-family: var(--font);
  font-weight: var(--bold);
  text-transform: none;
  &.active {
    color: var(--button_text--hover--color);
    background-color: var(--button_outlined--hover--background-color);
    &:hover {
      opacity: 0.8;
    }
  }
`
