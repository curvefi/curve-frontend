import type { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { HealthDetails } from '@/llamalend/features/market-position-details/health/HealthDetails'
import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import type { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import type { QueryData } from '@evm-ui/lib/queries/types'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Banner } from '@ui/features/banners/Banner'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { NumericTextField } from '@ui/features/forms/controls/NumericTextField'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { constQ, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimalDiv, decimalMultiply, decimalSum } from '@ui/lib/decimal'

const { Spacing } = SizesAndSpaces

const DISCOUNT_GAP: Decimal = '3'
const CARD_WIDTH = 320

type HealthArgs = { health?: Decimal | null; liquidationBuffer?: Decimal | null; positionStatus?: UserPositionStatus }

const healthDetails = ({ health, liquidationBuffer, positionStatus }: HealthArgs) => {
  const data = maybes([health, liquidationBuffer], (h, lb) => {
    const healthNotFull = decimalMultiply(decimalDiv(lb, '100'), DISCOUNT_GAP)
    return { health: h, healthFactor: decimalSum('1', decimalDiv(h, '100')), healthNotFull, liquidationBuffer: lb }
  }) satisfies QueryData<typeof useUserHealthValues> | undefined

  return (
    <HealthDetails health={constQ(data)} positionStatus={q({ data: positionStatus, isLoading: false, error: null })} />
  )
}

const priceImpact = (percent: Decimal) => (
  <PriceImpactActionInfo priceImpact={constQ(percent)} value={constQ(`${percent}%`)} />
)

const alert = (severity: 'error' | 'warning' | 'info' | 'success', variant: 'outlined' | 'filled') => {
  const title = severity[0].toUpperCase() + severity.slice(1)
  return (
    <Alert variant={variant} severity={severity}>
      <AlertTitle>{title}</AlertTitle>
      {title} message
    </Alert>
  )
}

const Sample = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack sx={{ flex: `1 1 ${CARD_WIDTH}px`, maxWidth: 420, gap: Spacing.xs }}>
    <Typography variant="bodyXsBold" color="textSecondary">
      {label}
    </Typography>
    {children}
  </Stack>
)

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Stack sx={{ gap: Spacing.sm }}>
    <Typography variant="headingXsBold">{title}</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'start' }}>{children}</Box>
  </Stack>
)

