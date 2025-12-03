import VaultClaim from '@/lend/components/PageVault/VaultClaim'
import VaultDepositMint from '@/lend/components/PageVault/VaultDepositMint'
import VaultStake from '@/lend/components/PageVault/VaultStake'
import VaultUnstake from '@/lend/components/PageVault/VaultUnstake'
import VaultWithdrawRedeem from '@/lend/components/PageVault/VaultWithdrawRedeem'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/shared/ui/FormTabs/FormTabs'

type VaultProps = PageContentProps<MarketUrlParams>

const menu = [
  {
    value: 'deposit',
    label: t`Deposit`,
    subTabs: [
      { value: 'deposit', label: t`Deposit`, component: (p) => <VaultDepositMint {...p} rFormType="deposit" /> },
      { value: 'stake', label: t`Stake`, component: (p) => <VaultStake {...p} rFormType="stake" /> },
    ],
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    subTabs: [
      { value: 'withdraw', label: t`Withdraw`, component: (p) => <VaultWithdrawRedeem {...p} rFormType="withdraw" /> },
      { value: 'unstake', label: t`Unstake`, component: (p) => <VaultUnstake {...p} rFormType="unstake" /> },
      { value: 'claim', label: t`Claim Rewards`, component: (p) => <VaultClaim {...p} rFormType="claim" /> },
    ],
  },
] satisfies FormTab<VaultProps>[]

export const VaultTabs = (pageProps: VaultProps) => (
  <FormTabs params={pageProps} menu={menu} shouldWrap defaultTab={pageProps.rFormType} />
)
