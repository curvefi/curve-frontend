import { VaultClaim } from '@/lend/components/PageVault/VaultClaim'
import { VaultDepositMint } from '@/lend/components/PageVault/VaultDepositMint'
import { VaultStake } from '@/lend/components/PageVault/VaultStake'
import { VaultUnstake } from '@/lend/components/PageVault/VaultUnstake'
import { VaultWithdrawRedeem } from '@/lend/components/PageVault/VaultWithdrawRedeem'
import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import { useLendingMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type VaultProps = PageContentProps<MarketUrlParams>

const DepositFormTab = ({ rChainId, market, isLoaded }: VaultProps) => (
  <DepositForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
)

const WithdrawFormTab = ({ rChainId, market, isLoaded }: VaultProps) => (
  <WithdrawForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
)
const LegacyVaultMenu = [
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

const NewVaultMenu = [
  {
    value: 'supply',
    label: t`Supply`,
    subTabs: [
      { value: 'deposit', label: t`Deposit`, component: DepositFormTab },
      { value: 'withdraw', label: t`Withdraw`, component: WithdrawFormTab },
    ],
  },
] satisfies FormTab<VaultProps>[]

export const VaultTabs = (pageProps: VaultProps) => {
  const menu = useLendingMuiForm() ? NewVaultMenu : LegacyVaultMenu
  return <FormTabs params={pageProps} menu={menu} shouldWrap={menu === LegacyVaultMenu} />
}
