import { zip } from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import { useMemo } from 'react'
import FieldToken from '@/dex/components/PagePool/components/FieldToken'
import type { FormValues, LoadMaxAmount } from '@/dex/components/PagePool/Deposit/types'
import { FieldsWrapper } from '@/dex/components/PagePool/styles'
import type { TransferProps } from '@/dex/components/PagePool/types'
import useStore from '@/dex/store/useStore'
import type { CurrencyReserves } from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import Checkbox from '@ui/Checkbox'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { Amount } from '../../utils'

/**
 * Calculate new form values based on the changed index and value.
 * This function is used to update the amounts in the form when a user changes the value of one of the inputs.
 *
 * When "balanced amounts" is selected, we update all the other form fields to maintain the same ratio.
 */
function calculateNewFormValues(
  value: string,
  changedIndex: number,
  { isBalancedAmounts, amounts: oldAmounts }: Pick<FormValues, 'amounts' | 'isBalancedAmounts'>,
  tokenAddresses: string[],
  { tokens, totalUsd }: CurrencyReserves,
): Amount[] {
  if (!isBalancedAmounts) {
    return oldAmounts.map((amount, index) => (index === changedIndex ? { ...amount, value } : amount))
  }

  const reserves = Object.fromEntries(
    tokens.map((t) => [t.tokenAddress, { usdPrice: t.usdRate, reserveRatio: t.balanceUsd / Number(totalUsd) }]),
  )
  const { reserveRatio: changedRatio, usdPrice: changedUsdPrice } = reserves[tokenAddresses[changedIndex]] ?? {}
  return zip(oldAmounts, tokenAddresses).map((tuple, index) => {
    const [amount, tokenAddress] = tuple as [Amount, string]
    if (changedIndex === index) {
      return { ...amount, value }
    }
    const { usdPrice, reserveRatio } = reserves[tokenAddress] ?? {}
    if (usdPrice && reserveRatio && changedRatio) {
      const valueUsd = Number(value) * Number(changedUsdPrice)
      const newValueUsd = (Number(valueUsd) * Number(reserveRatio)) / Number(changedRatio)
      const newValue = newValueUsd / Number(usdPrice)
      return { ...amount, value: newValue.toString() }
    }
    return amount
  })
}

const FieldsDeposit = ({
  formProcessing,
  formValues,
  haveSigner,
  isSeed,
  blockchainId,
  poolData,
  poolDataCacheOrApi,
  routerParams: { rChainId, rPoolId },
  tokensMapper,
  userPoolBalances,
  updateFormValues,
}: {
  blockchainId: string
  formProcessing: boolean
  formValues: FormValues
  haveSigner: boolean
  isSeed: boolean | null
  updateFormValues: (
    updatedFormValues: Partial<FormValues>,
    loadMaxAmount: LoadMaxAmount | null,
    updatedMaxSlippage: string | null,
  ) => void
} & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'tokensMapper' | 'userPoolBalances'>) => {
  const network = useStore((state) => state.networks.networks[rChainId])
  const balancesLoading = useStore((state) => state.user.walletBalancesLoading)
  const maxLoading = useStore((state) => state.poolDeposit.maxLoading)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])
  const isBalancedAmounts = formValues.isBalancedAmounts

  const handleFormAmountChange = (value: string, changedIndex: number) => {
    updateFormValues(
      {
        amounts: calculateNewFormValues(
          value,
          changedIndex,
          formValues,
          poolDataCacheOrApi.tokenAddresses,
          currencyReserves,
        ),
        isBalancedAmounts: isBalancedAmounts ? 'by-form' : false,
      },
      null,
      null,
    )
  }

  const amountsInput = useMemo(() => {
    if (formValues.amounts.length > 0) {
      return formValues.amounts
    }
    return poolDataCacheOrApi.tokens.map((token, idx) => ({
      token,
      tokenAddress: poolDataCacheOrApi.tokenAddresses[idx],
      value: '',
    }))
  }, [poolDataCacheOrApi, formValues.amounts])

  const isDisabled = isSeed === null || isSeed || formProcessing

  return (
    <FieldsWrapper>
      {poolDataCacheOrApi.tokens.length === amountsInput.length &&
        poolDataCacheOrApi.tokens.map((token, idx) => {
          const tokenAddress = poolDataCacheOrApi.tokenAddresses[idx]
          const addressBalanceAmount = userPoolBalances?.[tokenAddress] ?? '0'
          const { ethAddress = tokenAddress } = tokensMapper[tokenAddress] ?? {}
          const haveSameTokenName = poolDataCacheOrApi.tokensCountBy[token] > 1
          const { value } = amountsInput[idx]
          const isDisableInput = isSeed === null || formProcessing || (isSeed && idx !== 0)

          return (
            <FieldToken
              key={`${tokenAddress}-${idx}`}
              idx={idx}
              amount={value}
              balance={formatNumber(addressBalanceAmount)}
              balanceLoading={balancesLoading}
              disableInput={isDisableInput}
              disableMaxButton={isDisableInput}
              hasError={haveSigner && !formProcessing ? +(value || '0') > +addressBalanceAmount : false}
              haveSameTokenName={haveSameTokenName}
              haveSigner={haveSigner}
              blockchainId={blockchainId}
              isMaxLoading={maxLoading === idx}
              token={token}
              tokenAddress={ethAddress}
              handleAmountChange={handleFormAmountChange}
              handleMaxClick={() =>
                updateFormValues(
                  { isBalancedAmounts: isBalancedAmounts ? 'by-form' : false },
                  { tokenAddress, idx },
                  null,
                )
              }
            />
          )
        })}

      {haveSigner && (
        <FieldsWrapper>
          <Checkbox
            isDisabled={isDisabled}
            isSelected={!!formValues.isBalancedAmounts}
            onChange={(isBalancedAmounts) =>
              updateFormValues({ isBalancedAmounts: isBalancedAmounts ? 'by-wallet' : false }, null, null)
            }
          >
            {t`Add all coins in a balanced proportion`}
          </Checkbox>
        </FieldsWrapper>
      )}

      {poolDataCacheOrApi.hasWrapped && formValues.isWrapped !== null && (
        <FieldsWrapper>
          <Checkbox
            isDisabled={!poolData || isDisabled || network?.poolIsWrappedOnly?.[poolDataCacheOrApi.pool.id]}
            isSelected={formValues.isWrapped}
            onChange={(isWrapped) => {
              if (poolData) {
                const wrapped = setPoolIsWrapped(poolData, isWrapped)
                const cFormValues = cloneDeep(formValues)

                cFormValues.isWrapped = isWrapped
                cFormValues.amounts = wrapped.tokens.map((token, idx) => ({
                  token,
                  tokenAddress: wrapped.tokenAddresses[idx],
                  value: '',
                }))
                updateFormValues(cFormValues, null, null)
              }
            }}
          >
            {t`Deposit Wrapped`}
          </Checkbox>
        </FieldsWrapper>
      )}
    </FieldsWrapper>
  )
}

export default FieldsDeposit
