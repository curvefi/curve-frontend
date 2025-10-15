import { useCallback, useRef } from 'react'
import Box from '@mui/material/Box'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SearchIcon } from '@ui-kit/shared/icons/SearchIcon'
import { SearchField, SearchFieldProps } from '@ui-kit/shared/ui/SearchField'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableButton } from './TableButton'

const { ButtonSize } = SizesAndSpaces

type Props = {
  value: string
  onChange: (value: string) => void
  testId?: string
  toggleExpanded: () => void
  isExpanded: boolean
}

export const TableSearchField = ({ value, onChange, testId, toggleExpanded, isExpanded = true }: Props) => {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, onFocus, onBlur] = useSwitch()
  const isMobile = useIsMobile()
  const collapsible = !!toggleExpanded

  const handleExpand = useCallback(() => {
    toggleExpanded?.()
    // Focus the input when expanding
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 50)
  }, [toggleExpanded])

  const handleBlur = useCallback(() => {
    onBlur()
    // Collapse when unfocused and empty in collapsible mode
    if (collapsible && !value) {
      toggleExpanded?.()
    }
  }, [onBlur, collapsible, value, toggleExpanded])

  return collapsible ? (
    <Box
      sx={{
        display: 'flex',
        // on mobile when search is de-expanded, animation doesn't look good
        transition: isMobile && !isExpanded ? 'none' : TransitionFunction,
        flex: isExpanded ? '1 1 auto' : `0 0 ${ButtonSize.sm}`,
        width: isExpanded ? 0 : `${ButtonSize.sm}`,
      }}
    >
      {!isExpanded ? (
        <TableButton
          onClick={handleExpand}
          icon={SearchIcon}
          active={isExpanded}
          testId={testId ? `btn-expand-search-${testId}` : 'btn-expand-search'}
        />
      ) : (
        <StyledSearchField
          value={value}
          searchInputRef={searchInputRef}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          isFocused={isFocused}
          testId={testId}
          sx={{ flex: '1 1 auto', minWidth: 0 }}
        />
      )}
    </Box>
  ) : (
    <Box
      sx={{
        width: '478px',
        maxWidth: '100%',
      }}
    >
      <StyledSearchField
        value={value}
        searchInputRef={searchInputRef}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        isFocused={isFocused}
        testId={testId}
        sx={{ flex: '1 1 auto', minWidth: 0 }}
      />
    </Box>
  )
}

const StyledSearchField = ({
  isFocused,
  searchInputRef,
  onChange,
  sx,
  testId,
  ...props
}: {
  isFocused?: boolean
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onChange: (value: string) => void
  testId?: string
} & Omit<SearchFieldProps, 'inputRef' | 'onSearch' | 'onChange'>) => (
  <SearchField
    inputRef={searchInputRef}
    onSearch={onChange}
    data-testid={testId ? `table-text-search-${testId}` : 'table-text-search'}
    size="small"
    {...props}
    sx={[
      (t) => ({
        transition: t.design.Button.Transition,
        ...(!isFocused && {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: `transparent transparent ${t.design.Inputs.Base.Default.Border.Default} transparent`,
          },
        }),
      }),
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  />
)
