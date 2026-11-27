import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenIcon } from '@ui/components/TokenIcon'
import { q } from '@ui/features/queries/util'

const meta: Meta<typeof TokenIcon> = {
  title: 'UI/Components/TokenIcon',
  component: TokenIcon,
  argTypes: {
    blockchainId: { control: 'text', description: 'Network the token is on' },
    tooltip: { control: 'text', description: 'Icon tooltip, mostly used for token symbol' },
    token: { control: 'object', description: 'Token whose icon is shown, with the coins of an LP token' },
    badgeAddress: { control: 'text', description: 'Secondary token contract address shown as a bottom-right badge' },
    disabled: { control: 'boolean', description: 'Whether the icon belongs to a disabled element or not' },
    size: { control: 'select', options: ['sm', 'mui-sm', 'mui-md', 'lg', 'xl'], description: 'Size of the icon' },
    showChainIcon: { control: 'boolean', description: 'Whether to show the blockchain chain badge icon' },
  },
  args: {
    blockchainId: 'ethereum',
    tooltip: 'ETH',
    token: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
    disabled: false,
    size: 'sm',
  },
}

type Story = StoryObj<typeof TokenIcon>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'TokenIcon displays a token logo with fallback to default image',
        story: 'Default view with small size',
      },
    },
  },
}

export const MuiSmall: Story = { args: { size: 'mui-sm' } }

export const MuiMedium: Story = { args: { size: 'mui-md' } }

export const WithFallback: Story = { args: { token: { address: '0x0' } } }

export const LpToken: Story = {
  args: {
    token: {
      address: '0xed785Af60bEd688baa8990cD5c4166221599A441',
      lpCoins: [
        { symbol: 'reUSD', address: '0x57aB1E0003F623289CD798B1824Be09a793e4Bec' },
        { symbol: 'sfrxUSD', address: '0xcf62F905562626CfcDD2261162a51fd02Fc9c5b6' },
      ],
    },
    tooltip: 'reUSD/sfrxUSD',
  },
  parameters: { docs: { description: { story: 'An LP token shown as one icon split between its first two coins.' } } },
}

export const LoadingLpCoins: Story = {
  args: {
    token: {
      address: '0xed785Af60bEd688baa8990cD5c4166221599A441',
      lpCoins: q({ data: undefined, isLoading: true, error: null }),
    },
  },
  parameters: { docs: { description: { story: 'A skeleton while the coins of a possible LP token load.' } } },
}

export const WithChainIcon: Story = {
  args: { showChainIcon: true },
  parameters: { docs: { description: { story: 'Token icon with blockchain chain badge overlay.' } } },
}

export const WithSecondaryIcon: Story = {
  args: { badgeAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  parameters: {
    docs: { description: { story: 'Token icon with a secondary token badge overlay in the bottom-right corner.' } },
  },
}

export const WithChainAndSecondaryIcon: Story = {
  args: { badgeAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', showChainIcon: true },
  parameters: {
    docs: { description: { story: 'Token icon with a secondary token badge overlay and blockchain chain badge' } },
  },
}

export const Disabled: Story = {
  args: { badgeAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', showChainIcon: true, disabled: true },
}

export default meta
