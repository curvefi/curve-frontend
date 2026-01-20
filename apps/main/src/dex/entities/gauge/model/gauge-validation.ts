import { enforce, group, test } from 'vest'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { TIME_FRAMES } from '@ui-kit/lib/model'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'
import {
  addressValidationFn,
  amountValidationFn,
  createValidationSuite,
  tokenIdValidationFn,
} from '@ui-kit/lib/validation'
import { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '../types'

export const gaugeAddRewardValidationGroup = ({ distributorId, rewardTokenId }: AddRewardParams) =>
  group('gaugeAddRewardValidationGroup', () => {
    test('distributorId', () => addressValidationFn(distributorId))
    test('rewardTokenId', () => tokenIdValidationFn(rewardTokenId))
  })

export const gaugeDepositRewardApproveValidationGroup = ({
  rewardTokenId,
  amount,
  userBalance,
}: DepositRewardApproveParams) =>
  group('gaugeDepositRewardApproveValidationGroup', () => {
    test('rewardTokenId', () => tokenIdValidationFn(rewardTokenId))
    test('amount', () => validateAmount({ rewardTokenId, amount, userBalance }))
  })

export const gaugeDepositRewardValidationGroup = ({ rewardTokenId, amount, epoch, userBalance }: DepositRewardParams) =>
  group('gaugeDepositRewardValidationGroup', () => {
    test('rewardTokenId', () => tokenIdValidationFn(rewardTokenId))
    test('amount', () => validateAmount({ rewardTokenId, amount, userBalance }))
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

function validateAmount({ rewardTokenId, amount, userBalance }: DepositRewardApproveParams) {
  amountValidationFn(amount)
  if (!rewardTokenId || !amount) return

  enforce(userBalance).condition((userBalance) => ({
    pass: userBalance != null && +userBalance > 0,
    message: t`Wallet balance is zero for the selected reward token`,
  }))

  enforce(amount).condition((amount) => ({
    pass: +amount <= +userBalance!,
    message: t`Amount ${formatNumber(amount, { decimals: 5 })} > wallet balance ${formatNumber(userBalance, { decimals: 5 })}`,
  }))
}
