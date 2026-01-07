import { RepayLoanInfoAccordion } from '@/llamalend/features/borrow/components/RepayLoanInfoAccordion'
import { setValueOptions } from '@/llamalend/features/borrow/react-form.utils'
import { canRepayFromStateCollateral, canRepayFromUserCollateral, hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useRepayForm } from '../hooks/useRepayForm'

const { Spacing } = SizesAndSpaces

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
  fromPosition,
  fromWallet,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRepaid?: RepayOptions['onRepaid']
  fromPosition?: boolean
  fromWallet?: boolean
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
  const { withdrawEnabled: withdrawEnabled } = values
  const stateCollateralMax = mapQuery(userState, (data) => data.collateral)
  const showStateCollateral = fromPosition && market && canRepayFromStateCollateral(market)
  const showUserCollateral = market && canRepayFromUserCollateral(market) && fromWallet
  const showUserBorrowed = fromWallet
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
      <Stack gap={Spacing.sm}>
        {fromPosition &&
          (showStateCollateral ? (
            <LoanFormTokenInput
              label={t`From collateral (position)`}
              token={collateralToken}
              blockchainId={network.id}
              name="stateCollateral"
              form={form}
              max={{ ...stateCollateralMax, fieldName: 'maxStateCollateral' }}
              testId="repay-state-collateral-input"
              network={network}
              positionBalance={
                userState.data && {
                  position: stateCollateralMax,
                  tooltip: t`Current collateral in position`,
                }
              }
            />
          ) : (
            t`This market does not support repaying from collateral.`
          ))}
        {fromWallet &&
          (showUserCollateral ? (
            <LoanFormTokenInput
              label={t`From collateral (wallet)`}
              token={collateralToken}
              blockchainId={network.id}
              name="userCollateral"
              form={form}
              testId="repay-user-collateral-input"
              network={network}
            />
          ) : (
            showStateCollateral || t`This market does not support repaying from wallet collateral.`
          ))}
        {fromWallet &&
          (showUserBorrowed ? (
            <LoanFormTokenInput
              label={t`From borrowed token (wallet)`}
              token={borrowToken}
              blockchainId={network.id}
              name="userBorrowed"
              form={form}
              testId="repay-user-borrowed-input"
              network={network}
            />
          ) : (
            t`This market does not support repaying from borrowed token.`
          ))}
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            checked={withdrawEnabled}
            onChange={(e) => form.setValue('withdrawEnabled', e.target.checked, setValueOptions)}
          />
        }
        label={t`Repay & Withdraw`}
      />
      <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
        {isPending
          ? t`Processing...`
          : joinButtonText(
              notFalsy(
                !isApproved?.data && t`Approve`,
                isFull.data ? t`Repay full` : t`Repay`,
                withdrawEnabled && t`Withdraw`,
              ),
            )}
      </Button>

      <LoanFormAlerts
        isSuccess={isRepaid}
        error={repayError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={notFalsy(
          showStateCollateral && 'stateCollateral',
          showStateCollateral && 'maxStateCollateral',
          showUserCollateral && 'userCollateral',
          showUserBorrowed && 'userBorrowed',
        )}
        successTitle={t`Loan repaid`}
      />
    </Form>
  )
}
