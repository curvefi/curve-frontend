import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { constQ } from '@ui-kit/types/util'
import { ChainFilterChips } from '../DataTable/chips/ChainFilterChips'

const meta: Meta<typeof ChainFilterChips> = {
  title: 'UI Kit/DataTable/ChainFilterChips',
  component: ChainFilterChips,
  argTypes: {
    chainsQuery: {
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
  args: {
    selectedChains: [],
  },
}

export default meta
type Story = StoryObj<typeof ChainFilterChips>

const SAMPLE_CHAINS_QUERY = constQ([
  'ethereum',
  'arbitrum',
  'optimism',
  'polygon',
  'base',
  'gnosis',
  'avalanche',
  'fantom',
])

export const Default: Story = {
  args: {
    chainsQuery: SAMPLE_CHAINS_QUERY,
    selectedChains: ['ethereum'],
  },
}

export const MultipleSelected: Story = {
  args: {
    chainsQuery: SAMPLE_CHAINS_QUERY,
    selectedChains: ['ethereum', 'arbitrum', 'optimism'],
  },
}

export const NoneSelected: Story = {
  args: {
    chainsQuery: SAMPLE_CHAINS_QUERY,
  },
}

export const NoNetworksFound: Story = {
  args: {
    chainsQuery: constQ(undefined),
  },
}

export const Loading: Story = {
  args: {
    chainsQuery: { ...constQ(undefined), isLoading: true },
  },
}

/** Interactive example demonstrating single-select behavior like in IntegrationsList */
export const InteractiveSingleSelect: Story = {
  args: {
    chainsQuery: SAMPLE_CHAINS_QUERY,
    selectedChains: ['ethereum'],
  },
  render: function Render(args) {
    const [selected, setSelected] = useState<string>('ethereum')
    return (
      <ChainFilterChips
        chainsQuery={args.chainsQuery}
        selectedChains={[selected]}
        toggleChain={chain => setSelected(chain)}
      />
    )
  },
}

/** Interactive example demonstrating multi-select behavior */
export const InteractiveMultiSelect: Story = {
  args: {
    chainsQuery: SAMPLE_CHAINS_QUERY,
    selectedChains: ['ethereum'],
  },
  render: function Render(args) {
    const [selected, setSelected] = useState<string[]>(['ethereum'])
    const toggleChain = (chain: string) => {
      setSelected(prev => (prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain]))
    }
    return <ChainFilterChips chainsQuery={args.chainsQuery} selectedChains={selected} toggleChain={toggleChain} />
  },
}
