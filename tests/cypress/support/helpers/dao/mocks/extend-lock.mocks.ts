/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { createSyncStub, createTransactionStub } from '@cy/support/helpers/llamalend/test-stub.utils'
import type { CurveApi } from '@evm-ui/features/connect-wallet'
import { dayjs } from '@evm-ui/lib/dayjs'

const CHAIN_ID = 1

export const createExtendLockScenario = (): {
  assertPreSubmit: () => void
  assertSubmit: () => void
  curve: CurveApi
  unlockTime: number
} => {
  let estimatedDays = 0
  const unlockTime = dayjs.utc().add(1, 'year').startOf('day').valueOf()
  const estimateIncreaseUnlockTime = cy.stub().callsFake((days: number) => {
    estimatedDays = days
    return Promise.resolve(143_000)
  })
  const increaseUnlockTime = createTransactionStub(TEST_TX_HASH)
  const curve = {
    chainId: CHAIN_ID,
    signerAddress: TEST_ADDRESS,
    boosting: {
      getLockedAmountAndUnlockTime: createSyncStub({ lockedAmount: '100', unlockTime }),
      getVeCrv: createSyncStub('100'),
      calcUnlockTime: cy
        .stub()
        .callsFake((days: number, currentUnlockTime: number) =>
          dayjs.utc(currentUnlockTime).add(days, 'day').valueOf(),
        ),
      calculateVeCrv: createSyncStub(100),
      increaseUnlockTime,
      estimateGas: { increaseUnlockTime: estimateIncreaseUnlockTime },
    },
  } as unknown as CurveApi

  return {
    curve,
    unlockTime,
    assertPreSubmit: () => {
      expect(estimateIncreaseUnlockTime).to.have.been.called
      expect(estimatedDays).to.be.greaterThan(0)
    },
    assertSubmit: () => {
      expect(increaseUnlockTime).to.have.been.calledWithExactly(estimatedDays)
    },
  }
}
