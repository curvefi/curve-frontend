/* eslint-disable @typescript-eslint/no-unused-expressions */
import { oneDecimal } from '@cy/support/generators'
import { TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import {
  createIsApprovedStub,
  createStub,
  createSyncStub,
  createTransactionStub,
} from '@cy/support/helpers/llamalend/test-stub.utils'
import type { CurveApi } from '@evm-ui/features/connect-wallet'
import { dayjs } from '@evm-ui/lib/dayjs'

const CHAIN_ID = 1

export const createCreateVeCrvLockScenario = ({
  isApproved: approved,
}: {
  isApproved: boolean
}): {
  assertPreSubmit: () => void
  assertSubmit: () => void
  curve: CurveApi
  lockedAmount: string
} => {
  let calculatedDays = 0
  const lockedAmount = oneDecimal(1, 999, 2).toString()
  const approve = createTransactionStub([TEST_TX_HASH])
  const isApproved = approved ? createStub(true) : createIsApprovedStub(approve)
  const estimateApprove = createStub(91_000)
  const estimateCreateLock = createStub(143_000)
  const createLock = createTransactionStub(TEST_TX_HASH)
  const calcUnlockTime = cy.stub().callsFake((days: number) => {
    calculatedDays = days
    return dayjs.utc().add(1, 'year').startOf('day').valueOf()
  })

  const curve = {
    chainId: CHAIN_ID,
    signerAddress: TEST_ADDRESS,
    boosting: {
      getCrv: createStub('1000'),
      isApproved,
      approve,
      createLock,
      calculateVeCrv: createSyncStub(10),
      calcUnlockTime,
      estimateGas: { approve: estimateApprove, createLock: estimateCreateLock },
    },
  } as unknown as CurveApi

  return {
    curve,
    lockedAmount,
    assertPreSubmit: () => {
      expect(calcUnlockTime).to.have.been.called
      expect(isApproved).to.have.been.calledWithExactly(lockedAmount)
      if (approved) {
        expect(estimateCreateLock).to.have.been.calledWithExactly(lockedAmount, calculatedDays)
      } else {
        expect(estimateApprove).to.have.been.calledWithExactly(lockedAmount)
      }
    },
    assertSubmit: () => {
      if (!approved) expect(approve).to.have.been.calledWithExactly(lockedAmount)
      expect(estimateCreateLock).to.have.been.calledWithExactly(lockedAmount, calculatedDays)
      expect(createLock).to.have.been.calledWithExactly(lockedAmount, calculatedDays)
    },
  }
}
