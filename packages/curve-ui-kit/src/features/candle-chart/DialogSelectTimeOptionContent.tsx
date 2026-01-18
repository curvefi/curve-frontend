import { styled } from 'styled-components'
import { Button } from '@ui/Button/Button'
import type { TimeOptions } from './types'

type Props = {
  currentTimeOption: TimeOptions
  setCurrentTimeOption: (timeOption: TimeOptions) => void
  close?: () => void
}

export const DialogSelectChart = ({ currentTimeOption, setCurrentTimeOption, ...props }: Props) => {
  const handleClick = (timeOption: TimeOptions) => {
    setCurrentTimeOption(timeOption)
    if (props.close) {
      props.close()
    }
  }

  return (
    <Wrapper>
      <ButtonRow>
        <StyledSelectButton
          className={currentTimeOption === '15m' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('15m')}
        >
          15m
        </StyledSelectButton>
        <StyledSelectButton
          className={currentTimeOption === '30m' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('30m')}
        >
          30m
        </StyledSelectButton>
      </ButtonRow>
      <ButtonRow>
        <StyledSelectButton
          className={currentTimeOption === '1h' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('1h')}
        >
          1h
        </StyledSelectButton>
        <StyledSelectButton
          className={currentTimeOption === '4h' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('4h')}
        >
          4h
        </StyledSelectButton>
        <StyledSelectButton
          className={currentTimeOption === '6h' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('6h')}
        >
          6h
        </StyledSelectButton>
      </ButtonRow>
      <ButtonRow>
        <StyledSelectButton
          className={currentTimeOption === '1d' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('1d')}
        >
          1d
        </StyledSelectButton>
        <StyledSelectButton
          className={currentTimeOption === '7d' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('7d')}
        >
          7d
        </StyledSelectButton>
        <StyledSelectButton
          className={currentTimeOption === '14d' ? 'active' : ''}
          variant={'select'}
          onClick={() => handleClick('14d')}
        >
          14d
        </StyledSelectButton>
      </ButtonRow>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-2) auto 0 0;
  border-top: 1px solid var(--border-600);
`

const ButtonRow = styled.div`
  display: flex;
  margin-top: var(--spacing-2);
`

const StyledSelectButton = styled(Button)`
  color: var(--page--text-color);
  margin-right: var(--spacing-2);
  margin-top: var(--spacing-1);
  &.active {
    color: var(--button_text--hover--color);
    background-color: var(--button_outlined--hover--background-color);
    &:hover {
      opacity: 0.8;
    }
  }
`
