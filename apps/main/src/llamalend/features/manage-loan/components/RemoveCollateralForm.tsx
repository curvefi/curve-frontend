import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RemoveCollateralOptions } from '@/llamalend/mutations/remove-collateral.mutation'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import { LoanFormWrapper } from '@/llamalend/widgets/manage-loan/LoanFormWrapper'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Balance } from '@ui-kit/shared/ui/Balance'
import { InputDivider } from '../../../widgets/InputDivider'
import { setValueOptions } from '../../borrow/react-form.utils'
import { useRemoveCollateralForm } from '../hooks/useRemoveCollateralForm'

export const RemoveCollateralForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRemoved,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRemoved?: NonNullable<RemoveCollateralOptions['onRemoved']>
}) => {
  const network = networks[chainId]
  const [isOpen, , , toggle] = useSwitch(false)

  const {
    form,
    isPending,
    onSubmit,
    action,
    maxRemovable,
    params,
    values,
    health,
    gas,
    formErrors,
    collateralToken,
    borrowToken,
    txHash,
    userState,
    expectedCollateral,
  } = useRemoveCollateralForm({
    market,
    network,
    networks,
    enabled,
    onRemoved,
  })

  const prevLoanToValue = useLoanToValueFromUserState({
    chainId,
    marketId: params.marketId,
    userAddress: params.userAddress,
    collateralToken,
    borrowToken,
    enabled: isOpen,
    expectedBorrowed: userState.data?.debt,
  })
  const prevHealth = useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }, undefined))
  const marketRates = useMarketRates(params, isOpen)
  const loanToValue = useLoanToValueFromUserState({
    chainId: params.chainId!,
    marketId: params.marketId,
    userAddress: params.userAddress,
    collateralToken,
    borrowToken,
    enabled: !!enabled && !!values.userCollateral,
    collateralDelta:
      values.userCollateral != null
        ? (`-${values.userCollateral}` as unknown as import('@ui-kit/utils').Decimal)
        : undefined,
    expectedBorrowed: userState.data?.debt,
  })

  return (
    <LoanFormWrapper
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <LoanInfoAccordion // todo: prevRates
          isOpen={isOpen}
          toggle={toggle}
          prevHealth={prevHealth}
          health={health}
          rates={marketRates}
          prevLoanToValue={prevLoanToValue}
          loanToValue={loanToValue}
          userState={{
            ...userState,
            borrowTokenSymbol: borrowToken?.symbol,
            collateralTokenSymbol: collateralToken?.symbol,
          }}
          gas={gas}
          collateral={expectedCollateral}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        <LoanFormTokenInput
          label={t`Amount to Remove`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          max={maxRemovable}
          testId="remove-collateral-input"
          network={network}
          fromPosition={{
            tooltip: t`Collateral Balance`,
            prefix: LlamaIcon,
          }}
          message={
            <Balance
              prefix={t`Max removable:`}
              tooltip={t`Max removable`}
              symbol={collateralToken?.symbol}
              balance={maxRemovable.data}
              loading={maxRemovable.isLoading}
              onClick={() => form.setValue('userCollateral', maxRemovable.data, setValueOptions)}
            />
          }
        />
      </Stack>

      <LoanFormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['userCollateral']}
        successTitle={t`Collateral removed`}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={formErrors.length > 0}
        data-testid="remove-collateral-submit-button"
      >
        {isPending ? t`Processing...` : t`Remove collateral`}
      </Button>
    </LoanFormWrapper>
  )
}
