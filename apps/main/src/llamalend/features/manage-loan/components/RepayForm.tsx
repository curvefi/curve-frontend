import { useEffect } from 'react'
import { RepayLoanInfoList } from '@/llamalend/features/borrow/components/RepayLoanInfoList'
import { RepayTokenList, type RepayTokenListProps } from '@/llamalend/features/manage-loan/components/RepayTokenList'
import { RepayTokenOption, useRepayTokens } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { AlertRepayDebtToIncreaseHealth } from '@/llamalend/features/manage-soft-liquidation/ui/alerts/AlertRepayDebtToIncreaseHealth'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { hasLeverageValue } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { useUserPrices } from '@/llamalend/queries/user'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { joinButtonText } from '@primitives/string.utils'
import { TokenSelector } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q, type QueryProp, type Range } from '@ui-kit/types/util'
import { CRVUSD } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useCrvSwapUrl } from '../../manage-soft-liquidation/hooks/useCrvSwapUrl'
import { useRepayForm } from '../hooks/useRepayForm'
import { useTokenAmountConversion } from '../hooks/useTokenAmountConversion'

const { Spacing } = SizesAndSpaces

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
  onPricesUpdated,
  collateralEvents,
  isInSoftLiquidation,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
  isInSoftLiquidation?: boolean
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
    repayError,
    isApproved,
    routes,
    formErrors,
    max,
    isFull,
    priceImpact,
  } = useRepayForm({ market, network, enabled, onPricesUpdated })
  const { token, onToken, tokens } = useRepayTokens({ market, networkId: network.id, collateralEvents })

  const selectedField = token?.field ?? 'userBorrowed'
  const selectedToken = selectedField == 'userBorrowed' ? borrowToken : collateralToken
  const fromPosition = isFull.data === false && selectedField === 'stateCollateral'
  const showLeverage = selectedToken !== borrowToken && !!market && hasLeverageValue(market)
  const {
    getValues,
    setValue,
    trigger,
    formState: { dirtyFields },
  } = form

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
      if (selectedField in dirtyFields) {
        updateForm({ getValues, setValue, trigger }, { [selectedField]: undefined }, { automated: true })
      }
    },
    [dirtyFields, getValues, selectedField, setValue, trigger],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <RepayLoanInfoList
          market={market}
          form={form}
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={value => updateForm(form, { slippage: value })}
          showLeverage={showLeverage}
          routes={routes}
          prices={q(useRepayPrices(params, !isInSoftLiquidation))} // when in soft liquidation, the prices do not change
          prevPrices={q(useUserPrices(params))}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Debt to repay`}
        token={selectedToken}
        blockchainId={network.id}
        name={selectedField}
        form={form}
        max={q(max[selectedField])}
        {...(selectedField === 'stateCollateral' && {
          positionBalance: { position: max.stateCollateral, tooltip: t`Current collateral in position` },
        })}
        testId={'repay-input-' + selectedField}
        network={network}
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
              inline
              prefix={maxAmountPrefix}
              tooltip={t`Max available to repay`}
              symbol={borrowToken?.symbol}
              balance={maxAmountInBorrowToken}
              loading={max[selectedField].isLoading || maxAmountInBorrowTokenLoading}
              onClick={() =>
                updateForm(form, {
                  [selectedField]: max[selectedField].data,
                })
              }
            />
          )
        }
      />
      <HighPriceImpactAlert priceImpact={priceImpact} values={values} max={q(max.expected)} />

      {isInSoftLiquidation && <AlertRepayDebtToIncreaseHealth />}

      <Stack gap={Spacing.xs}>
        <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
          {isPending
            ? t`Processing...`
            : joinButtonText(
                isApproved.data === false && t`Approve`,
                notFalsy(t`Repay`, fromPosition && t`from Position`).join(' '),
                isFull.data ? t`Close Position` : isInSoftLiquidation && t`Increase Health`,
              )}
        </Button>

        {isInSoftLiquidation && selectedToken?.symbol === CRVUSD.symbol && (
          <ExternalLink href={crvSwapUrl} label={t`Get crvUSD`} />
        )}
      </Stack>

      <FormAlerts
        error={repayError}
        formErrors={formErrors}
        handledErrors={notFalsy(selectedField, max[selectedField]?.field)}
      />
    </Form>
  )
}
