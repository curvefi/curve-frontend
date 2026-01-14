import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormTab, FormTabs } from '../../../widgets/DetailPageLayout/FormTabs'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TabsSwitcherProps } from '../TabsSwitcher'

const { MaxWidth } = SizesAndSpaces

type DemoParams = {
  availableBalance: number
  canWithdraw: boolean
  showAdvanced: boolean
  userAddress: string
}

const Panel = ({ title, body }: { title: string; body: string }) => (
  <Stack gap={1} sx={{ padding: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
    <Typography variant="headingSBold">{title}</Typography>
    <Typography variant="bodyMRegular">{body}</Typography>
  </Stack>
)
const OverviewTab = ({ availableBalance, userAddress }: DemoParams) => (
  <Panel
    title="Overview"
    body={`Connected as ${userAddress}. Available balance: ${availableBalance.toLocaleString()} crvUSD.`}
  />
)
const DepositTab = ({ availableBalance }: DemoParams) => (
  <Panel
    title="Deposit"
    body={`Use this tab for simple flows. Balance shown in labels comes from props (${availableBalance.toLocaleString()} crvUSD).`}
  />
)
const WithdrawTab = ({ canWithdraw }: DemoParams) => (
  <Panel
    title="Withdraw"
    body={
      canWithdraw
        ? 'Withdraw actions are available and the sub-tab is enabled.'
        : 'This sub-tab shows the disabled state when withdrawals are locked.'
    }
  />
)
const AdvancedTab = () => <Panel title="Advanced" body="Conditional tab that appears when enabled." />
const numberedTabs = (length: number): FormTab<DemoParams>[] =>
  Array.from({ length }, (_, index) => ({
    value: `additional-tab-${index}`,
    label: `Tab ${index + 1}`,
    visible: () => true,
    component: () => (
      <Panel
        title={`Title ${index + 1}`}
        body="crvUSD is Curve’s USD-pegged stablecoin that can be borrowed against a variety of battle-tested crypto collaterals."
      />
    ),
  }))

const AlwaysInMenuTab = () => (
  <Panel title="Always in Menu" body="This tab is configured to always be in the kebab menu." />
)

const baseMenu: FormTab<DemoParams>[] = [
  {
    value: 'overview',
    label: 'Overview',
    visible: () => true,
    component: OverviewTab,
  },
  {
    value: 'manage',
    label: ({ availableBalance }) => `Manage (${availableBalance.toLocaleString()} crvUSD)`,
    visible: () => true,
    subTabs: [
      { value: 'deposit', label: 'Deposit', visible: () => true, component: DepositTab },
      {
        value: 'withdraw',
        label: ({ canWithdraw }) => (canWithdraw ? 'Withdraw' : 'Withdraw (locked)'),
        visible: () => true,
        disabled: ({ canWithdraw }) => !canWithdraw,
        component: WithdrawTab,
      },
    ],
  },
  {
    value: 'advanced',
    label: 'Advanced',
    visible: ({ showAdvanced }) => showAdvanced,
    component: AdvancedTab,
  },
]

const kebabMenuWithForcedOverflow: FormTab<DemoParams>[] = [
  ...baseMenu,
  {
    value: 'kebab-item',
    label: 'Settings',
    alwaysInKebab: () => true,
    visible: () => true,
    component: AlwaysInMenuTab,
  },
]

type StoryArgs = DemoParams & {
  shouldWrap: boolean
  overflow: TabsSwitcherProps<DemoParams>['overflow']
  menu: FormTab<DemoParams>[]
}

const FormTabsStory = ({ shouldWrap, overflow, menu, ...params }: StoryArgs) => (
  <Grid size={{ mobile: 12, tablet: 5, desktop: 4 }} width={{ desktop: MaxWidth.actionCard }}>
    <FormTabs<DemoParams> params={params} shouldWrap={shouldWrap} overflow={overflow} menu={menu} />
  </Grid>
)

const meta: Meta<typeof FormTabsStory> = {
  title: 'UI Kit/Widgets/FormTabs',
  component: FormTabsStory,
  args: {
    availableBalance: 1250,
    canWithdraw: true,
    showAdvanced: false,
    userAddress: '0x1234...cafe',
    shouldWrap: false,
    overflow: 'standard',
    menu: baseMenu,
  },
  argTypes: {
    availableBalance: {
      control: { type: 'number', min: 0 },
      description: 'Value forwarded to labels and tab content.',
    },
    canWithdraw: {
      control: 'boolean',
      description: 'Toggles the disabled state of the Withdraw sub-tab.',
    },
    showAdvanced: {
      control: 'boolean',
      description: 'Controls visibility of the Advanced tab.',
    },
    userAddress: {
      control: 'text',
      description: 'Sample address injected into tab content.',
    },
    shouldWrap: {
      control: 'boolean',
      description: 'Renders content with the legacy AppForm wrapper background.',
    },
    overflow: {
      control: 'select',
      options: ['standard', 'kebab', 'fullWidth'],
      description: 'The overflow behavior of the tabs.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'FormTabs renders primary and nested tabs with optional visibility and disabled states. This story showcases the possible states with sample content.',
      },
    },
  },
}

type Story = StoryObj<typeof FormTabsStory>

export const BasicTabs: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default layout with nested Manage sub-tabs and dynamic labels.',
      },
    },
  },
}

export const WithConditionalTab: Story = {
  args: { showAdvanced: true },
  parameters: {
    docs: {
      description: {
        story: 'Advanced tab appears when visibility is enabled.',
      },
    },
  },
}

export const WithDisabledSubTab: Story = {
  args: { canWithdraw: false },
  parameters: {
    docs: {
      description: {
        story: 'Withdraw sub-tab rendered disabled to highlight the disabled state handling.',
      },
    },
  },
}

export const LegacyWrapped: Story = {
  args: { shouldWrap: true },
  parameters: {
    docs: {
      description: {
        story: 'Illustrates the legacy AppForm background applied via shouldWrap.',
      },
    },
  },
}

export const KebabMenu: Story = {
  args: { overflow: 'kebab', menu: kebabMenuWithForcedOverflow },
  parameters: {
    docs: {
      description: {
        story: 'Kebab mode with forced overflow menu and conditional tab enabled.',
      },
    },
  },
}

export const KebabMenuAutoOverflow: Story = {
  args: {
    overflow: 'kebab',
    menu: numberedTabs(10),
  },
  render: ({ shouldWrap, overflow, menu, ...params }) => (
    <Stack gap={4}>
      {['40rem', '28rem', '20rem'].map((width) => (
        <Grid key={width} size={4} width={width}>
          <FormTabs<DemoParams> params={params} shouldWrap={shouldWrap} overflow={overflow} menu={menu} />
        </Grid>
      ))}
    </Stack>
  ),

  parameters: {
    docs: {
      description: {
        story: 'Kebab mode with extra tabs to trigger automatic overflow at different container widths.',
      },
    },
  },
}

export default meta
