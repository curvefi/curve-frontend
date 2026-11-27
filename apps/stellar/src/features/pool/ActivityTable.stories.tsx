import { asAddress } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { fromDate } from '@curvefi/prices-api/timestamp'
import { shortenString } from '@primitives/string.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { constQ } from '@ui/features/queries/util'
import { ActivityStoryProviders, ActivityStoryTable } from '@ui/features/tables/activity-table/ActivityTable.stories'
import type { ActivityDisplay, ActivityRow } from '@ui/features/tables/activity-table/types'

const { chainId: CHAIN_ID, explorerUrl: EXPLORER_URL, nativeCurrency } = STELLAR_NETWORKS.stellar

const addressDisplay = {
  shortenAddress: shortenString,
  formatAddress: address => address,
  scanAddressPath: (_, address) => `${EXPLORER_URL}account/${address}`,
  scanTxPath: (_, txHash) => `${EXPLORER_URL}tx/${txHash}`,
} satisfies ActivityDisplay

const query = constQ<ActivityRow[]>([
  {
    chainId: CHAIN_ID,
    blockchainId: 'stellar',
    address: asAddress('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'),
    txHash: '1234567890abcdef'.repeat(4),
    timestamp: fromDate(new Date()),
    action: { label: 'Deposit' },
    valueUsd: undefined,
    deltas: [
      {
        label: 'Deposited',
        token: { symbol: nativeCurrency.symbol, address: asAddress(nativeCurrency.address) },
        amount: -100,
      },
      { label: 'Pool shares', token: undefined, amount: 100 },
    ],
  },
])

const meta: Meta = {
  title: 'Stellar/Features/ActivityTable',
  decorators: [
    Story => (
      <ActivityStoryProviders>
        <Story />
      </ActivityStoryProviders>
    ),
  ],
  parameters: { layout: 'padded' },
}

export default meta

export const PoolActivity: StoryObj<typeof meta> = {
  render: () => <ActivityStoryTable query={query} addressDisplay={addressDisplay} hasValue={false} />,
}
