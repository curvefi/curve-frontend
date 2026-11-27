import type { PropsWithChildren } from 'react'
import { shortenString } from '@primitives/string.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestQueryProvider } from '@ui/features/queries/test-query.provider.test'
import { constQ, loadingQ, q, type QueryProp } from '@ui/features/queries/util'
import { ActivityTable } from './ActivityTable'
import { useActivityTable } from './hooks/useActivityTable'
import { useActivityVisibility } from './hooks/useActivityVisibility'
import type { ActivityDisplay, ActivityRow } from './types'

const addressDisplayWithoutExplorer = {
  shortenAddress: shortenString,
  formatAddress: address => address,
  scanAddressPath: () => undefined,
  scanTxPath: () => undefined,
} satisfies ActivityDisplay

export const ActivityStoryTable = ({
  query,
  addressDisplay,
  hasValue = true,
  emptyTitle = 'No activity found.',
  errorTitle = 'Could not load activity.',
}: {
  query: QueryProp<ActivityRow[]>
  addressDisplay: ActivityDisplay
  hasValue?: boolean
  emptyTitle?: string
  errorTitle?: string
}) => {
  const columnVisibility = useActivityVisibility({ hasValue })
  const table = useActivityTable({ query, meta: { addressDisplay }, state: { columnVisibility } })

  return <ActivityTable table={table} emptyState={{ title: emptyTitle }} errorState={{ title: errorTitle }} />
}

export const ActivityStoryProviders = ({ children }: PropsWithChildren) => (
  <TestQueryProvider data={[]}>{children}</TestQueryProvider>
)

const meta: Meta = {
  title: 'UI/Features/ActivityTable',
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
          'Expand multi-token activity rows, including swaps, to see a breakdown by token.',
      },
    },
  },
}

export default meta

export const LoadingState: StoryObj = {
  render: () => <ActivityStoryTable query={loadingQ(undefined)} addressDisplay={addressDisplayWithoutExplorer} />,
  parameters: { docs: { description: { story: 'Activity table in loading state showing skeleton rows.' } } },
}

export const EmptyState: StoryObj = {
  render: () => <ActivityStoryTable query={constQ([])} addressDisplay={addressDisplayWithoutExplorer} />,
  parameters: { docs: { description: { story: 'Activity table showing empty state with custom message.' } } },
}

export const ErrorState: StoryObj = {
  render: () => (
    <ActivityStoryTable
      query={q({ data: [], isLoading: false, error: new Error('Could not load activity.') })}
      addressDisplay={addressDisplayWithoutExplorer}
    />
  ),
  parameters: { docs: { description: { story: 'Activity table showing error state with error message.' } } },
}
