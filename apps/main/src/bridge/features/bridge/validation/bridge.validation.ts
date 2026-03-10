import { enforce, group, test } from 'vest'
import type { Amount } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { BridgeForm } from '../hooks/useBridgeForm'
import type { BridgeParams } from '../types'

type FieldAmount = Amount | null | undefined

const validateAmountGroup = ({
  amount,
  min,
  max,
  walletBalance,
}: {
  amount: FieldAmount
  min: FieldAmount
  max: FieldAmount
  walletBalance: FieldAmount
}): void => {
  group('amountValidation', () => {
    test('amount', `Bridge amount must be a non-negative number`, () => {
      if (amount == null) return
      enforce(amount).isNumeric().gt(0)
    })

    test('amount', `Bridge amount cannot be less than min amount (${min} crvUSD) `, () => {
      if (min == null) return
      enforce(amount).isNumeric().gte(min)
    })

    test('amount', `Bridge amount cannot exceed max amount (${max} crvUSD) `, () => {
      if (max == null) return
      enforce(amount).isNumeric().lte(max)
    })

    test('amount', `Bridge amount cannot exceed wallet balance`, () => {
      if (walletBalance == null) return
      enforce(amount).isNumeric().lte(walletBalance)
    })
  })
}

export const validateSupportedNetworkGroup = ({ chainId }: Pick<BridgeParams, 'chainId'>): void => {
  group('supportedNetwork', () => {
    test('chainId', 'ChainId is not supported by FastBridge', () => {
      enforce(
        requireLib('curveApi')
          .fastBridge.getSupportedNetworks()
          .map(({ chainId }) => chainId)
          .includes(chainId ?? 0),
      ).isTruthy()
    })
  })
}

export const bridgeFormValidationSuite = createValidationSuite(
  ({ fromChainId, amount, min, max, walletBalance }: BridgeForm) => {
    chainValidationGroup({ chainId: fromChainId })
    curveApiValidationGroup({ chainId: fromChainId })
    validateAmountGroup({ amount, min, max, walletBalance })
  },
)

/** For actual contract execution (including approve)  */
export const bridgeValidationSuite = createValidationSuite((params: BridgeParams) => {
  chainValidationGroup(params)
  curveApiValidationGroup(params, { requireRpc: true })
  userAddressValidationGroup(params)

  test('amount', 'Amount cannot be empty', () => {
    enforce(params.amount).isNumeric().gte(0)
  })
})
