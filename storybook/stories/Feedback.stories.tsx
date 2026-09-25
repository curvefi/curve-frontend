import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const colorEntries = (value: object, prefix = ''): { name: string; color: string }[] =>
  Object.entries(value).flatMap(([key, child]) => {
    const name = prefix ? `${prefix} / ${key}` : key
    return typeof child === 'string' ? [{ name, color: child }] : colorEntries(child as object, name)
  })

const Swatch = ({ name, color }: { name: string; color: string }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm, minWidth: 280 }}>
    <Box
      sx={{ width: 28, height: 28, flexShrink: 0, backgroundColor: color, border: '1px solid', borderColor: 'divider' }}
    />
    <Stack>
      <Typography variant="bodySRegular">{name}</Typography>
      <Typography variant="bodyXsRegular" color="textSecondary">
        {color}
      </Typography>
    </Stack>
  </Stack>
)

const TokenColors = () => {
  const { design } = useTheme()
  const groups = [
    { title: 'Text', colors: colorEntries(design.Text.TextColors) },
    { title: 'Layer feedback', colors: colorEntries(design.Layer.Feedback) },
  ]

  return (
    <Stack sx={{ gap: Spacing.md }}>
      <Typography variant="bodySRegular" color="textSecondary">
        Text tokens are for type. Layer feedback tokens are for fills. Switch the theme toolbar to compare Light, Dark,
        and Chad.
      </Typography>
      {groups.map(({ title, colors }) => (
        <Stack key={title} sx={{ gap: Spacing.sm }}>
          <Typography variant="headingXsBold">{title}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: Spacing.sm }}>
            {colors.map(swatch => (
              <Swatch key={swatch.name} {...swatch} />
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  )
}

const meta: Meta<typeof TokenColors> = {
  title: 'UI/Themes/Feedback',
  component: TokenColors,
  parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj<typeof TokenColors>

export const Comparison: Story = {}
