import { t } from '@ui-kit/lib/i18n'
import { enforce, group, test } from 'vest'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'
import { BD } from '@ui-kit/utils'
import {
  addressValidationFn,
  amountValidationFn,
  createValidationSuite,
  tokenIdValidationFn,
} from '@ui-kit/lib/validation'
import { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '../types'
import { TIME_FRAMES } from '@/dex/constants'
import useStore from '@/dex/store/useStore'
import { formatNumber } from '@ui/utils'

export const gaugeAddRewardValidationGroup = ({ distributorId, rewardTokenId }: AddRewardParams) =>
  group('gaugeAddRewardValidationGroup', () => {
    test('distributorId', () => addressValidationFn(distributorId))

    test('rewardTokenId', () => tokenIdValidationFn(rewardTokenId))
  })

export const gaugeDepositRewardApproveValidationGroup = ({ rewardTokenId, amount }: DepositRewardApproveParams) =>
  group('gaugeDepositRewardApproveValidationGroup', () => {
    test('rewardTokenId', () => tokenIdValidationFn(rewardTokenId))
    test('amount', () => validateAmount({ rewardTokenId, amount }))
  })

export const gaugeDepositRewardValidationGroup = ({ rewardTokenId, amount, epoch }: DepositRewardParams) =>
  group('gaugeDepositRewardValidationGroup', () => {
    test('rewardTokenId', () => tokenIdValidationFn(rewardTokenId))
    test('amount', () => validateAmount({ rewardTokenId, amount }))
    test('epoch', () => {
      enforce(epoch)
        .message(t`Epoch is required`)
        .isNotEmpty()
        .message(t`Epoch should be a positive number`)
        .isPositiveNumber()
        .condition((epoch: unknown) => ({
          pass: typeof epoch === 'number' && epoch % TIME_FRAMES.WEEK === 0,
          message: t`Epoch must be a multiple of a week`,
        }))
    })
  })

export const gaugeAddRewardValidationSuite = createValidationSuite((data: AddRewardParams) => {
  poolValidationGroup(data)
  gaugeAddRewardValidationGroup(data)
})
export const gaugeDepositRewardApproveValidationSuite = createValidationSuite((data: DepositRewardApproveParams) => {
  poolValidationGroup(data)
  gaugeDepositRewardApproveValidationGroup(data)
})
export const gaugeDepositRewardValidationSuite = createValidationSuite((data: DepositRewardParams) => {
  poolValidationGroup(data)
  gaugeDepositRewardValidationGroup(data)
})

function validateAmount({ rewardTokenId, amount }: DepositRewardApproveParams) {
  amountValidationFn(amount)
  if (!rewardTokenId || !amount) return

  const state = useStore.getState()
  const userBalancesMapper = state.userBalances.userBalancesMapper
  const tokenBalance = userBalancesMapper[rewardTokenId]

  if (!tokenBalance) return

  enforce(amount).condition((amount) => ({
    pass: BD.from(amount).lte(BD.from(tokenBalance)),
    message: t`Amount ${formatNumber(amount, { showAllFractionDigits: true })} > wallet balance ${formatNumber(tokenBalance, { showAllFractionDigits: true })}`,
  }))
}
