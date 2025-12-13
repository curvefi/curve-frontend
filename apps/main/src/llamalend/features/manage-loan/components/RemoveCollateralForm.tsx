import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RemoveCollateralOptions } from '@/llamalend/mutations/remove-collateral.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import { LoanFormWrapper } from '@/llamalend/widgets/manage-loan/LoanFormWrapper'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
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
  onRemoved: NonNullable<RemoveCollateralOptions['onRemoved']>
}) => {
  const network = networks[chainId]
  const [isOpen, , , toggle] = useSwitch(false)

  const {
    form,
    isPending,
    onSubmit,
    action,
    maxRemovable,
    health,
    gas,
    formErrors,
    collateralToken,
    borrowToken,
    txHash,
    userState,
    expectedCollateral,
    prevHealth,
    marketRates,
    prevLoanToValue,
    loanToValue,
  } = useRemoveCollateralForm({
    market,
    network,
    networks,
    enabled,
    onRemoved,
    isAccordionOpen: isOpen,
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
          positionBalance={{
            position: maxRemovable,
            tooltip: t`Max Removable Collateral`,
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
