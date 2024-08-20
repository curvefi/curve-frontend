export interface ManageGaugeProps {
  pool: PoolData
  chainId: ChainId
}

export type AddRewardTokenProps = {
  chainId: ChainId
  poolId: string
}

export type AddRewardFormValues = {
  rewardTokenId: string
  distributorId: string
}
