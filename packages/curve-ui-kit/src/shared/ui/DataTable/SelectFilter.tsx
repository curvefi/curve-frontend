import { type ReactNode, useRef } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'

type Option<T = string> = { id: T; label: ReactNode }

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

  const selectedOption = options.find((option) => option.id === value)

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
        renderValue={() => (
          <MenuItem
            sx={{
              display: 'inline-flex', // display inline to avoid wrapping
              '&': { padding: 0, height: 0, minHeight: 0 }, // reset height and padding, no need when inline
            }}
          >
            <Typography component="span" variant="bodyMBold">
              {t`Sort`}
              {`: `}
              {selectedOption?.label}
            </Typography>
          </MenuItem>
        )}
      ></Select>
      {isOpen !== undefined && (
        <Menu
          data-testid={`menu-${name}`}
          open={isOpen}
          onClose={close}
          anchorEl={selectRef.current}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          slotProps={{ list: { sx: { minWidth: Math.round(selectWidth || 100) + 'px', paddingBlock: 0 } } }}
        >
          {options.map(({ id, label }) => (
            <InvertOnHover hoverEl={menuRef.current} key={id}>
              <MenuItem
                ref={menuRef}
                value={id}
                className={selectedOption?.id === id ? 'Mui-selected' : ''}
                onClick={() => onSelected({ id, label })}
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
