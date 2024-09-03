import { TIME_FRAMES } from '@/constants'
import type { CombinedGaugeParams } from '@/entities/gauge/types'
import { poolValidationGroup } from '@/entities/pool'
import {
  addressValidationFn,
  amountValidationFn,
  createValidationSuite,
  tokenIdValidationFn,
} from '@/shared/validation'
import { BD } from '@/shared/curve-lib'
import useStore from '@/store/useStore'
import { formatNumber } from '@/utils'
import { t } from '@lingui/macro'
import { enforce, group, test } from 'vest'

export const gaugeValidationGroup = ({
  chainId,
  poolId,
  distributorId,
  rewardTokenId,
  amount,
  epoch,
}: CombinedGaugeParams) =>
  group('gaugeValidation', () => {
    const state = useStore.getState()
    const userBalancesMapper = state.userBalances.userBalancesMapper

    poolValidationGroup({
      chainId,
      poolId,
    })

    test('distributorId', 'Invalid distributor ID', () => addressValidationFn(distributorId))

    test('rewardTokenId', 'Invalid reward token ID', () => tokenIdValidationFn(rewardTokenId))

    test('amount', 'Amount exceeds wallet balance', () => {
      amountValidationFn(amount)

      if (!rewardTokenId || !amount) return
      const tokenBalance = userBalancesMapper[rewardTokenId]
      if (!tokenBalance) return

      enforce(amount).condition((amount) => {
        return {
          pass: BD.from(amount).lte(BD.from(tokenBalance)),
          message: t`Amount ${formatNumber(amount)} > wallet balance ${formatNumber(tokenBalance)}`,
        }
      })
    })

    test('epoch', 'Invalid epoch', () => {
      enforce(epoch)
        .isNotEmpty('Epoch is required')
        .isPositiveNumber()
        .greaterThan(0, 'Epoch must be greater than 0')
        .condition((epoch: unknown) => ({
          pass: typeof epoch === 'number' && epoch % TIME_FRAMES.WEEK === 0,
          message: t`Epoch must be a multiple of a week`,
        }))
    })
  })

export const gaugeValidationSuite = createValidationSuite(gaugeValidationGroup)
