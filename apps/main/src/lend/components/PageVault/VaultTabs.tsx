import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { ClaimTab } from '@/llamalend/features/supply/components/ClaimTab'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type VaultProps = PageContentProps<MarketUrlParams>

const VaultMenu = [
  {
    value: 'supply',
    label: t`Supply`,
    subTabs: [
      {
        value: 'deposit',
        label: t`Deposit`,
        component: ({ chainId, marketQuery: { data: market } }: VaultProps) => (
          <DepositForm networks={networks} chainId={chainId} market={market} />
        ),
      },
      {
        value: 'withdraw',
        label: t`Withdraw`,
        component: ({ chainId, marketQuery: { data: market } }: VaultProps) => (
          <WithdrawForm networks={networks} chainId={chainId} market={market} />
        ),
      },
    ],
  },
  {
    value: 'stake',
    label: t`Stake`,
    subTabs: [
      {
        value: 'stake',
        label: t`Stake`,
        component: ({ chainId, marketQuery: { data: market } }: VaultProps) => (
          <StakeForm networks={networks} chainId={chainId} market={market} />
        ),
      },
      {
        value: 'unstake',
        label: t`Unstake`,
        component: ({ chainId, marketQuery: { data: market } }: VaultProps) => (
          <UnstakeForm networks={networks} chainId={chainId} market={market} />
        ),
      },
    ],
  },
  {
    value: 'claim',
    label: t`Claim`,
    component: ({ chainId, marketQuery: { data: market } }: VaultProps) => (
      <ClaimTab networks={networks} chainId={chainId} market={market} />
    ),
  },
] satisfies FormTab<VaultProps>[]

export const VaultTabs = (pageProps: VaultProps) => <FormTabs params={pageProps} menu={VaultMenu} />
