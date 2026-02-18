import { useEffect } from 'react'
import { RepayLoanInfoAccordion } from '@/llamalend/features/borrow/components/RepayLoanInfoAccordion'
import { RepayTokenList, type RepayTokenListProps } from '@/llamalend/features/manage-loan/components/RepayTokenList'
import { RepayTokenOption, useRepayTokens } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import { HighPriceImpactAlert, LoanFormAlerts } from '@/llamalend/widgets/action-card/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { Falsy, notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import { TokenSelector } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { q, type Query } from '@ui-kit/types/util'
import { setValueOptions } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useRepayForm } from '../hooks/useRepayForm'
import { useTokenAmountConversion } from '../hooks/useTokenAmountConversion'

type OnRepayFormUpdate = (prices: Query<string[]>) => void

const useFormSync = (params: RepayParams, enabled: boolean | undefined, onUpdate: OnRepayFormUpdate) => {
  const { data, isLoading, error } = useRepayPrices(params, enabled)
  useEffect(() => {
    onUpdate({ data, isLoading, error })
  }, [onUpdate, data, isLoading, error])
}

/**
 * Join button texts with commas and ampersand
 * @example ['Approve', 'Repay', 'Withdraw'] -> 'Approve, Repay & Withdraw'
 * @example ['Approve', 'Repay'] -> 'Approve & Repay'
 */
const joinButtonText = (...texts: (string | Falsy)[]) =>
  notFalsy(...texts)
    .map((t, i, all) => (i ? `${i === all.length - 1 ? ' & ' : ', '}${t}` : t))
    .join('')

function RepayTokenSelector<ChainId extends IChainId>({
  token,
  ...props
}: RepayTokenListProps<ChainId> & {
  token: RepayTokenOption | undefined
}) {
  const [isOpen, onOpen, onClose] = useSwitch(false)
  if (props.tokens.length === 1) {
    const {
      tokens: [{ address, chain, symbol }],
    } = props
    return <TokenLabel blockchainId={chain} address={address} label={symbol} />
  }
  return (
    <TokenSelector
      selectedToken={token}
      title={t`Select Repay Token`}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
    >
      <RepayTokenList {...props} />
    </TokenSelector>
  )
}

// todo: net borrow APR (includes the intrinsic yield + rewards, while the Borrow APR doesn't)
export const RepayForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRepaid,
  onUpdate,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRepaid?: RepayOptions['onRepaid']
  onUpdate: OnRepayFormUpdate
}) => {
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    onSubmit,
    borrowToken,
    collateralToken,
    isRepaid,
    repayError,
    txHash,
    isApproved,
    routes,
    formErrors,
    max,
    isFull,
  } = useRepayForm({
    market,
    network,
    enabled,
    onRepaid,
  })
  const { token, onToken, tokens } = useRepayTokens({ market, networkId: network.id })

  const selectedField = token?.field ?? 'userBorrowed'
  const selectedToken = selectedField == 'userBorrowed' ? borrowToken : collateralToken
  const fromPosition = isFull.data === false && selectedField === 'stateCollateral'
  const swapRequired = selectedToken !== borrowToken

  // The max repay amount in the helper message should always be denominated in terms of the borrow token.
  const { data: maxAmountInBorrowToken, isLoading: maxAmountInBorrowTokenLoading } = useTokenAmountConversion({
    chainId,
    amountIn: max[selectedField].data,
    tokenInAddress: selectedToken?.address,
    tokenOutAddress: borrowToken?.address,
  })

  const maxAmountPrefix = notFalsy(
    selectedField === 'stateCollateral' && t`Using collateral balances to repay.`,
    t`Max repay amount:`,
  ).join(' ')

  useFormSync(params, enabled, onUpdate)

  useEffect(
    // Reset field when selectedField changes
    () => () => form.setValue(selectedField, undefined, setValueOptions),
    [form, selectedField],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <RepayLoanInfoAccordion
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
          hasLeverage={market && hasLeverage(market)}
          swapRequired={swapRequired}
          routes={routes}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to repay`}
        token={selectedToken}
        blockchainId={network.id}
        name={selectedField}
        form={form}
        max={max[selectedField]}
        maxType="range"
        {...(selectedField === 'stateCollateral' && {
          positionBalance: { position: max.stateCollateral, tooltip: t`Current collateral in position` },
        })}
        testId={'repay-input-' + selectedField}
        network={network}
        onValueChange={(v) => form.setValue('isFull', v === form.getValues('maxBorrowed'), setValueOptions)}
        tokenSelector={
          <RepayTokenSelector
            token={token}
            market={market}
            network={network}
            stateCollateral={max.stateCollateral}
            onToken={onToken}
            tokens={tokens}
          />
        }
        message={
          <Balance
            prefix={maxAmountPrefix}
            tooltip={t`Max available to repay`}
            symbol={borrowToken?.symbol}
            balance={maxAmountInBorrowToken}
            loading={max[selectedField].isLoading || maxAmountInBorrowTokenLoading}
            onClick={() => {
              form.setValue(selectedField, max[selectedField].data, setValueOptions)
              form.setValue('isFull', selectedField === 'userBorrowed', setValueOptions)
              void form.trigger(max[selectedField].field) // re-validate max
            }}
          />
        }
      />
      <HighPriceImpactAlert {...q(useRepayPriceImpact(params, enabled && swapRequired))} />
      <Button
        type="submit"
        loading={isPending || !market}
        disabled={formErrors.length > 0}
        data-testid="repay-submit-button"
      >
        {isPending
          ? t`Processing...`
          : joinButtonText(
              isApproved?.data === false && t`Approve`,
              notFalsy(t`Repay`, fromPosition && t`from Position`).join(' '),
              isFull.data && t`Close Position`,
            )}
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
