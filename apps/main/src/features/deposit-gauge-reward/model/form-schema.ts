import { create, test, enforce } from 'vest'
import { isAddress, isAddressEqual, parseEther, zeroAddress, type Address } from 'viem'
import { DepositRewardStep, DepositRewardFormValues } from '@/features/deposit-gauge-reward/types'
import useStore from '@/store/useStore'
import { formatNumber } from '@/utils'
import { t } from '@lingui/macro'
import { BD } from '@/shared/curve-lib'
import { TIME_FRAMES } from '@/constants'

export const depositRewardValidationSuite = create<
  keyof DepositRewardFormValues,
  'DepositReward',
  (data: DepositRewardFormValues) => void
>((data) => {
  const state = useStore.getState()
  const userBalancesMapper = state.userBalances.userBalancesMapper

  test('rewardTokenId', 'Invalid ERC20 token address', () => {
    enforce(data.rewardTokenId).isNotEmpty()
    enforce(isAddress(data.rewardTokenId)).isTruthy()
  })

  test('rewardTokenId', 'Address cannot be zero address', () => {
    enforce(isAddressEqual(data.rewardTokenId, zeroAddress)).isFalsy()
  })

  test('amount', 'Reward amount is required', () => {
    enforce(data.amount).isNotEmpty()
  })

  test('amount', 'Invalid number format. Please enter a valid number with up to 18 decimal places', () => {
    try {
      BD.from(data.amount)
      enforce(true).isTruthy()
    } catch {
      enforce(false).isTruthy()
    }
  })

  test('amount', 'Reward amount must be greater than zero', () => {
    enforce(BD.from(data.amount).gt(BD.zero)).isTruthy()
  })

  test('amount', 'Amount exceeds wallet balance', () => {
    const { rewardTokenId, amount } = data
    if (!rewardTokenId || !amount) return

    const tokenBalance = userBalancesMapper[rewardTokenId]
    if (!tokenBalance) return

    if (BD.from(amount).gt(BD.from(tokenBalance))) {
      enforce(false).isTruthy(t`Amount ${formatNumber(amount)} > wallet balance ${formatNumber(tokenBalance)}`)
    }
  })

  test('epoch', 'Epoch must be an integer', () => {
    enforce(Number.isInteger(data.epoch)).isTruthy()
  })

  test('epoch', 'Epoch must be a non-negative number', () => {
    enforce(data.epoch >= 0).isTruthy()
  })

  test('epoch', 'Epoch must be a multiple of a week', () => {
    enforce(data.epoch % TIME_FRAMES.WEEK === 0).isTruthy()
  })

  test('step', 'Invalid deposit reward step', () => {
    enforce(Object.values(DepositRewardStep).includes(data.step)).isTruthy()
  })
})
