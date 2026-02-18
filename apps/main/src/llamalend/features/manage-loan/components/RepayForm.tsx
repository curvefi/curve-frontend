import { useEffect } from 'react'
import { RepayLoanInfoList } from '@/llamalend/features/borrow/components/RepayLoanInfoList'
import { RepayTokenList, type RepayTokenListProps } from '@/llamalend/features/manage-loan/components/RepayTokenList'
import { RepayTokenOption, useRepayTokens } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import { TokenSelector } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { q } from '@ui-kit/types/util'
import { joinButtonText } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useRepayForm } from '../hooks/useRepayForm'
import { useTokenAmountConversion } from '../hooks/useTokenAmountConversion'

const useFormSync = (
  params: RepayParams,
  enabled: boolean | undefined,
  onPricesUpdated: (prices: string[] | undefined) => void,
) => {
  const { data } = useRepayPrices(params, enabled)
  useEffect(() => {
    onPricesUpdated(data)
  }, [onPricesUpdated, data])
  useEffect(() => () => onPricesUpdated(undefined), [onPricesUpdated])
}

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
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRepaid?: RepayOptions['onRepaid']
  onPricesUpdated: (prices: string[] | undefined) => void
}) => {
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    isDisabled,
    onSubmit,
    borrowToken,
    collateralToken,
    isRepaid,
    repayError,
    txHash,
    isApproved,
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
  const {
    data: maxAmountInBorrowToken,
    isLoading: maxAmountInBorrowTokenLoading,
    error: maxAmountInBorrowTokenError,
  } = useTokenAmountConversion({
    chainId,
    amountIn: max[selectedField],
    tokenInAddress: selectedToken?.address,
    tokenOutAddress: borrowToken?.address,
  })

  const maxAmountPrefix = notFalsy(
    selectedField === 'stateCollateral' && t`Using collateral balances to repay.`,
    t`Max repay amount:`,
  ).join(' ')

  useFormSync(params, enabled, onPricesUpdated)

  useEffect(
    () => () => {
      // Reset when selectedField changes and the field is dirty (unmounting the field)
      if (selectedField in form.formState.dirtyFields) {
        updateForm(form, { [selectedField]: undefined })
      }
    },
    [form, selectedField],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <RepayLoanInfoList
          form={form}
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={(value) => updateForm(form, { slippage: value })}
          hasLeverage={market && hasLeverage(market)}
          swapRequired={swapRequired}
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
        onValueChange={(v) => updateForm(form, { isFull: v === form.getValues('maxBorrowed') })}
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
          maxAmountInBorrowTokenError?.message ?? (
            <Balance
              prefix={maxAmountPrefix}
              tooltip={t`Max available to repay`}
              symbol={borrowToken?.symbol}
              balance={maxAmountInBorrowToken}
              loading={max[selectedField].isLoading || maxAmountInBorrowTokenLoading}
              onClick={() =>
                updateForm(form, {
                  [selectedField]: max[selectedField].data,
                  isFull: selectedField === 'userBorrowed',
                })
              }
            />
          )
        }
      />
      <HighPriceImpactAlert {...q(useRepayPriceImpact(params, enabled && swapRequired))} />
      <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
        {isPending
          ? t`Processing...`
          : joinButtonText(
              isApproved.data === false && t`Approve`,
              notFalsy(t`Repay`, fromPosition && t`from Position`).join(' '),
              isFull.data && t`Close Position`,
            )}
      </Button>

      <FormAlerts
        isSuccess={isRepaid}
        error={repayError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={notFalsy(selectedField, max[selectedField]?.field)}
        successTitle={t`Loan repaid`}
      />
    </Form>
  )
}
