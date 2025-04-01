import AcUnitIcon from '@mui/icons-material/AcUnit'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react'
import { Accordion } from '../Accordion'
import { WithSkeleton } from '../WithSkeleton'

const meta: Meta<typeof Accordion> = {
  title: 'UI Kit/Widgets/Accordion',
  component: Accordion,
  argTypes: {
    title: {
      control: { disable: true },
      description: 'Title displayed in the accordion header (string or ReactNode)',
    },
    icon: {
      control: { disable: true },
      description: 'Optional icon to display before the title (ReactNode)',
    },
    ghost: {
      control: 'boolean',
      description: 'Whether to render without a border',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'The size of the accordion header',
    },
    info: {
      control: { disable: true },
      description: 'Optional information to display in the header (ReactNode)',
    },
    defaultExpanded: {
      control: 'boolean',
      description: 'Control initial expanded state',
    },
    children: {
      control: { disable: true },
      description: 'Content to display when the accordion is expanded (ReactNode)',
    },
  },
  args: {
    title: 'Accordion Title',
    ghost: false,
    size: 'small',
    defaultExpanded: false,
    children: 'This is the content of the accordion that appears when expanded.',
  },
}

type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component:
          "A customized accordion component that provides a collapsible content section. This component differs from the default MUI Accordion in that it's designed as a single-item constrained collapse component.",
        story: 'Default view with small size',
      },
    },
  },
}

export const Medium: Story = {
  args: {
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium-sized accordion header',
      },
    },
  },
}

export const WithIcon: Story = {
  args: {
    icon: <AcUnitIcon color="primary" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with an icon in the header',
      },
    },
  },
}

export const Ghost: Story = {
  args: {
    ghost: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion without a border (ghost mode)',
      },
    },
  },
}

export const WithInfo: Story = {
  args: {
    info: (
      <Typography variant="bodySRegular" color="textSecondary">
        Additional info
      </Typography>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with additional information in the header',
      },
    },
  },
}

export const WithReactNodeTitle: Story = {
  args: {
    title: (
      <WithSkeleton loading={false}>
        <Typography variant="highlightM" color="textPrimary">
          1 crvUSD = 1.0234 scrvUSD
        </Typography>
      </WithSkeleton>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with a ReactNode title containing custom typography',
      },
    },
  },
}

export const WithLoadingTitle: Story = {
  args: {
    title: (
      <WithSkeleton loading={true}>
        <Typography variant="highlightM" color="textPrimary">
          1 crvUSD = 1.0234 scrvUSD
        </Typography>
      </WithSkeleton>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with a loading state in the title',
      },
    },
  },
}

export const ComplexContent: Story = {
  args: {
    size: 'medium',
    defaultExpanded: true,
    children: (
      <Box sx={{ padding: 2 }}>
        <Typography variant="headingSBold">Complex Content</Typography>
        <Typography variant="bodySRegular">
          This accordion contains more complex content with multiple elements.
        </Typography>
        <List>
          <ListItem>List item 1</ListItem>
          <ListItem>List item 2</ListItem>
          <ListItem>List item 3</ListItem>
        </List>
        <Button variant="contained" size="small">
          Action Button
        </Button>
      </Box>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with complex nested content',
      },
    },
  },
}

export default meta
