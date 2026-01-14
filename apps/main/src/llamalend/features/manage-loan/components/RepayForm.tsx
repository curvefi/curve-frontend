import { useEffect } from 'react'
import { RepayLoanInfoAccordion } from '@/llamalend/features/borrow/components/RepayLoanInfoAccordion'
import { setValueOptions } from '@/llamalend/features/borrow/react-form.utils'
import { RepayTokenList } from '@/llamalend/features/manage-loan/components/RepayTokenList'
import { useRepayTokens } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import { TokenSelector } from '@ui-kit/features/select-token'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/Balance'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useRepayForm } from '../hooks/useRepayForm'

/**
 * Join button texts with commas and ampersand
 * @example ['Approve', 'Repay', 'Withdraw'] -> 'Approve, Repay & Withdraw'
 * @example ['Approve', 'Repay'] -> 'Approve & Repay'
 */
const joinButtonText = (texts: string[]) =>
  texts.map((t, i) => (i ? `${i === texts.length - 1 ? ' & ' : ', '}${t}` : t)).join('')

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
    max,
    isFull,
  } = useRepayForm({
    market,
    network,
    enabled,
    onRepaid,
  })
  const { token, onToken, tokens } = useRepayTokens({ market, network })
  const selectedField = token?.field ?? 'userBorrowed'
  const selectedToken = selectedField == 'userBorrowed' ? borrowToken : collateralToken

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
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
          hasLeverage={market && hasLeverage(market)}
          market={market}
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
        token={selectedToken}
        blockchainId={network.id}
        name={selectedField}
        form={form}
        max={max[selectedField]}
        {...(selectedField === 'stateCollateral' && {
          positionBalance: { position: max.stateCollateral, tooltip: t`Current collateral in position` },
        })}
        testId={'repay-input-' + selectedField}
        network={network}
        tokenSelector={
          <TokenSelector selectedToken={token} title={t`Select Repay Token`}>
            <RepayTokenList
              market={market}
              network={network}
              stateCollateral={max.stateCollateral}
              onToken={onToken}
              tokens={tokens}
            />
          </TokenSelector>
        }
        message={
          <Balance
            prefix={t`Max:`}
            tooltip={t`Max available to repay`}
            symbol={selectedToken?.symbol}
            balance={max[selectedField].data}
            loading={max[selectedField].isLoading}
            onClick={() => {
              form.setValue(selectedField, max[selectedField].data, setValueOptions)
              void form.trigger(max[selectedField].field) // re-validate max
            }}
            buttonTestId="borrow-set-debt-to-max"
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
