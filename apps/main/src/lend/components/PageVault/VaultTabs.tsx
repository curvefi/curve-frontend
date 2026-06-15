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
        component: ({ rChainId, market }: VaultProps) => (
          <DepositForm networks={networks} chainId={rChainId} market={market} />
        ),
      },
      {
        value: 'withdraw',
        label: t`Withdraw`,
        component: ({ rChainId, market }: VaultProps) => (
          <WithdrawForm networks={networks} chainId={rChainId} market={market} />
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
        component: ({ rChainId, market }: VaultProps) => (
          <StakeForm networks={networks} chainId={rChainId} market={market} />
        ),
      },
      {
        value: 'unstake',
        label: t`Unstake`,
        component: ({ rChainId, market }: VaultProps) => (
          <UnstakeForm networks={networks} chainId={rChainId} market={market} />
        ),
      },
    ],
  },
  {
    value: 'claim',
    label: t`Claim`,
    component: ({ rChainId, market }: VaultProps) => (
      <ClaimTab networks={networks} chainId={rChainId} market={market} />
    ),
  },
] satisfies FormTab<VaultProps>[]

export const VaultTabs = (pageProps: VaultProps) => <FormTabs params={pageProps} menu={VaultMenu} />
