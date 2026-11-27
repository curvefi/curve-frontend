import { useRef, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button, Select, MenuItem, Typography, Stack } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  LargeTokenInput,
  type LargeTokenInputRef,
  type LargeTokenInputProps,
} from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInput'
import { q } from '@ui/features/queries/util'

// Test options for token selector with corresponding pre-seeded wallet balances
type Token = { name: string; walletBalance: { symbol: string; balance: Decimal; notionalValueUsd?: Decimal } }
const TOKEN_OPTIONS: Token[] = [
  { name: 'Inferium', walletBalance: { symbol: 'ETH', balance: '1000', notionalValueUsd: '2000' } },
  { name: 'Bitcorn', walletBalance: { symbol: 'BTC', balance: '2500', notionalValueUsd: '125000' } },
  { name: 'The Ripple', walletBalance: { symbol: 'RPL', balance: '5000', notionalValueUsd: '10000' } },
  { name: 'Decimalator', walletBalance: { symbol: 'DEC', balance: '69.4201337', notionalValueUsd: '138.84' } },
]

const DEFAULT_MAX_BALANCE: LargeTokenInputProps['maxBalance'] = {
  balance: '420420.1337',
  showSlider: true,
  chips: 'range',
}

const TokenSelector = ({
  onTokenChange,
}: {
  onTokenChange: (tokenInfo: { balance: Decimal; symbol: string }) => void
}) => {
  const [value, setValue] = useState(TOKEN_OPTIONS[0].name)

  return (
    <Select
      value={value}
      onChange={e => {
        const selectedToken = e.target.value
        setValue(selectedToken)
        const selectedOption = TOKEN_OPTIONS.find(option => option.name === selectedToken)
        if (selectedOption) onTokenChange(selectedOption.walletBalance)
      }}
      size="small"
      displayEmpty
      renderValue={() => <Typography>{value || 'Select token'}</Typography>}
      sx={{ width: '10rem', backgroundColor: t => t.design.Layer[1].Fill }}
    >
      {TOKEN_OPTIONS.map(option => (
        <MenuItem key={option.name} value={option.name}>
          {option.name}
        </MenuItem>
      ))}
    </Select>
  )
}

const LargeTokenInputWithTokenSelector = (props: LargeTokenInputProps) => {
  const inputRef = useRef<LargeTokenInputRef>(null)
  const [walletBalance, setWalletBalance] = useState(props.walletBalance)

  return (
    <LargeTokenInput
      {...props}
      walletBalance={walletBalance}
      tokenSelector={
        <TokenSelector
          onTokenChange={newToken => {
            // Check if for the WithoutWalletBalance story so selecting a token won't make pop up the wallet balance.
            if (walletBalance) setWalletBalance(newToken)
            inputRef.current?.resetBalance()
          }}
        />
      }
    />
  )
}

const meta: Meta<typeof LargeTokenInputWithTokenSelector> = {
  title: 'EVM UI/Shared UI/LargeTokenInput',
  component: LargeTokenInputWithTokenSelector,
  argTypes: {
    walletBalance: {
      control: 'object',
      description: 'Configuration for wallet balance, token symbol, and display options',
    },
    maxBalance: {
      control: 'object',
      description: 'Configuration for max balance behavior, including slider and chips',
    },
    message: { control: 'object', description: 'Optional message to display below the input (can be a React node)' },
    label: { control: 'text', description: 'Optional label explaining what the input is all about' },
    validationError: { control: 'object', description: 'Validation error for the form value' },
    tokenSelector: { control: 'object', description: 'React component to use for token selection' },
    inputBalanceUsd: { control: 'object', description: 'Optional dollar value or query for the input balance' },
    children: { control: 'object', description: 'Optional children to be rendered below the input' },
  },
  args: {
    name: 'amount',
    walletBalance: TOKEN_OPTIONS[0].walletBalance,
    maxBalance: DEFAULT_MAX_BALANCE,
    message: 'This is a helpful message',
    label: 'You pay',
    validationError: null,
    inputBalanceUsd: '1337',
    onBalance: fn(),
  },
}

type Story = StoryObj<typeof LargeTokenInputWithTokenSelector>

export const Default: Story = {}

export const WithoutWalletBalance: Story = { args: { walletBalance: undefined } }

export const WithoutMaxBalanceSlider: Story = { args: { maxBalance: { ...DEFAULT_MAX_BALANCE, showSlider: false } } }

export const WithChipsCustom: Story = {
  args: { maxBalance: { ...DEFAULT_MAX_BALANCE, chips: [{ label: 'Yolo', newBalance: () => '1337.42' }] } },
}

export const WithoutMessage: Story = { args: { message: undefined } }

export const WithError: Story = {
  args: { message: 'This is an error message', validationError: new Error('Invalid amount') },
}

export const LoadingStates: Story = {
  render: args => {
    const loading = q<Decimal>({ data: undefined, isLoading: true, error: null })
    const states: Record<string, Partial<LargeTokenInputProps>> = {
      'Input USD': { value: '10', inputBalanceUsd: loading },
      'Wallet balance': { walletBalance: { symbol: 'ETH', balance: loading } },
      'Wallet USD rate': {
        walletBalance: {
          symbol: 'ETH',
          balance: '1000',
          usdRate: q<number>({ data: undefined, isLoading: true, error: null }),
        },
      },
      'Wallet notional': { walletBalance: { symbol: 'ETH', balance: '1000', usdRate: 2, notionalValueUsd: loading } },
      'Maximum balance': { maxBalance: { ...DEFAULT_MAX_BALANCE, balance: loading } },
    }
    return (
      <Stack sx={{ width: '30rem', gap: 2 }}>
        {Object.entries(states).map(([label, props]) => (
          <LargeTokenInputWithTokenSelector key={label} {...args} {...props} label={label} />
        ))}
      </Stack>
    )
  },
}

