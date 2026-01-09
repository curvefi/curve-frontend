import { useEffect, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { RepayLoanInfoAccordion } from '@/llamalend/features/borrow/components/RepayLoanInfoAccordion'
import { setValueOptions } from '@/llamalend/features/borrow/react-form.utils'
import { RepayTokenOption, useRepayTokens } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { getTokens, hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import { TokenList, type TokenOption, TokenSelector } from '@ui-kit/features/select-token'
import { useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { mapQuery } from '@ui-kit/types/util'
import { useTraceProps } from '@ui-kit/utils/useTraceProps'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useRepayForm } from '../hooks/useRepayForm'

/**
 * Join button texts with commas and ampersand
 * @example ['Approve', 'Repay', 'Withdraw'] -> 'Approve, Repay & Withdraw'
 * @example ['Approve', 'Repay'] -> 'Approve & Repay'
 */
const joinButtonText = (texts: string[]) =>
  texts.map((t, i) => (i ? `${i === texts.length - 1 ? ' & ' : ', '}${t}` : t)).join('')

function RepayTokenSelector<ChainId extends IChainId>({
  market,
  network,
  selected,
  onSelect,
  options,
}: {
  market: LlamaMarketTemplate | undefined
  network: NetworkDict<ChainId>[ChainId]
  selected: RepayTokenOption | undefined
  onSelect: (token: RepayTokenOption) => void
  options: RepayTokenOption[]
}) {
  const { address: userAddress } = useConnection()
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const tokenAddresses = useMemo(
    () => notFalsy(collateralToken?.address, borrowToken?.address),
    [collateralToken?.address, borrowToken?.address],
  )
  const { data: tokenBalances } = useTokenBalances({ chainId: network.chainId, userAddress, tokenAddresses })
  const { data: tokenPrices } = useTokenUsdRates({ chainId: network.chainId, tokenAddresses })
  useTraceProps('RepayForm', {
    selected,
    options,
    tokenBalances,
    tokenPrices,
    onSelect,
  })
  return (
    <TokenSelector selectedToken={selected}>
      <TokenList
        disableSearch
        disableSorting
        disableMyTokens
        tokens={options}
        balances={tokenBalances}
        tokenPrices={tokenPrices}
        onToken={onSelect as (token: TokenOption) => void} // todo: implement new tokenList for RepayTokens
      />
    </TokenSelector>
  )
}

// todo: net borrow APR (Net borrow rate includes the intrinsic yield + rewards, while the Borrow APR doesn't)
export const RepayForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRepaid,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRepaid?: RepayOptions['onRepaid']
}) => {
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    onSubmit,
    isDisabled,
    borrowToken,
    collateralToken,
    isRepaid,
    repayError,
    txHash,
    isApproved,
    formErrors,
    isFull,
    userState,
  } = useRepayForm({
    market,
    network,
    enabled,
    onRepaid,
  })
  const stateCollateralMax = mapQuery(userState, (data) => data.collateral)
  const { options, selected, onSelect } = useRepayTokens({ market, network })
  const selectedField = selected?.field ?? 'userBorrowed'

  useEffect(
    () =>
      // Reset other fields when selectedField changes
      () =>
        form.setValue(selectedField, undefined, setValueOptions),
    [form, selectedField],
  )

  return (
    <Form // todo: prevHealth, prevRates, debt, prevDebt
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <RepayLoanInfoAccordion
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
          hasLeverage={market && hasLeverage(market)}
        />
      }
    >
      <LoanFormTokenInput
        label={
          {
            stateCollateral: t`From collateral (position)`,
            userCollateral: t`From collateral (wallet)`,
            userBorrowed: t`From borrowed token (wallet)`,
          }[selectedField]
        }
        token={selectedField == 'userBorrowed' ? borrowToken : collateralToken}
        blockchainId={network.id}
        name={selectedField}
        form={form}
        {...(selectedField === 'stateCollateral' && {
          max: { ...stateCollateralMax, fieldName: 'maxStateCollateral' },
          positionBalance: {
            position: stateCollateralMax,
            tooltip: t`Current collateral in position`,
          },
        })}
        testId={'repay-input-' + selectedField}
        network={network}
        tokenSelector={
          <RepayTokenSelector
            market={market}
            network={network}
            selected={selected}
            onSelect={onSelect}
            options={options}
          />
        }
      />
      <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
        {isPending
          ? t`Processing...`
          : joinButtonText(notFalsy(!isApproved?.data && t`Approve`, isFull.data ? t`Repay full` : t`Repay`))}
      </Button>

      <LoanFormAlerts
        isSuccess={isRepaid}
        error={repayError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={notFalsy(selectedField)}
        successTitle={t`Loan repaid`}
      />
    </Form>
  )
}