const FeedbackBoard = () => (
  <Stack sx={{ gap: Spacing.lg }}>
    <Typography variant="bodySRegular" color="textSecondary">
      Outlined alerts are the toast treatment. The text sample is the color to match.
    </Typography>

    <Section title="Error">
      <Sample label="Text">
        <Typography color="error">Error</Typography>
      </Sample>
      <Sample label="Outlined alert">{alert('error', 'outlined')}</Sample>
      <Sample label="Filled alert">{alert('error', 'filled')}</Sample>
      <Sample label="Banner">
        <Banner severity="alert">Alert</Banner>
      </Sample>
      <Sample label="Price impact">{priceImpact('2')}</Sample>
      <Sample label="Action info">
        <ActionInfo
          label="Amount"
          value={q({ data: null, isLoading: false, error: new Error('Amount exceeds balance') })}
        />
      </Sample>
      <Sample label="Input">
        <NumericTextField value="0" error helperText="Amount exceeds balance" />
      </Sample>
      <Sample label="Large input">
        <LargeTokenInput
          name="amount"
          label="You pay"
          balance={q({ data: '1', isLoading: false, error: new Error('Amount exceeds balance') })}
          message="Amount exceeds balance"
        />
      </Sample>
      <Sample label="Form alert">
        <FormAlerts
          error={new Error('Transaction reverted')}
          formErrors={[]}
          handledErrors={[]}
          userAddress={zeroAddress}
        />
      </Sample>
    </Section>

    <Section title="Warning">
      <Sample label="Text">
        <Typography color="warning">Warning</Typography>
      </Sample>
      <Sample label="Outlined alert">{alert('warning', 'outlined')}</Sample>
      <Sample label="Filled alert">{alert('warning', 'filled')}</Sample>
      <Sample label="Banner">
        <Banner severity="warning">Warning</Banner>
      </Sample>
      <Sample label="Price impact">{priceImpact('0.9')}</Sample>
      <Sample label="Form alert">
        <FormAlerts formErrors={[['amount', 'Amount exceeds balance']]} handledErrors={[]} userAddress={zeroAddress} />
      </Sample>
    </Section>

    <Section title="Caution">
      <Sample label="Text">
        <Typography color="caution">Caution</Typography>
      </Sample>
      <Sample label="Banner">
        <Banner severity="caution">Caution</Banner>
      </Sample>
      <Sample label="Price impact">{priceImpact('0.6')}</Sample>
    </Section>

    <Section title="Success">
      <Sample label="Text">
        <Typography color="success">Success</Typography>
      </Sample>
      <Sample label="Outlined alert">{alert('success', 'outlined')}</Sample>
      <Sample label="Filled alert">{alert('success', 'filled')}</Sample>
    </Section>

    <Section title="Info">
      <Sample label="Text">
        <Typography color="info">Info</Typography>
      </Sample>
      <Sample label="Outlined alert">{alert('info', 'outlined')}</Sample>
      <Sample label="Filled alert">{alert('info', 'filled')}</Sample>
      <Sample label="Banner">
        <Banner severity="info">Info</Banner>
      </Sample>
    </Section>

    <Section title="Highlight">
      <Sample label="Banner">
        <Banner severity="highlight">Highlight</Banner>
      </Sample>
    </Section>

    <Stack sx={{ gap: Spacing.sm }}>
      <Typography variant="headingXsBold">Health</Typography>
      <Typography variant="bodySRegular" color="textSecondary">
        Same values as LlamaLend Health Details, All States. Bars use layer fills. Figures use feedback text.
      </Typography>
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: Spacing.sm, alignItems: 'start' }}
      >
        {healthStates.map(({ name, args }) => (
          <Stack key={name} sx={{ gap: Spacing.xs }}>
            <Typography variant="bodyXsBold" color="textTertiary">
              {name}
            </Typography>
            {healthDetails(args)}
          </Stack>
        ))}
      </Box>
    </Stack>
  </Stack>
)

const healthStates: { name: string; args: HealthArgs }[] = [
  { name: 'Undefined', args: {} },
  { name: 'Pristine', args: { health: '426.9', liquidationBuffer: '108', positionStatus: 'healthy' } },
  { name: 'Good', args: { health: '24.1', liquidationBuffer: '110', positionStatus: 'healthy' } },
  { name: 'Caution', args: { health: '7.9', liquidationBuffer: '110', positionStatus: 'healthy' } },
  { name: 'Tight', args: { health: '4.9', liquidationBuffer: '110', positionStatus: 'healthy' } },
  { name: 'Light', args: { health: '0', liquidationBuffer: '90', positionStatus: 'fullyConverted' } },
  { name: 'At risk', args: { health: '0', liquidationBuffer: '22.5', positionStatus: 'softLiquidation' } },
  { name: 'Critical', args: { health: '0', liquidationBuffer: '2.4', positionStatus: 'incompleteConversion' } },
  { name: 'Hard liquidation', args: { health: '0', liquidationBuffer: '0', positionStatus: 'hardLiquidation' } },
  { name: 'Beyond liquidation', args: { health: '0', liquidationBuffer: '-20', positionStatus: 'hardLiquidation' } },
]

const meta: Meta<typeof FeedbackBoard> = {
  title: 'UI/Themes/Feedback',
  component: FeedbackBoard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Feedback treatments side by side. Outlined alerts are what toasts render. Switch the theme toolbar to compare Light, Dark, and Chad.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof FeedbackBoard>

export const Comparison: Story = {}
