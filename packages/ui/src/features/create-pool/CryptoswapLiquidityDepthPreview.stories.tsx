import type { Meta, StoryObj } from '@storybook/react-vite'
import { CryptoswapLiquidityDepthPreview } from './CryptoswapLiquidityDepthPreview'

const meta = {
  title: 'DEX/Charts/CryptoswapLiquidityDepthPreview',
  component: CryptoswapLiquidityDepthPreview,
  parameters: { layout: 'padded' },
  args: { amplification: '400000', gamma: '0.000145', initialPrice: '3412.50', tokenCount: 2 },
  argTypes: {
    amplification: { control: 'text' },
    gamma: { control: 'text' },
    initialPrice: { control: 'text' },
    tokenCount: { control: 'select', options: [2, 3] },
  },
} satisfies Meta<typeof CryptoswapLiquidityDepthPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
