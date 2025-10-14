import { type MouseEvent, ReactNode, useCallback, useMemo, useRef } from 'react'
import { Stack } from '@mui/material'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { type DeepKeys } from '@tanstack/table-core'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getUniqueSortedStrings } from '@ui-kit/utils/sorting'
import type { LlamaMarketColumnId } from '../columns.enum'

const { Spacing } = SizesAndSpaces

/**
 * A filter for tanstack tables that allows multi-select of string values.
 */
export const MultiSelectFilter = <T,>({
  columnFilters,
  setColumnFilter,
  data,
  defaultText,
  defaultTextMobile,
  renderItem,
  field,
  id,
}: {
  columnFilters?: Record<string, unknown>
  setColumnFilter?: (id: string, value: unknown) => void
  data?: T[]
  defaultText: string
  defaultTextMobile: string
  field: DeepKeys<T>
  id: LlamaMarketColumnId
  renderItem?: (value: string) => ReactNode
}) => {
  const selectRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLLIElement | null>(null)
  const [selectWidth] = useResizeObserver(selectRef) ?? []
  const [isOpen, open, close] = useSwitch(false)
  const isMobile = useIsMobile()
  // data can be undefined when the drawer renders for mobile
  const options = useMemo(() => (data ? getUniqueSortedStrings(data, field) : []), [data, field])
  const selectedOptions = (columnFilters?.[id] as string[] | undefined) ?? undefined
  const onClear = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setColumnFilter?.(id, undefined)
      close()
    },
    [id, setColumnFilter, close],
  )

  const onItemClicked = useCallback(
    // click in the "Clear Selection" Box, outside the button, mui calls this with filter=[undefined] 😞
    ({ currentTarget }: MouseEvent<HTMLLIElement>) => {
      const value = currentTarget.getAttribute('value')!
      const options = selectedOptions?.includes(value)
        ? selectedOptions.filter((v) => v !== value)
        : [...(selectedOptions ?? []), value]
      setColumnFilter?.(id, options.length ? options : undefined)
    },
    [setColumnFilter, id, selectedOptions],
  )

  // the select component does a lot of stuff with its children, so we cannot add a wrapper for the theme inverter.
  // therefore, I was forced to reimplement the menu separate from the select component.
  return (
    <>
      <Select
        ref={selectRef}
        name={id}
        open={false}
        onOpen={open}
        onClose={close}
        displayEmpty
        fullWidth
        value=""
        data-testid={`multi-select-filter-${id}`}
        size="small"
        renderValue={() =>
          selectedOptions?.length && selectedOptions.length < options.length ? (
            selectedOptions.map((optionId, index) => (
              <MenuItem
                key={optionId}
                sx={{
                  display: 'inline-flex', // display inline to avoid wrapping
                  '&': { padding: 0, height: 0, minHeight: 0 }, // reset height and padding, no need when inline
                  gap: Spacing.xs, // default spacing is too large inline
                  ...(index > 0 && { ':before': { content: '", "' } }),
                }}
              >
                {renderItem?.(optionId) ?? optionId}
              </MenuItem>
            ))
          ) : (
            <Typography variant="bodySBold">{isMobile ? defaultTextMobile : defaultText}</Typography>
          )
        }
      ></Select>
      {isOpen !== undefined && (
        <Menu
          data-testid={`menu-${id}`}
          open={isOpen}
          onClose={close}
          anchorEl={selectRef.current}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          slotProps={{
            list: { sx: { minWidth: Math.round(selectWidth || 100) + 'px', paddingBlock: 0 } },
            paper: { sx: { maxWidth: '100%' } },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            borderBottom={(t) => `1px solid ${t.design.Layer[3].Outline}`}
            padding={Spacing.sm}
            component="li"
          >
            <Button
              color="ghost"
              size="extraSmall"
              onClick={onClear}
              data-testid="multi-select-clear"
              sx={{ paddingInline: 0 }}
            >{t`Clear Selection`}</Button>
          </Stack>
          {options.map((optionId) => {
            const isSelected = selectedOptions?.includes(optionId)
            return (
              <InvertOnHover hoverEl={menuRef.current} key={optionId}>
                <MenuItem
                  ref={menuRef}
                  value={optionId}
                  className={isSelected ? 'Mui-selected' : ''}
                  onClick={onItemClicked}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {renderItem?.(optionId) ?? optionId}
                  {isSelected && <CheckIcon sx={{ marginLeft: Spacing.sm }} />}
                </MenuItem>
              </InvertOnHover>
            )
          })}
        </Menu>
      )}
    </>
  )
}
