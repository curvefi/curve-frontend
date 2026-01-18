import { useState } from 'react'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ErrorReportModal } from '@ui-kit/features/report-error'
import { t } from '@ui-kit/lib/i18n'
import { createConfig } from '@wagmi/core'

const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [],
  transports: {
    [mainnet.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
})

const ErrorReportModalStory = ({ initialOpen = true }: { initialOpen?: boolean }) => {
  const [open, setOpen] = useState(initialOpen)

  return (
    <WagmiProvider config={wagmiConfig}>
      <Stack gap={2} alignItems="flex-start">
        <Button variant="contained" onClick={() => setOpen(true)}>
          {t`Open modal`}
        </Button>
        <ErrorReportModal
          isOpen={open}
          onClose={() => setOpen(false)}
          context={{ error: 'Story', title: 'Storybook test', subtitle: '' }}
        />
      </Stack>
    </WagmiProvider>
  )
}

const meta: Meta<typeof ErrorReportModalStory> = {
  title: 'UI Kit/Features/ErrorReportModal',
  component: ErrorReportModalStory,
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

type Story = StoryObj<typeof ErrorReportModalStory>

export const Default: Story = {}

export const Closed: Story = {
  args: {
    initialOpen: false,
  },
}