const WALLET_ERRORS = [
  { label: 'Cached balance', data: '1000', isLoading: false },
  { label: 'No balance', data: undefined, isLoading: false },
  { label: 'Refreshing balance', data: '1000', isLoading: true },
] satisfies { label: string; data: Decimal | undefined; isLoading: boolean }[]

export const WalletBalanceErrors: Story = {
  args: { value: '10' },
  render: args => (
    <Stack sx={{ width: '30rem', gap: 2 }}>
      {WALLET_ERRORS.map(({ label, data, isLoading }) => (
        <LargeTokenInputWithTokenSelector
          key={label}
          {...args}
          label={label}
          testId={label}
          walletBalance={{
            symbol: 'ETH',
            balance: q({ data, isLoading, error: new Error('Failed to load wallet balance') }),
            usdRate: 2,
            buttonTestId: 'wallet-balance',
          }}
        />
      ))}
    </Stack>
  ),
  play: async ({ canvasElement, args }) => {
    for (const { label, data, isLoading } of WALLET_ERRORS) {
      const element = within(canvasElement).getByTestId(label)
      const canvas = within(element)
      const amount = canvas.getByPlaceholderText('0.00')
      await expect(element.querySelector('[data-error]')).toBeVisible()
      await expect(canvas.queryByTestId('wallet-balance')).toBeNull()
      await expect(amount).toHaveAttribute('aria-invalid', 'false')
      await expect(amount).toBeEnabled()
      if (isLoading) {
        await expect(canvas.getByTestId('balance-value').closest('.MuiSkeleton-root')).toBeVisible()
      } else {
        await expect(element.querySelector('.MuiSkeleton-root')).toBeNull()
        if (data) {
          await expect(canvas.getByTestId('balance-value')).toBeVisible()
          await expect(canvas.getByTestId('balance-value')).toHaveAttribute('data-value', data)
          await userEvent.clear(amount)
          await userEvent.type(amount, '5')
          await expect(args.onBalance).toHaveBeenLastCalledWith('5')
        }
      }
    }
  },
}

export const QueryTransitions: Story = {
  render: function Render(args) {
    const [isLoading, setIsLoading] = useState(true)
    const [amount, setAmount] = useState<Decimal>()
    const balance = q<Decimal>({ data: isLoading ? undefined : '10', isLoading, error: null })
    return (
      <Stack sx={{ width: '30rem', gap: 2 }}>
        <Button onClick={() => setIsLoading(!isLoading)}>{isLoading ? 'Resolve queries' : 'Reload queries'}</Button>
        <LargeTokenInput
          {...args}
          value={amount}
          onBalance={value => {
            setAmount(value)
            args.onBalance(value)
          }}
          inputBalanceUsd={q<Decimal>({ data: `${+(amount ?? 0) * 2}`, isLoading, error: null })}
          walletBalance={{ balance, symbol: 'ETH', usdRate: 2 }}
          maxBalance={{ ...DEFAULT_MAX_BALANCE, balance }}
          tokenSelector={<Typography>ETH</Typography>}
        />
      </Stack>
    )
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const amount = canvas.getByPlaceholderText('0.00')
    await expect(amount).toBeEnabled()
    await expect(amount).toBeVisible()
    await expect(amount.closest('.MuiSkeleton-root')).toBeNull()
    await expect(canvasElement.querySelector('.MuiSkeleton-root')).not.toBeNull()
    await expect(args.onBalance).not.toHaveBeenCalled()

    await userEvent.type(amount, '5')
    await expect(args.onBalance).toHaveBeenLastCalledWith('5')
    await userEvent.click(canvas.getByRole('button', { name: 'Resolve queries' }))
    await expect(amount).toHaveValue('5')
    await expect(canvas.getByPlaceholderText('0.00')).toBe(amount)
    await expect(canvasElement.querySelector('.MuiSkeleton-root')).toBeNull()
    await expect(args.onBalance).toHaveBeenCalledTimes(1)

    await userEvent.click(canvas.getByRole('button', { name: 'Reload queries' }))
    await expect(canvas.getByPlaceholderText('0.00')).toBe(amount)
    await expect(amount).toHaveValue('5')
    await userEvent.clear(amount)
    await expect(amount).toHaveValue('')
    await expect(amount).toBeEnabled()
  },
}

export const WithReactNodeMessage: Story = {
  args: {
    message: (
      <Stack spacing={1}>
        <Typography variant="bodyMBold">Important Message</Typography>
        <Typography variant="bodySRegular" color="textSecondary">
          This is some additional information about your transaction
        </Typography>
        <Typography variant="bodyXsRegular" color="textTertiary">
          Fees may apply based on network conditions
        </Typography>
      </Stack>
    ),
  },
}

export const WithChildren: Story = {
  args: {
    children: (
      <Stack spacing={1} sx={{ padding: 2, backgroundColor: t => t.design.Layer[2].Fill }}>
        <Typography variant="bodyMBold">Additional Content</Typography>
        <Typography variant="bodySRegular" color="textSecondary">
          The children prop allows you to render custom content below the input. This can be useful for displaying
          additional information, actions, or any other custom UI elements.
        </Typography>
      </Stack>
    ),
  },
}

export default meta
