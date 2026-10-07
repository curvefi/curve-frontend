import { skipWhen, test } from 'vest'
import type { DepositFormValues, DepositParams, UserDepositParams } from '@/dex/features/deposit/types'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import { getPoolAmounts, poolAmountField, poolMaxAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'

const validateAmounts = ({
  amounts,
  decimals,
}: {
  amounts: DepositParams['amounts']
  decimals: DepositFormValues['decimals'] | null
}) => {
  test('root', 'Enter an amount to deposit', () => {
    enforce(amounts?.some(amount => +(amount ?? '0') > 0)).equals(true)
  })
  test('decimals', 'Decimals are required', () => {
    enforce(decimals).isArray().isNotEmpty()
    enforce(decimals?.every(decimal => decimal != null && decimal >= 0)).equals(true)
  })
  test('root', 'Amounts must match pool token count', () => {
    enforce(amounts?.length).equals(decimals?.length)
  })
  amounts?.forEach((amount, index) => {
    test(poolAmountField(index), 'Enter a valid non-negative amount', () => {
      enforce(amount).isDecimal({ decimal_digits: '0,' }).gte(0)
    })
    skipWhen(decimals?.[index] == null, () => {
      test(poolAmountField(index), 'Amount exceeds token decimal precision', () => {
        enforce(amount).isDecimal({ decimal_digits: `0,${decimals![index]}` })
      })
    })
  })
}

export const depositFormValidationSuite = createValidationSuite(
  ({ decimals, slippage, ...values }: DepositFormValues) => {
    const amounts = getPoolAmounts(values, decimals?.length)
    validateAmounts({ amounts, decimals })
    validateSlippage({ slippage })
    amounts?.forEach((amount, index) => {
      const maxAmount = values[poolMaxAmountField(index)]
      skipWhen(maxAmount == null, () => {
        test(poolAmountField(index), 'Insufficient token balance', () => {
          enforce(amount).lte(maxAmount!)
        })
      })
    })
  },
)

export const depositQueryValidationSuite = createValidationSuite(
  ({ chainId, decimals, slippage, poolId, amounts }: DepositParams) => {
    poolValidationGroup({ chainId, poolId })
    curveApiValidationGroup({ chainId }, { requireRpc: true })
    validateAmounts({ amounts, decimals })
    validateSlippage({ slippage })
  },
)

export const userDepositParamsValidationSuite = createValidationSuite(
  ({ userAddress, ...params }: UserDepositParams) => {
    depositQueryValidationSuite.run(params)
    evmAddressValidationGroup({ evmAddress: userAddress })
  },
)
