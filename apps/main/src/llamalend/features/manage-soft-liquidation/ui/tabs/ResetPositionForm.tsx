import { useResetPositionForm } from '@/llamalend/features/manage-soft-liquidation/hooks/useResetPositionForm'
import { ResetPositionInfoList } from '@/llamalend/features/manage-soft-liquidation/ui/ResetPositionInfoList'
import { useMarketContext } from '@/llamalend/features/market-context'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'

const { Spacing } = SizesAndSpaces

export const ResetPositionForm = ({ networks }: { networks: NetworkDict<LlamaChainId> }) => {
  const { chainId, controllerAddress, marketType } = useMarketContext<LlamaChainId>()
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    isDisabled,
    onSubmit,
    error,
    formErrors,
    borrowToken,
    collateralToken,
    isLoading,
    isApproved,
    requiredWalletAmount,
  } = useResetPositionForm({ networks })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <ResetPositionInfoList
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          controllerAddress={controllerAddress}
          marketType={marketType}
          networks={networks}
        />
      }
    >
      <Stack sx={{ gap: Spacing.xs }}>
        <LoanFormTokenInput
          label={t`Converted collateral`}
          token={borrowToken}
          blockchainId={network.id}
          name="convertedBorrowed"
          form={form}
          message={t`Amount of converted collateral used to reset the position`}
          testId="reset-position-input-converted-borrowed"
          network={network}
          hideBalance
          disabled
        />

        <LoanFormTokenInput
          label={t`Add from wallet`}
          token={borrowToken}
          blockchainId={network.id}
          name="userBorrowed"
          form={form}
          message={t`Increase amount to push future liquidation threshold lower${requiredWalletAmount ? `\nMinimum from wallet: ${requiredWalletAmount} ${borrowToken?.symbol ?? ''}` : ''}`}
          testId="reset-position-input-user-borrowed"
          network={network}
        />
      </Stack>

      <FormButton
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={[isApproved.data === false && t`Approve`, t`Reset position`]}
        testId="reset-position-submit-button"
      />

      <FormAlerts
        error={error}
        formErrors={formErrors}
        handledErrors={['convertedBorrowed', 'userBorrowed', 'maxBorrowed', 'maxTotalBorrowed', 'minBorrowed', 'root']}
      />
    </Form>
  )
}
