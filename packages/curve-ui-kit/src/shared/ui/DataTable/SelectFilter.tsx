import { type ReactNode, useMemo, useRef } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export type Option<T = string> = { id: T; label: ReactNode }

export const SelectFilter = <T extends string>({
  value,
  options,
  onSelected,
  name,
}: {
  value: T
  onSelected: (value: Option<T>) => void
  options: Option<T>[]
  name: string
}) => {
  const selectRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLLIElement | null>(null)
  const [selectWidth] = useResizeObserver(selectRef) ?? []
  const [isOpen, open, close] = useSwitch(false)
  const selectedOption = useMemo(() => options.find((option) => option.id === value), [options, value])

  // the select component does a lot of stuff with its children, so we cannot add a wrapper for the theme inverter.
  // therefore, I was forced to reimplement the menu separate from the select component.
  return (
    <>
      <Select
        ref={selectRef}
        name={name}
        open={false}
        onOpen={open}
        onClose={close}
        displayEmpty
        fullWidth
        value=""
        data-testid={`select-filter-${name}`}
        size="small"
        slotProps={{ input: { sx: { paddingBlock: Spacing.md } } }} // smaller padding, bodyMBold has a larger font
        renderValue={() => (
          <Typography component="span" variant="bodyMBold">
            {t`Sort by: `}
            {selectedOption?.label}
          </Typography>
        )}
      />
      {isOpen !== undefined && (
        <Menu
          data-testid={`menu-${name}`}
          open={isOpen}
          onClose={close}
          // eslint-disable-next-line react-hooks/refs
          anchorEl={selectRef.current}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          slotProps={{ list: { sx: { minWidth: Math.round(selectWidth || 100) + 'px', paddingBlock: 0 } } }}
        >
          {options.map(({ id, label }) => (
            <InvertOnHover hoverRef={menuRef} key={id}>
              <MenuItem
                ref={menuRef}
                value={id}
                className={selectedOption?.id === id ? 'Mui-selected' : ''}
                onClick={() => {
                  onSelected({ id, label })
                  close()
                }}
              >
                <Typography component="span" variant="bodyMBold">
                  {label}
                </Typography>
              </MenuItem>
            </InvertOnHover>
          ))}
        </Menu>
      )}
    </>
  )
}
