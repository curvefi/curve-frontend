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
import { mapQuery } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useRepayForm } from '../hooks/useRepayForm'

/**
 * Join button texts with commas and ampersand
 * @example ['Approve', 'Repay', 'Withdraw'] -> 'Approve, Repay & Withdraw'
 * @example ['Approve', 'Repay'] -> 'Approve & Repay'
 */
const joinButtonText = (texts: string[]) =>
  texts.map((t, i) => (i ? `${i === texts.length - 1 ? ' & ' : ', '}${t}` : t)).join('')

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
  const { token, onToken, tokens } = useRepayTokens({ market, network })
  const selectedField = token?.field ?? 'userBorrowed'

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
          <TokenSelector selectedToken={token} title={t`Select Repay Token`}>
            <RepayTokenList
              market={market}
              network={network}
              positionCollateral={stateCollateralMax.data}
              onToken={onToken}
              tokens={tokens}
            />
          </TokenSelector>
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
