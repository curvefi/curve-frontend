import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'

type Props = {
  variant?: 'outlined'
  paddingSize?: 'small'
  selected: boolean
  disabled?: boolean
  name: string
  descriptionName: string
  description: string
  subData?: {
    name: string
    description: string
  }[]
  handleClick: () => void
}

export const SelectButton = ({
  variant,
  paddingSize,
  selected,
  disabled,
  name,
  descriptionName,
  description,
  subData,
  handleClick,
}: Props) => (
  <StyledButton
    disabled={disabled}
    variant={variant === 'outlined' ? 'outlined' : 'filled'}
    paddingSize={paddingSize}
    className={`${selected && 'selected'}`}
    onClick={handleClick}
  >
    <Row>
      <ButtonName>{descriptionName}</ButtonName>
    </Row>
    <Row>
      <ButtonDescription>{description}</ButtonDescription>
    </Row>
    {subData &&
      subData.map((item) => (
        <Row key={`${name}-${item.name}`}>
          <ButtonSubName>{item.name}</ButtonSubName>
          <ButtonSubData>{item.description}</ButtonSubData>
        </Row>
      ))}
  </StyledButton>
)

const Row = styled(Box)`
  display: flex;
  flex-direction: row;
  .extra-margin {
    margin-top: var(--spacing-1);
  }
`

const StyledButton = styled(Button)<{ paddingSize: 'small' | undefined }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  text-align: left;
  background: var(--dialog--background-color);
  color: var(--page--text-color);
  border: 1px solid var(--nav_button--border-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
  &:hover:not(:disabled):not(.loading) {
    color: var(--button-text-contrast--color);
    border: 1px solid var(--dropdown--active--background-color);
    background-color: var(--button_filled-hover-contrast--background-color);
  }
  &.selected {
    background: var(--dropdown--active--background-color);
    color: var(--button-text-contrast--color);
    border: 1px solid var(--dropdown--active--background-color);
    box-shadow: 3px 3px 0 var(--button--shadow-color);
    &:hover:not(:disabled):not(.loading) {
      background-color: var(--button_filled-hover-contrast--background-color);
      color: var(--button-text-contrast--color);
    }
  }
  &:disabled {
    &:hover:not(:disabled):not(.loading) {
      border-color: var(--button--disabled--border-color);
      color: var(--button--disabled--color);
    }
  }
  p {
    font-size: var(--font-size-2);
    font-weight: var(--normal);
  }
  ${(props) =>
    props.paddingSize === 'small' &&
    `
    padding: var(--spacing-3) var(--spacing-3);
  `}
`

const ButtonName = styled.h4``

const ButtonDescription = styled.p`
  margin-top: var(--spacing-1);
`

const ButtonSubName = styled.h5`
  margin: var(--spacing-1) var(--spacing-1) 0 0;
`

const ButtonSubData = styled.p`
  margin-top: var(--spacing-1);
`
