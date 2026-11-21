import type { PropsWithChildren } from 'react'
import { WagmiProvider } from 'wagmi'
import { createTestWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-test-config'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestQueryProvider } from '@ui/features/queries/test-query.provider.test'
import { constQ, loadingQ, q, type QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { ActivityTable } from './ActivityTable'
import { ACTIVITY_COLUMNS } from './columns/columns.definitions'
import { useActivityVisibility } from './hooks/useActivityVisibility'
import type { ActivityRow } from './types'

const wagmiConfig = createTestWagmiConfig()

export const ActivityStoryTable = ({
  query,
  hasValue = true,
  emptyTitle = 'No activity found.',
  errorTitle = 'Could not load activity.',
}: {
  query: QueryProp<ActivityRow[]>
  hasValue?: boolean
  emptyTitle?: string
  errorTitle?: string
}) => {
  const columnVisibility = useActivityVisibility({ hasValue })
  const table = useCurveTable({ query, columns: ACTIVITY_COLUMNS, state: { columnVisibility } })

  return <ActivityTable table={table} emptyState={{ title: emptyTitle }} errorState={{ title: errorTitle }} />
}

export const ActivityStoryProviders = ({ children }: PropsWithChildren) => (
  <WagmiProvider config={wagmiConfig}>
    <TestQueryProvider data={[]}>{children}</TestQueryProvider>
  </WagmiProvider>
)

const meta: Meta = {
  title: 'EVM UI/Features/ActivityTable',
  excludeStories: ['ActivityStoryProviders', 'ActivityStoryTable'],
  decorators: [
    Story => (
      <ActivityStoryProviders>
        <Story />
      </ActivityStoryProviders>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Curve pools and markets use the same columns for swaps and other activity. ' +
          'Swaps show both token amounts in one cell. Multi-token liquidity and collateral events show per-token rows.',
      },
    },
  },
}

export default meta

export const LoadingState: StoryObj = {
  render: () => <ActivityStoryTable query={loadingQ(undefined)} />,
  parameters: { docs: { description: { story: 'Activity table in loading state showing skeleton rows.' } } },
}

export const EmptyState: StoryObj = {
  render: () => <ActivityStoryTable query={constQ([])} />,
  parameters: { docs: { description: { story: 'Activity table showing empty state with custom message.' } } },
}

export const ErrorState: StoryObj = {
  render: () => (
    <ActivityStoryTable query={q({ data: [], isLoading: false, error: new Error('Could not load activity.') })} />
  ),
  parameters: { docs: { description: { story: 'Activity table showing error state with error message.' } } },
}
