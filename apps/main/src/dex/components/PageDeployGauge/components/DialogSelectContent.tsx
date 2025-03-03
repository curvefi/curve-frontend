import styled from 'styled-components'
import Button from '@ui/Button'

type Props = {
  data: string[]
  currentData: string | null
  setCurrentData: (data: string) => void
  close?: () => void
}

const DialogSelectContent = ({ data, currentData, setCurrentData, ...props }: Props) => {
  const handleClick = (data: string) => {
    setCurrentData(data)
    if (props.close) {
      props.close()
    }
  }

  return (
    <Wrapper>
      {data.map((item, index) => (
        <StyledSelectButton
          className={item === currentData ? 'active' : ''}
          variant={'text'}
          onClick={() => handleClick(item)}
          key={index}
        >
          {item}
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
  width: 100%;
`

const StyledSelectButton = styled(Button)`
  color: var(--page--text-color);
  margin-right: auto;
  margin-top: var(--spacing-2);
  font-size: var(--font-size-2);
  width: 100%;
  text-align: left;
  &.active {
    color: var(--button_text--hover--color);
    background-color: var(--button_outlined--hover--background-color);
    &:hover {
      opacity: 0.8;
    }
  }
`

export default DialogSelectContent
