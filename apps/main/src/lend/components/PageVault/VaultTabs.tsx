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
      { value: 'deposit', label: t`Deposit`, component: props => <DepositForm networks={networks} {...props} /> },
      { value: 'withdraw', label: t`Withdraw`, component: props => <WithdrawForm networks={networks} {...props} /> },
    ],
  },
  {
    value: 'stake',
    label: t`Stake`,
    subTabs: [
      { value: 'stake', label: t`Stake`, component: props => <StakeForm networks={networks} {...props} /> },
      { value: 'unstake', label: t`Unstake`, component: props => <UnstakeForm networks={networks} {...props} /> },
    ],
  },
  { value: 'claim', label: t`Claim`, component: props => <ClaimTab networks={networks} {...props} /> },
] satisfies FormTab<VaultProps>[]

export const VaultTabs = (pageProps: VaultProps) => <FormTabs params={pageProps} menu={VaultMenu} />
