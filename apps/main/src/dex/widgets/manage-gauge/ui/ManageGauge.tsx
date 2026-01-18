import { useMemo, useState } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { useConnection } from 'wagmi'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { DepositReward } from '@/dex/features/deposit-gauge-reward'
import { ChainId } from '@/dex/types/main.types'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'

export const ManageGauge = ({ poolId, chainId }: { poolId: string; chainId: ChainId }) => {
  const { address: signerAddress } = useConnection()
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
    <FormContent
      header={<TabsSwitcher variant="underlined" value={tab} onChange={setTab} options={tabs} overflow="fullWidth" />}
    >
      {tab === 'add_reward' && <AddRewardToken chainId={chainId} poolId={poolId} />}
      {tab === 'deposit_reward' && <DepositReward chainId={chainId} poolId={poolId} />}
    </FormContent>
  )
}
