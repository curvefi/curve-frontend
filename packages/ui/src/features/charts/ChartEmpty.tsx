import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { AllOrNone } from '@primitives/objects.utils'
import { EmptyStateCard } from '@ui/components/EmptyStateCard'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const ChartEmpty = ({
  height,
  title = t`No chart data found`,
  message,
  testId,
  ...connectionProps
}: { height: number; title?: ReactNode; message?: ReactNode; testId?: string } & AllOrNone<ConnectionProps>) => (
  <Stack sx={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.md, minHeight: height }}>
    <EmptyStateCard title={title} description={message} testId={testId} {...connectionProps} />
  </Stack>
)
