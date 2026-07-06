import { useEffect } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { RepayLoanInfoList } from '@/llamalend/features/borrow/components/RepayLoanInfoList'
import { RepayTokenList, type RepayTokenListProps } from '@/llamalend/features/manage-loan/components/RepayTokenList'
import { RepayTokenOption, useRepayTokens } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { AlertRepayDebtToIncreaseHealth } from '@/llamalend/features/manage-soft-liquidation/ui/alerts/AlertRepayDebtToIncreaseHealth'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { hasLeverageValue } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { isRepayLeveraged } from '@/llamalend/queries/repay/repay-query.helpers'
import { useUserPrices } from '@/llamalend/queries/user'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { FormButton } from '@ui-kit/features/forms'
import { TokenSelector } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { q, type QueryProp, type Range } from '@ui-kit/types/util'
import { CRVUSD } from '@ui-kit/utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { shouldBlockTransaction } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { useCrvSwapUrl } from '../../manage-soft-liquidation/hooks/useCrvSwapUrl'
import { useMarketContext } from '../../market-context'
import { useRepayForm } from '../hooks/useRepayForm'
import { useTokenAmountConversion } from '../hooks/useTokenAmountConversion'

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
      size="small"
    >
      <RepayTokenList {...props} />
    </TokenSelector>
  )
}

// todo: net borrow APR (includes the intrinsic yield + rewards, while the Borrow APR doesn't)
export const RepayForm = <ChainId extends IChainId>({
  networks,
  onPricesUpdated,
  collateralEvents,
  isInSoftLiquidation,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
  isInSoftLiquidation?: boolean
}) => {
  const { chainId, controllerAddress, market, tokens: marketTokens, marketType } = useMarketContext<ChainId>()
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    isLoading,
    isDisabled,
    onSubmit,
    borrowToken,
    collateralToken,
    repayError,
    isApproved,
    routes,
    formErrors,
    max,
    isFull,
    priceImpact,
  } = useRepayForm({
    networks,
    onPricesUpdated,
  })
  const { token, onToken, tokens } = useRepayTokens({
    tokens: marketTokens,
    networkId: network.id,
    collateralEvents,
  })

  const selectedField = token?.field ?? 'userBorrowed'
  const selectedToken = selectedField == 'userBorrowed' ? borrowToken : collateralToken

  const fromPosition = isFull.data === false && selectedField === 'stateCollateral'
  const showLeverage = selectedToken !== borrowToken && hasLeverageValue(market)
  const { update: updateForm, formState } = form
  const isSelectedDirty = formState.dirtyFields[selectedField]

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

  const crvSwapUrl = useCrvSwapUrl()

  useEffect(
    () => () => {
      // Reset when selectedField changes and the field is dirty (unmounting the field)
      if (isSelectedDirty) updateForm({ [selectedField]: undefined })
    },
    [isSelectedDirty, selectedField, updateForm],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <RepayLoanInfoList
          controllerAddress={controllerAddress}
          marketType={marketType}
          form={form}
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={value => updateForm({ slippage: value })}
          showLeverage={showLeverage}
          routes={routes}
          prices={q(useRepayPrices(params, !isInSoftLiquidation))} // when in soft liquidation, the prices do not change
          prevPrices={q(useUserPrices(params))}
          priceImpact={priceImpact}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Debt to repay`}
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
          <RepayTokenSelector
            token={token}
            marketTokens={marketTokens}
            network={network}
            stateCollateral={max.stateCollateral}
            onToken={onToken}
            tokens={tokens}
          />
        }
        maxMessage={
          maxAmountInBorrowTokenError?.message ?? (
            <Balance
              inline
              prefix={maxAmountPrefix}
              tooltip={t`Max available to repay`}
              symbol={borrowToken?.symbol}
              balance={maxAmountInBorrowToken}
              loading={max[selectedField].isLoading || maxAmountInBorrowTokenLoading}
              onClick={() => updateForm({ [selectedField]: max[selectedField].data })}
            />
          )
        }
      />
      <HighPriceImpactAlert priceImpact={priceImpact} values={values} max={q(max.expected)} slippageType={LEVERAGE} />
      {isInSoftLiquidation && <AlertRepayDebtToIncreaseHealth />}
      <FormButton
        pending={isPending}
        loading={isLoading}
        disabled={
          isDisabled ||
          shouldBlockTransaction(priceImpact, {
            ...values,
            leverageEnabled: isRepayLeveraged(values),
            slippageType: LEVERAGE,
          })
        }
        label={[
          isApproved.data === false && t`Approve`,
          notFalsy(t`Repay`, fromPosition && t`from Position`).join(' '),
          isFull.data ? t`Close Position` : isInSoftLiquidation && t`Increase Health`,
        ]}
        testId="repay-submit-button"
      />
      {isInSoftLiquidation && selectedToken?.symbol === CRVUSD.symbol && (
        <ExternalLink href={crvSwapUrl} label={t`Get crvUSD`} />
      )}
      <FormAlerts
        error={repayError}
        formErrors={formErrors}
        handledErrors={notFalsy(selectedField, max[selectedField]?.fieldName)}
      />
    </Form>
  )
}
