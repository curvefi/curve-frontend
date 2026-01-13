import { useState, useRef, useCallback, type MouseEvent, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const meta: Meta<typeof Select> = {
  title: 'UI Kit/Primitives/Select',
  component: Select,
}

type Story = StoryObj<typeof Select>

// Simple select component that handles its own state
const SimpleSelect = ({ options, placeholder }: { options: string[]; placeholder?: string }) => {
  const [value, setValue] = useState('')

  return (
    <Select
      value={value}
      onChange={(e) => setValue(e.target.value as string)}
      size="small"
      displayEmpty
      renderValue={() => <Typography>{value || placeholder}</Typography>}
      sx={{ width: '20rem' }}
    >
      {options.map((option: string) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  )
}

// Multi-select component with clear button and custom rendering
const MultiSelect = <T extends string>({
  options,
  placeholder,
  renderItem,
}: {
  options: T[]
  placeholder?: string
  renderItem?: (value: T) => ReactNode
}) => {
  const menuRef = useRef<HTMLLIElement | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const selectRef = useRef<HTMLDivElement | null>(null)
  const [selectWidth] = useResizeObserver(selectRef) ?? []
  const [isOpen, open, close] = useSwitch(false)

  const handleClear = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setSelected([])
      close()
    },
    [close],
  )

  const handleItemClick = useCallback(
    ({ currentTarget }: MouseEvent<HTMLLIElement>) => {
      const value = currentTarget.getAttribute('value') as T
      const newOptions = selected?.includes(value) ? selected.filter((v) => v !== value) : [...(selected ?? []), value]

      setSelected(newOptions)
    },
    [selected],
  )

  return (
    <>
      <Select
        ref={selectRef}
        open={isOpen}
        onOpen={open}
        onClose={close}
        displayEmpty
        value=""
        size="small"
        renderValue={() =>
          selected.length ? (
            selected.map((optionId, index) => (
              <MenuItem
                key={optionId}
                sx={{
                  display: 'inline-flex', // display inline to avoid wrapping
                  '&': { padding: 0, height: 0, minHeight: 0 }, // reset height and padding, no need when inline
                  gap: Spacing.xs, // default spacing is too large inline
                  ...(index > 0 && { ':before': { content: '", "' } }),
                }}
              >
                {renderItem?.(optionId as T) ?? optionId}
              </MenuItem>
            ))
          ) : (
            <Typography>{placeholder || 'Select options'}</Typography>
          )
        }
        sx={{ width: '20rem' }}
      />
      {isOpen !== undefined && (
        <Menu
          open={isOpen}
          onClose={close}
          // eslint-disable-next-line react-hooks/refs
          anchorEl={selectRef.current}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          slotProps={{ list: { sx: { minWidth: Math.round(selectWidth || 100) + 'px', paddingBlock: 0 } } }}
        >
          <Box borderBottom={(t) => `1px solid ${t.design.Layer[3].Outline}`} padding={Spacing.sm} component="li">
            <Button
              color="ghost"
              size="extraSmall"
              onClick={handleClear}
              data-testid="multi-select-clear"
              sx={{ paddingInline: 0 }}
            >
              Clear Selection
            </Button>
          </Box>
          {options.map((option) => (
            <InvertOnHover hoverRef={menuRef} key={option}>
              <MenuItem
                ref={menuRef}
                value={option}
                className={selected.includes(option) ? 'Mui-selected' : ''}
                onClick={handleItemClick}
              >
                {renderItem?.(option) || option}
              </MenuItem>
            </InvertOnHover>
          ))}
        </Menu>
      )}
    </>
  )
}

export const Simple: Story = {
  render: () => (
    <SimpleSelect
      options={['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']}
      placeholder="Select an option"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'A basic select component with simple text options',
      },
    },
  },
}

const options = ['ETH', 'USDC', 'DAI', 'USDT', 'WBTC', 'CRV'] as const

const addresses = {
  ETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
} as const

export const CustomRendering: Story = {
  render: () => (
    <MultiSelect
      options={options.map((x) => x)}
      placeholder="Select tokens"
      renderItem={(symbol: (typeof options)[number]) => (
        <TokenLabel blockchainId="ethereum" address={addresses[symbol]} tooltip={symbol} label={symbol} size="mui-sm" />
      )}
    />
  ),
  args: {
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'A multi-select component with custom rendering of options using Token',
      },
    },
  },
}

export default meta
