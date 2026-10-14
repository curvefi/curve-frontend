import { InputHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import { IconButton } from '@legacy-ui/IconButton'
import { InputDebounced } from '@legacy-ui/InputComp/InputDebounced'
import { InputProvider } from '@legacy-ui/InputComp/InputProvider'
import { SearchIcon } from '@ui/icons/SearchIcon'
import { RCEditClear } from '@ui/images'

type Props = {
  className?: string
  id: string
  value: string
  variant?: 'small'
  handleInputChange: (val: string) => void
  handleSearchClose: () => void
} & InputHTMLAttributes<HTMLInputElement>

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
    gridTemplateColumns="auto 1fr auto"
    gridColumnGap={2}
    flexAlignItems="center"
    id={id}
    inputVariant={variant}
  >
    <SearchIcon sx={{ fontSize: variant === 'small' ? 16 : 24 }} />
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
