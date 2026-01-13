import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChainFilterChips } from '../DataTable/chips/ChainFilterChips'

const meta: Meta<typeof ChainFilterChips> = {
  title: 'UI Kit/DataTable/ChainFilterChips',
  component: ChainFilterChips,
  argTypes: {
    chains: {
      control: 'object',
      description: 'Array of blockchain network IDs to display',
    },
    selectedChains: {
      control: 'object',
      description: 'Array of currently selected chain IDs',
    },
    toggleChain: {
      action: 'toggleChain',
      description: 'Callback fired when a chain chip is toggled',
    },
  },
}

export default meta
type Story = StoryObj<typeof ChainFilterChips>

const SAMPLE_CHAINS = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'base', 'gnosis', 'avalanche', 'fantom']

export const Default: Story = {
  args: {
    chains: SAMPLE_CHAINS,
    selectedChains: ['ethereum'],
  },
}

export const MultipleSelected: Story = {
  args: {
    chains: SAMPLE_CHAINS,
    selectedChains: ['ethereum', 'arbitrum', 'optimism'],
  },
}

export const NoneSelected: Story = {
  args: {
    chains: SAMPLE_CHAINS,
    selectedChains: [],
  },
}

/** Interactive example demonstrating single-select behavior like in IntegrationsList */
export const InteractiveSingleSelect: Story = {
  args: {
    chains: SAMPLE_CHAINS,
    selectedChains: ['ethereum'],
  },
  render: function Render(args) {
    const [selected, setSelected] = useState<string>('ethereum')
    return (
      <ChainFilterChips chains={args.chains} selectedChains={[selected]} toggleChain={(chain) => setSelected(chain)} />
    )
  },
}

/** Interactive example demonstrating multi-select behavior */
export const InteractiveMultiSelect: Story = {
  args: {
    chains: SAMPLE_CHAINS,
    selectedChains: ['ethereum'],
  },
  render: function Render(args) {
    const [selected, setSelected] = useState<string[]>(['ethereum'])
    const toggleChain = (chain: string) => {
      setSelected((prev) => (prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]))
    }
    return <ChainFilterChips chains={args.chains} selectedChains={selected} toggleChain={toggleChain} />
  },
}
