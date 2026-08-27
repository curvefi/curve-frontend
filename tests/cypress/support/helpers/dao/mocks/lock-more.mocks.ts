import type { CurveApi } from '@/dao/types/dao.types'
import { oneDecimal } from '@cy/support/generators'
import { TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import {
  createIsApprovedStub,
  createStub,
  createSyncStub,
  createTransactionStub,
} from '@cy/support/helpers/llamalend/test-stub.utils'

const CHAIN_ID = 1

export const createLockMoreScenario = ({
  isApproved: approved,
}: {
  isApproved: boolean
}): {
  assertPreSubmit: () => void
  assertSubmit: () => void
  curve: CurveApi
  lockedAmount: string
} => {
  const lockedAmount = oneDecimal(1, 999, 2).toString()
  const approve = createTransactionStub([TEST_TX_HASH])
  const isApproved = approved ? createStub(true) : createIsApprovedStub(approve)
  const estimateApprove = createStub(91_000)
  const estimateIncreaseAmount = createStub(143_000)
  const increaseAmount = createTransactionStub(TEST_TX_HASH)
  const curve = {
    chainId: CHAIN_ID,
    signerAddress: TEST_ADDRESS,
    boosting: {
      isApproved,
      approve,
      increaseAmount,
      calculateVeCrv: createSyncStub(10),
      estimateGas: { approve: estimateApprove, increaseAmount: estimateIncreaseAmount },
    },
  } as unknown as CurveApi

  return {
    curve,
    lockedAmount,
    assertPreSubmit: () => {
      expect(isApproved).to.have.been.calledWithExactly(lockedAmount)
      if (approved) {
        expect(estimateIncreaseAmount).to.have.been.calledWithExactly(lockedAmount)
      } else {
        expect(estimateApprove).to.have.been.calledWithExactly(lockedAmount)
      }
    },
    assertSubmit: () => {
      if (!approved) expect(approve).to.have.been.calledWithExactly(lockedAmount)
      expect(estimateIncreaseAmount).to.have.been.calledWithExactly(lockedAmount)
      expect(increaseAmount).to.have.been.calledWithExactly(lockedAmount)
    },
  }
}
