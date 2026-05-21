import AcUnitIcon from '@mui/icons-material/AcUnit'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
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
      options: ['extraSmall', 'small', 'medium'],
      description: 'The size of the accordion header',
    },
    indicator: {
      control: 'select',
      options: ['chevron', 'plusMinus'],
      description: 'The visual indicator displayed at the end of the header',
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
    title: 'Accordion title',
    ghost: false,
    size: 'small',
    indicator: 'chevron',
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
  args: { size: 'medium' },
  parameters: { docs: { description: { story: 'Medium-sized accordion header' } } },
}

export const ExtraSmall: Story = {
  args: { size: 'extraSmall' },
  parameters: { docs: { description: { story: 'extraSmall-sized accordion header' } } },
}

export const WithIcon: Story = {
  args: { icon: <AcUnitIcon color="primary" /> },
  parameters: { docs: { description: { story: 'Accordion with an icon in the header' } } },
}

export const Ghost: Story = {
  args: { ghost: true },
  parameters: { docs: { description: { story: 'Accordion without a border (ghost mode)' } } },
}

export const PlusMinusClosed: Story = {
  args: {
    ghost: true,
    indicator: 'plusMinus',
    title: 'What is LlamaLend?',
  },
  parameters: { docs: { description: { story: 'FAQ-style accordion with a plus indicator' } } },
}

export const PlusMinusOpen: Story = {
  args: {
    defaultExpanded: true,
    ghost: true,
    indicator: 'plusMinus',
    title: 'What is LlamaLend?',
    children:
      "LlamaLend is Curve's non-custodial lending infrastructure. All markets are one-way isolated: each market has one collateral and one borrowable asset.",
  },
  parameters: { docs: { description: { story: 'FAQ-style accordion with a minus indicator when open' } } },
}

export const MotionStressFaq: Story = {
  render: () => (
    <Stack maxWidth="48rem" gap={1}>
      <Accordion title="What is LlamaLend?" ghost indicator="plusMinus" sx={{ paddingBlock: 2 }}>
        <Typography variant="bodyMRegular">
          LlamaLend is Curve's non-custodial lending infrastructure with isolated one-way markets.
        </Typography>
      </Accordion>
      <Accordion title="When does liquidation happen?" ghost indicator="plusMinus" sx={{ paddingBlock: 2 }}>
        <Typography variant="bodyMRegular">
          Full liquidation happens when health reaches zero. Before that, liquidation protection can gradually convert
          collateral.
        </Typography>
      </Accordion>
      <Accordion title="What is Supply APR?" ghost indicator="plusMinus" sx={{ paddingBlock: 2 }}>
        <Typography variant="bodyMRegular">
          Supply APR is the annualized rate earned by suppliers and changes as market utilization changes.
        </Typography>
      </Accordion>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'FAQ-like accordions for checking rapid toggles, independent open states, and plus/minus crossfades.',
      },
    },
  },
}

export const ReducedMotionReference: Story = {
  render: () => (
    <Stack maxWidth="48rem" gap={1}>
      <Typography variant="bodySRegular" color="textSecondary">
        Enable reduced motion in the browser or OS to confirm the content and indicator state changes become instant.
      </Typography>
      <Accordion title="Reduced motion accordion" ghost indicator="plusMinus" defaultExpanded sx={{ paddingBlock: 2 }}>
        <Typography variant="bodyMRegular">
          The accordion should preserve layout and accessibility while disabling decorative transform and opacity
          motion.
        </Typography>
      </Accordion>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Reference story for validating `prefers-reduced-motion` behavior.',
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
  parameters: { docs: { description: { story: 'Accordion with additional information in the header' } } },
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

export const Controlled: Story = {
  render: () => {
    // eslint-disable-next-line @eslint-react/rules-of-hooks
    const [expanded, , , toggle] = useSwitch(true)
    return (
      <Stack gap={4}>
        <Stack direction="row" gap={2} alignItems="center">
          <Button variant="outlined" onClick={toggle} sx={{ marginRight: 1 }}>
            Toggle from outside
          </Button>
          <Typography variant="bodySRegular" component="span">
            Current state: {expanded ? 'Open' : 'Closed'}
          </Typography>
        </Stack>
        <Accordion title="Controlled Accordion" expanded={expanded} toggle={toggle}>
          <Typography variant="bodySRegular">
            This accordion is controlled externally. You can toggle it using the button above or by clicking the
            accordion header.
          </Typography>
        </Accordion>
      </Stack>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accordion with controlled state. The expanded state is managed externally using the `expanded` and `toggle` props.',
      },
    },
  },
}

export const FaqSection: Story = {
  render: () => (
    <Stack maxWidth="80rem">
      <Stack minHeight="3.5rem" justifyContent="end" paddingBlockEnd={1}>
        <Typography variant="headingSBold" color="textSecondary">
          FAQs
        </Typography>
      </Stack>
      <Stack gap={1}>
        <Stack
          minHeight="2.5rem"
          justifyContent="end"
          paddingBlockEnd={1}
          sx={{ borderBottom: t => `1px solid ${t.design.Layer[1].Outline}` }}
        >
          <Typography variant="headingXsBold" color="textSecondary">
            Core Understanding
          </Typography>
        </Stack>
        <Stack gap={1} paddingInlineStart={2}>
          <Accordion title="What is LlamaLend?" ghost indicator="plusMinus" defaultExpanded sx={{ paddingBlock: 2 }}>
            <Typography variant="bodyMRegular">
              LlamaLend is Curve's non-custodial lending infrastructure. All markets are one-way isolated: each market
              has one collateral and one borrowable asset.
            </Typography>
          </Accordion>
          <Accordion title="How does LlamaLend work?" ghost indicator="plusMinus" sx={{ paddingBlock: 2 }}>
            <Typography variant="bodyMRegular">
              You deposit collateral and borrow against it. You pay a dynamic borrow rate; there are no opening or
              closing fees.
            </Typography>
          </Accordion>
        </Stack>
      </Stack>
    </Stack>
  ),
  parameters: {
    docs: { description: { story: 'FAQ section composition using ghost accordions and plus/minus indicators' } },
  },
}

export default meta
