import { BigNumber } from 'bignumber.js'
import lodash from 'lodash'
import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import { FieldToken } from '@/dex/components/PagePool/components/FieldToken'
import type { FormValues, LoadMaxAmount } from '@/dex/components/PagePool/Deposit/types'
import { FieldsWrapper } from '@/dex/components/PagePool/styles'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useStore } from '@/dex/store/useStore'
import type { CurrencyReserves } from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { Checkbox } from '@ui/Checkbox'
import { useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { Amount } from '../../utils'

/**
 * Format the precision of the balanced value based on the USD price.
 * The amount of decimals is determined by the USD price, so it's accurate to around $1.
 */
function formatPrecision(balancedValue: BigNumber, usdPrice: number) {
  const decimals = Math.ceil(Math.log10(usdPrice))
  return balancedValue.toFormat(decimals, BigNumber.ROUND_HALF_DOWN, { groupSeparator: '', decimalSeparator: '.' })
}

/**
 * Calculate new balanced form values based on the changed index and value, keeping the ratios of the other tokens.
 * This function is used to update the amounts in the form when a user changes the value of one of the inputs.
 */
function calculateBalancedValues(
  [value, changedIndex]: [string, number],
  oldAmounts: FormValues['amounts'],
  tokenAddresses: string[],
  { tokens, totalUsd }: CurrencyReserves,
): Amount[] {
  const reserves = Object.fromEntries(
    tokens.map((t) => [t.tokenAddress, { usdPrice: t.usdRate, reserveRatio: t.balanceUsd / Number(totalUsd) }]),
  )
  const { reserveRatio: changedRatio, usdPrice: changedUsdPrice } = reserves[tokenAddresses[changedIndex]] ?? {}
  return lodash.zip(oldAmounts, tokenAddresses).map((tuple, index) => {
    const [amount, tokenAddress] = tuple as [Amount, string]
    if (changedIndex === index) {
      return { ...amount, value }
    }
    const { usdPrice, reserveRatio } = reserves[tokenAddress] ?? {}
    if (usdPrice && reserveRatio && changedRatio) {
      const valueUsd = BigNumber(value).times(changedUsdPrice)
      const balancedValueUsd = BigNumber(valueUsd).times(reserveRatio).div(changedRatio)
      const balancedValue = balancedValueUsd.div(usdPrice)
      return { ...amount, value: formatPrecision(balancedValue, usdPrice) }
    }
    return amount
  })
}

export const FieldsDeposit = ({
  chainId,
  formProcessing,
  formValues,
  haveSigner,
  isSeed,
  blockchainId,
  poolData,
  poolDataCacheOrApi,
  routerParams: { rChainId, rPoolIdOrAddress },
  tokensMapper,
  updateFormValues,
}: {
  chainId: number | undefined
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
} & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'tokensMapper'>) => {
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const maxLoading = useStore((state) => state.poolDeposit.maxLoading)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const reserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, poolId)])
  const isBalancedAmounts = formValues.isBalancedAmounts

  const handleFormAmountChange = useCallback(
    (value: string, changedIndex: number) => {
      const { amounts } = useStore.getState().poolDeposit.formValues
      updateFormValues(
        isBalancedAmounts && reserves
          ? {
              amounts: calculateBalancedValues(
                [value, changedIndex],
                amounts,
                poolDataCacheOrApi.tokenAddresses,
                reserves,
              ),
              isBalancedAmounts: 'by-form',
            }
          : {
              amounts: amounts.map((amount, index) => (index === changedIndex ? { ...amount, value } : amount)),
            },
        null,
        null,
      )
    },
    [updateFormValues, isBalancedAmounts, reserves, poolDataCacheOrApi.tokenAddresses],
  )

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

  const afterMaxClick = useCallback(
    (idx: number) => {
      const tokenAddress = poolDataCacheOrApi.tokenAddresses[idx]
      updateFormValues({ isBalancedAmounts: false }, { tokenAddress, idx }, null)
    },
    [poolDataCacheOrApi.tokenAddresses, updateFormValues],
  )

  const { address: userAddress } = useConnection()
  const { data: userPoolBalances, isLoading: balancesLoading } = useTokenBalances({
    chainId,
    userAddress,
    tokenAddresses: poolDataCacheOrApi.tokenAddresses as Address[],
  })

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
              balance={addressBalanceAmount}
              balanceLoading={balancesLoading}
              disabled={isDisableInput}
              hasError={haveSigner && !formProcessing ? +(value || '0') > +addressBalanceAmount : false}
              haveSameTokenName={haveSameTokenName}
              haveSigner={haveSigner}
              blockchainId={blockchainId}
              isMaxLoading={maxLoading === idx}
              token={token}
              tokenAddress={ethAddress}
              handleAmountChange={handleFormAmountChange}
              afterMaxClick={afterMaxClick}
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
                const cFormValues = lodash.cloneDeep(formValues)

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
