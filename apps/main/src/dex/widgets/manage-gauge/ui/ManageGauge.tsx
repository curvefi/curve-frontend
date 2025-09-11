import { useMemo, useState } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useSignerAddress } from '@/dex/entities/signer'
import AddRewardToken from '@/dex/features/add-gauge-reward-token'
import DepositReward from '@/dex/features/deposit-gauge-reward'
import { ChainId } from '@/dex/types/main.types'
import { AppFormContentWrapper } from '@ui/AppForm'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

const ManageGauge = ({ poolId, chainId }: { poolId: string; chainId: ChainId }) => {
  const { data: signerAddress } = useSignerAddress()
  const { data: gaugeManager } = useGaugeManager({ chainId, poolId })
  const { data: rewardDistributors } = useGaugeRewardsDistributors({ chainId, poolId })

  const isGaugeManager = useMemo(
    () => !!gaugeManager && !!signerAddress && isAddressEqual(gaugeManager, signerAddress),
    [gaugeManager, signerAddress],
  )

  const isRewardsDistributor = useMemo(
    () =>
      !!rewardDistributors &&
      !!signerAddress &&
      Object.values(rewardDistributors).some((distributorId) =>
        isAddressEqual(distributorId as Address, signerAddress),
      ),
    [rewardDistributors, signerAddress],
  )

  type Tab = 'add_reward' | 'deposit_reward'
  const tabs: TabOption<Tab>[] = useMemo(
    () => [
      ...(isGaugeManager ? [{ value: 'add_reward' as const, label: t`Add Reward` }] : []),
      ...(isRewardsDistributor ? [{ value: 'deposit_reward' as const, label: t`Deposit Reward` }] : []),
    ],
    [isGaugeManager, isRewardsDistributor],
  )

  const [tab, setTab] = useState<Tab>(isGaugeManager ? 'add_reward' : 'deposit_reward')

  return (
    <>
      <TabsSwitcher
        variant="underlined"
        size="small"
        value={tab}
        onChange={setTab}
        options={tabs}
        fullWidth
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
      />

      <AppFormContentWrapper>
        {tab === 'add_reward' && <AddRewardToken chainId={chainId} poolId={poolId} />}
        {tab === 'deposit_reward' && <DepositReward chainId={chainId} poolId={poolId} />}
      </AppFormContentWrapper>
    </>
  )
}

export default ManageGauge
