import type { CurveApi } from '@/dao/types/dao.types'
import { TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { createStub, createTransactionStub } from '@cy/support/helpers/llamalend/test-stub.utils'
import { dayjs } from '@evm-ui/lib/dayjs'

const CHAIN_ID = 1

export const createWithdrawLockScenario = (): {
  assertPreSubmit: () => void
  assertSubmit: () => void
  curve: CurveApi
  unlockTime: number
} => {
  const withdrawLockedCrv = createTransactionStub(TEST_TX_HASH)
  const estimateWithdrawLockedCrv = createStub(143_000)
  const curve = {
    chainId: CHAIN_ID,
    signerAddress: TEST_ADDRESS,
    boosting: {
      withdrawLockedCrv,
      estimateGas: { withdrawLockedCrv: estimateWithdrawLockedCrv },
    },
  } as unknown as CurveApi

  return {
    curve,
    unlockTime: dayjs.utc().subtract(1, 'year').startOf('day').valueOf(),
    assertPreSubmit: () => expect(estimateWithdrawLockedCrv).to.have.been.calledWithExactly(),
    assertSubmit: () => expect(withdrawLockedCrv).to.have.been.calledWithExactly(),
  }
}
