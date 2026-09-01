/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { createSyncStub, createTransactionStub } from '@cy/support/helpers/llamalend/test-stub.utils'
import type { CurveApi } from '@evm-ui/features/connect-wallet'
import { dayjs } from '@evm-ui/lib/dayjs'

const CHAIN_ID = 1
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const calcRoundedUnlockTime = (days: number, currentUnlockTime: number) =>
  Math.floor(dayjs.utc(currentUnlockTime).add(days, 'day').valueOf() / WEEK_MS) * WEEK_MS

export const createExtendLockScenario = (): {
  assertPreSubmit: (expectedDays?: number) => void
  assertSubmit: (expectedDays?: number) => void
  curve: CurveApi
  unlockTime: number
} => {
  let estimatedDays = 0
  const unlockTime = calcRoundedUnlockTime(365, dayjs.utc().valueOf())
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
      calcUnlockTime: cy.stub().callsFake(calcRoundedUnlockTime),
      calculateVeCrv: createSyncStub(100),
      increaseUnlockTime,
      estimateGas: { increaseUnlockTime: estimateIncreaseUnlockTime },
    },
  } as unknown as CurveApi

  return {
    curve,
    unlockTime,
    assertPreSubmit: expectedDays => {
      expect(estimateIncreaseUnlockTime).to.have.been.called
      if (expectedDays != null) expect(estimatedDays).to.equal(expectedDays)
      expect(estimatedDays).to.be.greaterThan(0)
    },
    assertSubmit: expectedDays => {
      if (expectedDays != null) expect(estimatedDays).to.equal(expectedDays)
      expect(increaseUnlockTime).to.have.been.calledWithExactly(estimatedDays)
    },
  }
}
