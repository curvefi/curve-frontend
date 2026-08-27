import type { CurveApi } from '@/dao/types/dao.types'
import { oneDecimal } from '@cy/support/generators'
import { TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import {
  createIsApprovedStub,
  createStub,
  createSyncStub,
  createTransactionStub,
} from '@cy/support/helpers/llamalend/test-stub.utils'
import { dayjs } from '@evm-ui/lib/dayjs'

const CHAIN_ID = 1

export const createCreateVeCrvLockScenario = ({ isApproved: approved }: { isApproved: boolean }) => {
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
      isApproved,
      approve,
      createLock,
      calculateVeCrv: createSyncStub(10),
      calcUnlockTime,
      estimateGas: { approve: estimateApprove, createLock: estimateCreateLock },
    },
  } as unknown as CurveApi

  return {
    approve,
    calcUnlockTime,
    calculatedDays: () => calculatedDays,
    createLock,
    curve,
    estimateApprove,
    estimateCreateLock,
    isApproved,
    lockedAmount,
  }
}
