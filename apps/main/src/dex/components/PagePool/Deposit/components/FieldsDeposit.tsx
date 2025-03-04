import type { TransferProps } from '@/dex/components/PagePool/types'
import type { FormValues, LoadMaxAmount } from '@/dex/components/PagePool/Deposit/types'
import { t } from '@ui-kit/lib/i18n'
import { useMemo } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { formatNumber } from '@ui/utils'
import useStore from '@/dex/store/useStore'
import { FieldsWrapper } from '@/dex/components/PagePool/styles'
import Checkbox from '@ui/Checkbox'
import FieldToken from '@/dex/components/PagePool/components/FieldToken'

const FieldsDeposit = ({
  formProcessing,
  formValues,
  haveSigner,
  isSeed,
  blockchainId,
  poolData,
  poolDataCacheOrApi,
  routerParams,
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
  const { rChainId } = routerParams
  const network = useStore((state) => state.networks.networks[rChainId])
  const balancesLoading = useStore((state) => state.user.walletBalancesLoading)
  const maxLoading = useStore((state) => state.poolDeposit.maxLoading)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)

  const handleFormAmountChange = (value: string, idx: number) => {
    const clonedFrmAmounts = cloneDeep(formValues.amounts)
    clonedFrmAmounts[idx].value = value

    updateFormValues(
      {
        amounts: clonedFrmAmounts,
        isBalancedAmounts: false,
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
              handleMaxClick={() => updateFormValues({ isBalancedAmounts: false }, { tokenAddress, idx }, null)}
            />
          )
        })}

      {haveSigner && (
        <FieldsWrapper>
          <Checkbox
            isDisabled={isDisabled}
            isSelected={formValues.isBalancedAmounts}
            onChange={(isBalancedAmounts) => updateFormValues({ isBalancedAmounts }, null, null)}
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
