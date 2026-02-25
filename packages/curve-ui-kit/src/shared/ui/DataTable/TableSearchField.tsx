import { useCallback, useRef } from 'react'
import Box from '@mui/material/Box'
import { notFalsy } from '@primitives/objects.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SearchIcon } from '@ui-kit/shared/icons/SearchIcon'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import { Duration, TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableButton } from './TableButton'

const { ButtonSize } = SizesAndSpaces

type Props = {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  testId?: string
  toggleExpanded?: () => void
  isExpanded?: boolean
}

export const TableSearchField = ({
  value,
  placeholder,
  onChange,
  testId,
  toggleExpanded,
  isExpanded = true,
}: Props) => {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, onFocus, onBlur] = useSwitch()
  const isMobile = useIsMobile()
  const collapsible = !!toggleExpanded

  const handleExpand = useCallback(() => {
    toggleExpanded?.()
    // Focus the input when expanding
    const timeout = setTimeout(() => {
      searchInputRef.current?.focus()
    }, Duration.Focus)
    return () => clearTimeout(timeout)
  }, [toggleExpanded])

  const handleBlur = useCallback(() => {
    onBlur()
    // Collapse when unfocused and empty in collapsible mode
    if (collapsible && !value) {
      toggleExpanded?.()
    }
  }, [onBlur, value, collapsible, toggleExpanded])

  const searchField = (
    <SearchField
      placeholder={placeholder}
      value={value}
      onFocus={onFocus}
      onBlur={handleBlur}
      inputRef={searchInputRef}
      onSearch={onChange}
      data-testid={notFalsy('table-text-search', testId).join('-')}
      size="small"
      sx={[
        (t) => ({
          transition: t.design.Button.Transition,
          ...(!isFocused && {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: `transparent transparent ${t.design.Inputs.Base.Default.Border.Default} transparent`,
            },
          }),
        }),
        { flex: '1 1 auto', minWidth: 0 },
      ]}
    />
  )

  return collapsible ? (
    <Box
      sx={{
        display: 'flex',
        // on mobile when search is de-expanded, animation doesn't look good
        transition: isMobile && !isExpanded ? 'none' : TransitionFunction,
        flex: isExpanded ? '1 1 auto' : `0 0 ${ButtonSize.sm}`,
        width: isExpanded ? 0 : `${ButtonSize.sm}`,
        overflow: 'hidden',
      }}
    >
      {isExpanded ? (
        searchField
      ) : (
        <TableButton
          onClick={handleExpand}
          icon={SearchIcon}
          active={isExpanded}
          testId={notFalsy(`btn-expand-search`, testId).join('-')}
        />
      )}
    </Box>
  ) : (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {searchField}
    </Box>
  )
}
