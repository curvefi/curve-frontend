import { GaugeQuery, type UserQuery } from '@evm-ui/lib/model/query'
import { FieldsOf } from '@evm-ui/lib/validation'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

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
export type GaugeDistributorsParams = FieldsOf<GaugeDistributorsQuery>

export type DepositRewardApproveQuery = GaugeQuery & DepositRewardApprove
export type DepositRewardApproveParams = FieldsOf<DepositRewardApproveQuery>
export type DepositRewardApproveMutation = FieldsOf<DepositRewardApprove>

export type DepositReward = DepositRewardApprove & {
  epoch: number | string
}
export type DepositRewardQuery = GaugeQuery & DepositReward
export type DepositRewardParams = FieldsOf<DepositRewardQuery>
export type DepositRewardMutation = FieldsOf<DepositReward>
