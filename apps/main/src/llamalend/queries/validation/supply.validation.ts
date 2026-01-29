import { enforce, skipWhen, test } from 'vest'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup } from '@ui-kit/lib/model/query/market-id-validation'
import type { UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { MakeOptional } from '@ui-kit/types/util'
import type { Decimal } from '@ui-kit/utils'

type CompleteDepositForm = {
  depositAmount: Decimal
}

type CalculatedDepositValues = {
  maxDepositAmount: Decimal | undefined
}
export type DepositMutation = CompleteDepositForm
export type DepositForm = MakeOptional<CompleteDepositForm, 'depositAmount'> & CalculatedDepositValues

export type DepositQuery<ChainId = number> = UserMarketQuery<ChainId> & CompleteDepositForm
export type DepositParams<ChainId = number> = FieldsOf<DepositQuery<ChainId>>

const validateDepositAmount = (amount: Decimal | undefined | null, required: boolean = true) => {
  test('depositAmount', 'Deposit amount must be a positive number', () => {
    if (required || amount != null) {
      enforce(amount).isNumeric().gt(0)
    }
  })
}

const validateDepositMaxAmount = (amount: Decimal | undefined | null, maxAmount: Decimal | undefined | null) => {
  skipWhen(amount == null || maxAmount == null, () => {
    test('depositAmount', `Amount exceeds maximum of ${maxAmount}`, () => {
      enforce(amount).lte(maxAmount)
    })
  })
}

// Form validation suite (for real-time form validation)
export const depositFormValidationSuite = createValidationSuite(
  ({ depositAmount = '0', maxDepositAmount }: DepositForm) => {
    validateDepositAmount(depositAmount, false)
    validateDepositMaxAmount(depositAmount, maxDepositAmount)
  },
)

// Query validation suite (for API queries)
export const depositValidationGroup = <IChainId extends number>({
  chainId,
  marketId,
  depositAmount = '0',
  userAddress,
}: DepositParams<IChainId>) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
  userAddressValidationGroup({ userAddress })
  validateDepositAmount(depositAmount)
}

export const depositValidationSuite = createValidationSuite((params: DepositParams) => depositValidationGroup(params))

export const depositMutationValidationSuite = createValidationSuite((params: DepositParams) => {
  depositValidationGroup(params)
})
