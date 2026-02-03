import { VaultClaim } from '@/lend/components/PageVault/VaultClaim'
import { VaultDepositMint } from '@/lend/components/PageVault/VaultDepositMint'
import { VaultStake } from '@/lend/components/PageVault/VaultStake'
import { VaultUnstake } from '@/lend/components/PageVault/VaultUnstake'
import { VaultWithdrawRedeem } from '@/lend/components/PageVault/VaultWithdrawRedeem'
import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import { useLendingMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type VaultProps = PageContentProps<MarketUrlParams>

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
      {
        value: 'deposit',
        label: t`Deposit`,
        component: ({ rChainId, market, isLoaded }: VaultProps) => (
          <DepositForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
        ),
      },
      {
        value: 'withdraw',
        label: t`Withdraw`,
        component: ({ rChainId, market, isLoaded }: VaultProps) => (
          <WithdrawForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
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
        component: ({ rChainId, market, isLoaded }: VaultProps) => (
          <StakeForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
        ),
      },
      {
        value: 'unstake',
        label: t`Unstake`,
        component: ({ rChainId, market, isLoaded }: VaultProps) => (
          <UnstakeForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
        ),
      },
    ],
  },
] satisfies FormTab<VaultProps>[]

export const VaultTabs = (pageProps: VaultProps) => {
  const menu = useLendingMuiForm() ? NewVaultMenu : LegacyVaultMenu
  return <FormTabs params={pageProps} menu={menu} shouldWrap={menu === LegacyVaultMenu} />
}
