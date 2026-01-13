import { InputHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import { Icon } from 'ui/src/Icon/Icon'
import { IconButton } from 'ui/src/IconButton'
import { RCEditClear } from 'ui/src/images'
import { InputDebounced } from 'ui/src/InputComp/InputDebounced'
import { InputProvider } from 'ui/src/InputComp/InputProvider'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  id: string
  value: string
  variant?: 'small'
  handleInputChange: (val: string) => void
  handleSearchClose: () => void
}

export const SearchInput = ({
  className,
  id,
  value,
  variant,
  handleInputChange,
  handleSearchClose,
  ...props
}: Props) => (
  <InputProvider
    className={className}
    grid
    gridTemplateColumns={'auto 1fr auto'}
    gridColumnGap={2}
    flexAlignItems="center"
    id={id}
    inputVariant={variant}
  >
    {variant === 'small' ? (
      <Icon name="Search" size={16} aria-label="search-icon" />
    ) : (
      <Icon name="Search" size={24} aria-label="search-icon" />
    )}
    <InputDebounced
      {...props}
      id={id}
      type="search"
      labelProps={false}
      value={value}
      delay={1000}
      variant={variant}
      onChange={handleInputChange}
    />
    <ClearButton
      className={value ? 'show' : ''}
      size={variant === 'small' ? 'x-small' : variant}
      onClick={handleSearchClose}
      padding={variant === 'small' ? 1 : 2}
    >
      <RCEditClear className="svg-tooltip" />
    </ClearButton>
  </InputProvider>
)

const ClearButton = styled(IconButton)`
  display: none;
  min-width: 1.5625rem; //25px
  opacity: 1;
  padding: 0;
  &.show {
    display: inline-block;
  }

  .svg-tooltip {
    position: relative;
    top: 2px;
  }
`
