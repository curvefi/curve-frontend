import { useCallback, useMemo, useState } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useSignerAddress } from '@/dex/entities/signer'
import AddRewardToken from '@/dex/features/add-gauge-reward-token'
import DepositReward from '@/dex/features/deposit-gauge-reward'
import { ChainId } from '@/dex/types/main.types'
import type { TabValue } from '@/dex/widgets/manage-gauge/types'
import TabSlider, { Tab } from '@ui/TabSlider/TabSlider'
import { t } from '@ui-kit/lib/i18n'

const ManageGauge = ({ poolId, chainId }: { poolId: string; chainId: ChainId }) => {
  const sliderTabs: Tab<TabValue>[] = [
    {
      label: t`Add Reward`,
      value: 'add_reward',
    },
    {
      label: t`Deposit Reward`,
      value: 'deposit_reward',
    },
  ]

  const [activeTab, setActiveTab] = useState<TabValue>('add_reward')
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

  const renderActiveTab = useCallback(() => {
    switch (activeTab) {
      case 'add_reward':
        return <AddRewardToken chainId={chainId} poolId={poolId} />
      case 'deposit_reward':
        return <DepositReward chainId={chainId} poolId={poolId} />
      default:
        return null
    }
  }, [activeTab, chainId, poolId])

  const isTabVisible = useCallback(
    (tab: Tab<TabValue>) => {
      if (tab.value === 'add_reward') {
        return isGaugeManager
      }
      if (tab.value === 'deposit_reward') {
        return isGaugeManager && isRewardsDistributor
      }
      return false
    },
    [isGaugeManager, isRewardsDistributor],
  )

  return (
    <>
      <TabSlider tabs={sliderTabs} activeTab={activeTab} onTabChange={setActiveTab} isTabVisible={isTabVisible} />
      {renderActiveTab()}
    </>
  )
}

export default ManageGauge
