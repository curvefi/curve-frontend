import { useState } from 'react'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { t } from '@ui-kit/lib/i18n'
import { SubmitErrorReportModal } from '@ui-kit/widgets/SubmitErrorReport'
import { createConfig } from '@wagmi/core'

const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [],
  transports: {
    [mainnet.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
})

const SubmitErrorReportModalStory = ({ initialOpen = true }: { initialOpen?: boolean }) => {
  const [open, setOpen] = useState(initialOpen)

  return (
    <WagmiProvider config={wagmiConfig}>
      <Stack gap={2} alignItems="flex-start">
        <Button variant="contained" onClick={() => setOpen(true)}>
          {t`Open modal`}
        </Button>
        <SubmitErrorReportModal open={open} onClose={() => setOpen(false)} />
      </Stack>
    </WagmiProvider>
  )
}

const meta: Meta<typeof SubmitErrorReportModalStory> = {
  title: 'UI Kit/Features/SubmitErrorReportModal',
  component: SubmitErrorReportModalStory,
  args: {
    initialOpen: true,
  },
  argTypes: {
    initialOpen: {
      control: 'boolean',
      description: 'Whether the modal is open when the story loads',
    },
  },
}

export default meta

type Story = StoryObj<typeof SubmitErrorReportModalStory>

export const Default: Story = {}

export const Closed: Story = {
  args: {
    initialOpen: false,
  },
}
