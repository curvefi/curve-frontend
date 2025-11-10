import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellIcon, BellRingingIcon } from './BellIcon'

const meta: Meta<typeof BellRingingIcon> = {
  title: 'UI Kit/Icons/BellRingingIcon',
  component: BellRingingIcon,
  argTypes: {
    fontSize: {
      control: 'select',
      options: ['small', 'medium', 'large', 'inherit'],
      description: 'The size of the icon',
    },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'error', 'warning', 'info', 'success'],
      description: 'The color of the icon',
    },
  },
  args: {
    fontSize: 'medium',
    color: 'inherit',
  },
}

type Story = StoryObj<typeof BellRingingIcon>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'BellRingingIcon is an animated version of BellIcon that rings when hovered.',
        story: 'Default BellRingingIcon - hover to see the ringing animation',
      },
    },
  },
}

export const Comparison: Story = {
  render: () => (
    <Stack direction="row" gap={4} alignItems="center">
      <Box textAlign="center">
        <BellIcon fontSize="large" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Regular Bell (no animation)
        </Typography>
      </Box>
      <Box textAlign="center">
        <BellRingingIcon fontSize="large" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Ringing Bell (hover me!)
        </Typography>
      </Box>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison between regular BellIcon and BellRingingIcon with hover animation',
      },
    },
  },
}

export const DifferentSizes: Story = {
  render: () => (
    <Stack direction="row" gap={3} alignItems="center">
      <Box textAlign="center">
        <BellRingingIcon fontSize="small" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Small
        </Typography>
      </Box>
      <Box textAlign="center">
        <BellRingingIcon fontSize="medium" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Medium
        </Typography>
      </Box>
      <Box textAlign="center">
        <BellRingingIcon fontSize="large" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Large
        </Typography>
      </Box>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'BellRingingIcon in different sizes - hover over any bell to see the animation',
      },
    },
  },
}

export const DifferentColors: Story = {
  render: () => (
    <Stack direction="row" gap={3} alignItems="center">
      <Box textAlign="center">
        <BellRingingIcon fontSize="large" color="primary" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Primary
        </Typography>
      </Box>
      <Box textAlign="center">
        <BellRingingIcon fontSize="large" color="secondary" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Secondary
        </Typography>
      </Box>
      <Box textAlign="center">
        <BellRingingIcon fontSize="large" color="error" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Error
        </Typography>
      </Box>
      <Box textAlign="center">
        <BellRingingIcon fontSize="large" color="warning" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Warning
        </Typography>
      </Box>
      <Box textAlign="center">
        <BellRingingIcon fontSize="large" color="success" />
        <Typography variant="bodySRegular" display="block" mt={1}>
          Success
        </Typography>
      </Box>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'BellRingingIcon in different colors - hover over any bell to see the animation',
      },
    },
  },
}

export const AnimationDetails: Story = {
  render: () => (
    <Box>
      <BellRingingIcon fontSize="large" sx={{ display: 'block', mx: 'auto', mb: 2 }} />
      <Typography variant="bodySRegular" textAlign="center">
        Hover over the bell to see the ringing animation
      </Typography>
      <Box mt={3} p={2} bgcolor="background.paper" borderRadius={1}>
        <Typography variant="headingXsBold" gutterBottom>
          Animation Details
        </Typography>
        <Stack gap={1}>
          <Typography variant="bodySRegular">• Duration: 0.6 seconds</Typography>
          <Typography variant="bodySRegular">• Easing: ease-in-out</Typography>
          <Typography variant="bodySRegular">• Transform origin: top center</Typography>
          <Typography variant="bodySRegular">• Max rotation: ±14 degrees</Typography>
          <Typography variant="bodySRegular">• Effect: Smooth damped oscillation</Typography>
        </Stack>
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Technical details of the bell ringing animation',
      },
    },
  },
}

export default meta
