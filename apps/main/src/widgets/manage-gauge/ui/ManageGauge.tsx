import { useGaugeManager } from '@/entities/gauge'
import AddRewardToken from '@/features/add-gauge-reward-token'
import Loader from '@/ui/Loader'

const ManageGauge: React.FC<{ poolId: string; chainId: ChainId; walletAddress: string }> = ({
  poolId,
  chainId,
  walletAddress,
}) => {
  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager(poolId)

  return (
    <div>
      {isPendingGaugeManager ? (
        <Loader skeleton={[360, 180]} />
      ) : (
        gaugeManager === walletAddress && (
          <AddRewardToken chainId={chainId} poolId={poolId} walletAddress={walletAddress} />
        )
      )}
      {/* {isPendingRewardDistributors && <DepositReward chainId={chainId} poolId={pool.pool.id} />} */}
    </div>
  )
}

export default ManageGauge
