import type { Meta, StoryObj } from '@storybook/react-vite'
import { StableswapPricePreview } from './StableswapPricePreview'

const meta = {
  title: 'DEX/Charts/StableswapPricePreview',
  component: StableswapPricePreview,
  parameters: { layout: 'padded' },
  args: { amplification: '200', tokenCount: 2, tokenSymbol: 'USDC' },
  argTypes: {
    amplification: { control: 'text' },
    tokenCount: { control: { type: 'number', min: 2, max: 8, step: 1 } },
    tokenSymbol: { control: 'text' },
  },
} satisfies Meta<typeof StableswapPricePreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
