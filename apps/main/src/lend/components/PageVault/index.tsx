import { useEffect, useMemo, useState } from 'react'
import VaultClaim from '@/lend/components/PageVault/VaultClaim'
import VaultDepositMint from '@/lend/components/PageVault/VaultDepositMint'
import VaultStake from '@/lend/components/PageVault/VaultStake'
import VaultUnstake from '@/lend/components/PageVault/VaultUnstake'
import VaultWithdrawRedeem from '@/lend/components/PageVault/VaultWithdrawRedeem'
import {
  type MarketUrlParams,
  PageContentProps,
  type VaultDepositFormType,
  type VaultWithdrawFormType,
} from '@/lend/types/lend.types'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

type FormType = 'deposit' | 'withdraw'

const tabs: TabOption<FormType>[] = [
  { value: 'deposit', label: t`Deposit` },
  { value: 'withdraw', label: t`Withdraw` },
]

const tabsDeposit: TabOption<VaultDepositFormType>[] = [
  { value: 'deposit', label: t`Deposit` },
  { value: 'stake', label: t`Stake` },
]

const tabsWithdraw: TabOption<VaultWithdrawFormType>[] = [
  { value: 'withdraw', label: t`Withdraw` },
  { value: 'unstake', label: t`Unstake` },
  { value: 'claim', label: t`Claim Rewards` },
]

const Vault = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, params } = pageProps
  const push = useNavigate()

  type SubTab = VaultDepositFormType | VaultWithdrawFormType
  const [subTab, setSubTab] = useState<SubTab>('deposit')

  const subTabs = useMemo(() => (!rFormType || rFormType === 'deposit' ? tabsDeposit : tabsWithdraw), [rFormType])
  useEffect(() => setSubTab(subTabs[0]?.value), [subTabs])

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'deposit' : rFormType}
        onChange={(key) => push(getVaultPathname(params, rOwmId, key))}
        options={tabs}
        fullWidth
      />

      <TabsSwitcher variant="underlined" size="small" value={subTab} onChange={setSubTab} options={subTabs} fullWidth />

      <AppFormContentWrapper>
        {subTab === 'deposit' && <VaultDepositMint {...pageProps} rFormType="deposit" />}
        {subTab === 'stake' && <VaultStake {...pageProps} rFormType="stake" />}
        {subTab === 'withdraw' && <VaultWithdrawRedeem {...pageProps} rFormType="withdraw" />}
        {subTab === 'unstake' && <VaultUnstake {...pageProps} rFormType="unstake" />}
        {subTab === 'claim' && <VaultClaim {...pageProps} rFormType="claim" />}
      </AppFormContentWrapper>
    </Stack>
  )
}

export default Vault
