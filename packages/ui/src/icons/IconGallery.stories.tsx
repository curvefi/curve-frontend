import { createElement, type ComponentType, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ChevronLeftIcon } from '@ui/icons/ChevronLeftIcon'

type IconComponent = ComponentType<Record<string, unknown>>

type ViteImportMeta = { glob: <T>(pattern: string, options: { eager: true }) => Record<string, T> }

const iconModules = (import.meta as ImportMeta & ViteImportMeta).glob<Record<string, unknown>>('./*.tsx', {
  eager: true,
})

const iconProps: Record<string, Record<string, unknown>> = {
  ChainIcon: { blockchainId: 'ethereum' },
  FavoriteHeartIcon: { isFavorite: true },
  RotatableIcon: { icon: ChevronLeftIcon },
}

const icons = Object.entries(iconModules)
  .filter(([path]) => !path.includes('.stories.'))
  .flatMap(([, module]) => Object.entries(module))
  .filter(([name, component]) => /^[A-Z]/.test(name) && typeof component !== 'string')
  .toSorted(([firstName], [secondName]) => firstName.localeCompare(secondName))
  .map(([name, component]) => ({ name, preview: createElement(component as IconComponent, iconProps[name]) }))

const meta = {
  title: 'UI/Icons/Gallery',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'A dynamically generated gallery of every exported icon in this directory.' } },
  },
} satisfies Meta

type Story = StoryObj<typeof meta>

export const AllIcons: Story = {
  render: () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
        gap: 2,
        width: '100%',
      }}
    >
      {icons.map(({ name, preview }) => (
        <IconCard key={name} name={name}>
          {preview}
        </IconCard>
      ))}
    </Box>
  ),
}

const IconCard = ({ children, name }: { children: ReactNode; name: string }) => (
  <Stack
    sx={{
      alignItems: 'center',
      flexDirection: 'column',
      gap: SizesAndSpaces.Spacing.xs,
      justifyContent: 'center',
      padding: 2,
    }}
  >
    <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>{children}</Box>
    <Typography align="center">{name}</Typography>
  </Stack>
)

export default meta
