import type { Address } from 'viem'
import { GaugeQuery, type UserQuery } from '@ui-kit/lib/model/query'
import { FieldsOf } from '@ui-kit/lib/validation'
import type { Decimal } from '@ui-kit/utils'

export type AddReward = {
  rewardTokenId: Address
  distributorId: Address
}
export type AddRewardQuery = GaugeQuery & AddReward
export type AddRewardParams = FieldsOf<AddRewardQuery>
export type AddRewardMutation = FieldsOf<AddReward>

export type DepositRewardApprove = {
  rewardTokenId: Address
  amount: number | string
  userBalance?: Decimal
}
export type GaugeDistributorsQuery = GaugeQuery & UserQuery

export type DepositRewardApproveQuery = GaugeQuery & DepositRewardApprove
export type DepositRewardApproveParams = FieldsOf<DepositRewardApproveQuery>
export type DepositRewardApproveMutation = FieldsOf<DepositRewardApprove>
export type GaugeDistributorsParams = FieldsOf<GaugeDistributorsQuery>

export type DepositReward = DepositRewardApprove & {
  epoch: number | string
}
export type DepositRewardQuery = GaugeQuery & DepositReward
export type DepositRewardParams = FieldsOf<DepositRewardQuery>
export type DepositRewardMutation = FieldsOf<DepositReward>
