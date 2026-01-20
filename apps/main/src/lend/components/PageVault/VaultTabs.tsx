import { VaultClaim } from '@/lend/components/PageVault/VaultClaim'
import { VaultDepositMint } from '@/lend/components/PageVault/VaultDepositMint'
import { VaultStake } from '@/lend/components/PageVault/VaultStake'
import { VaultUnstake } from '@/lend/components/PageVault/VaultUnstake'
import { VaultWithdrawRedeem } from '@/lend/components/PageVault/VaultWithdrawRedeem'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type VaultProps = PageContentProps<MarketUrlParams>

const menu = [
  {
    value: 'deposit',
    label: t`Deposit`,
    subTabs: [
      { value: 'deposit', label: t`Deposit`, component: VaultDepositMint },
      { value: 'stake', label: t`Stake`, component: VaultStake },
    ],
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    subTabs: [
      { value: 'withdraw', label: t`Withdraw`, component: VaultWithdrawRedeem },
      { value: 'unstake', label: t`Unstake`, component: VaultUnstake },
      { value: 'claim', label: t`Claim Rewards`, component: VaultClaim },
    ],
  },
] satisfies FormTab<VaultProps>[]

export const VaultTabs = (pageProps: VaultProps) => <FormTabs params={pageProps} menu={menu} shouldWrap />
