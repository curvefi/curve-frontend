import { useEffect, useState } from 'react'
import VaultClaim from '@/lend/components/PageVault/VaultClaim'
import VaultDepositMint from '@/lend/components/PageVault/VaultDepositMint'
import VaultStake from '@/lend/components/PageVault/VaultStake'
import VaultUnstake from '@/lend/components/PageVault/VaultUnstake'
import VaultWithdrawRedeem from '@/lend/components/PageVault/VaultWithdrawRedeem'
import useStore from '@/lend/store/useStore'
import {
  type MarketUrlParams,
  PageContentProps,
  type VaultDepositFormType,
  type VaultWithdrawFormType,
} from '@/lend/types/lend.types'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const Vault = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, rChainId, params } = pageProps
  const push = useNavigate()

  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  type FormType = 'deposit' | 'withdraw'
  const FORM_TYPES: { value: FormType; label: string }[] = [
    { value: 'deposit', label: t`Deposit` },
    { value: 'withdraw', label: t`Withdraw` },
  ]

  const DEPOSIT_TABS: { value: VaultDepositFormType; label: string }[] = [
    { value: 'deposit', label: t`Deposit` },
    { value: 'stake', label: t`Stake` },
  ]

  const WITHDRAW_TABS: { value: VaultWithdrawFormType; label: string }[] = [
    { value: 'withdraw', label: t`Withdraw` },
    { value: 'unstake', label: t`Unstake` },
    { value: 'claim', label: t`Claim Rewards` },
  ]

  type Tabs = VaultDepositFormType | VaultWithdrawFormType
  const [selectedTab, setSelectedTab] = useState<Tabs>('deposit')

  const tabs = !rFormType || rFormType === 'deposit' ? DEPOSIT_TABS : WITHDRAW_TABS

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  return (
    <AppFormContent variant="primary">
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'deposit' : rFormType}
        onChange={(key) => push(getVaultPathname(params, rOwmId, key))}
        options={FORM_TYPES}
      />

      <TabsSwitcher
        variant="underlined"
        size="small"
        value={selectedTab}
        onChange={setSelectedTab}
        options={tabs}
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
      />

      <AppFormContentWrapper>
        {selectedTab === 'deposit' && <VaultDepositMint {...pageProps} rFormType="deposit" />}
        {selectedTab === 'stake' && <VaultStake {...pageProps} rFormType="stake" />}
        {selectedTab === 'withdraw' && <VaultWithdrawRedeem {...pageProps} rFormType="withdraw" />}
        {selectedTab === 'unstake' && <VaultUnstake {...pageProps} rFormType="unstake" />}
        {selectedTab === 'claim' && <VaultClaim {...pageProps} rFormType="claim" />}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default Vault
