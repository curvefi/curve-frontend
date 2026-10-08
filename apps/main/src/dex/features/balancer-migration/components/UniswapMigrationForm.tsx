import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { useUniswapMigrationForm } from '../hooks/useUniswapMigrationForm'
import type { UniswapPositionRow } from '../hooks/useUniswapPositionRows'
import type { CurveTarget } from '../migration.utils'
import { CurveTargetFields } from './CurveTargetFields'
import { MigrationActionInfoList } from './MigrationActionInfoList'
import { PoolTokensLabel } from './PoolTokensLabel'

const { Spacing, LargeTokenInput } = SizesAndSpaces

/** Read-only, in the large input's style: the whole position moves, and the migration collects its fees. */
const UniswapPositionSummary = ({ blockchainId, position }: { blockchainId: string; position: UniswapPositionRow }) => (
  <Stack
    sx={{
      gap: LargeTokenInput.RowGap,
      padding: LargeTokenInput.PaddingX,
      backgroundColor: t => t.design.Inputs.Large.Default.Fill,
    }}
  >
    <Typography variant="bodyXsRegular" sx={{ color: t => t.design.Inputs.Text.Label }}>
      {t`Uniswap position to migrate`}
    </Typography>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm }}>
      <Typography variant="headingMBold">{formatNumber(position.totalUsd, 'usd.amount')}</Typography>
      <PoolTokensLabel protocol="uniswap" blockchainId={blockchainId} tokens={position.tokens} label={position.name} />
    </Stack>
    {position.tokens.map(({ symbol }, i) => (
      <ActionInfo
        key={symbol}
        label={symbol}
        value={formatNumber(+position.amounts[i] + +position.fees[i], 'token.amount')}
        size="small"
      />
    ))}
  </Stack>
)

export type UniswapMigrationFormProps = {
  chainId: number
  userAddress: Address
  blockchainId: string
  position: UniswapPositionRow
  target: CurveTarget | undefined
}

export const UniswapMigrationForm = ({
  chainId,
  userAddress,
  blockchainId,
  position,
  target,
}: UniswapMigrationFormProps) => {
  const {
    form,
    values,
    route,
    expectedLp,
    priceImpact,
    gas,
    isApproved,
    onSubmit,
    isPending,
    isDisabled,
    error,
    formErrors,
  } = useUniswapMigrationForm({ chainId, userAddress, position, target })
  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <MigrationActionInfoList
          quote={route}
          priceImpact={mapQuery(priceImpact, ({ priceImpact }) => priceImpact ?? null)}
          gas={gas}
          slippage={values.slippage}
          onSlippageChange={slippage => form.update({ slippage })}
          userAddress={userAddress}
        />
      }
    >
      <Stack sx={{ gap: Spacing.sm }}>
        <UniswapPositionSummary blockchainId={blockchainId} position={position} />
        <CurveTargetFields
          blockchainId={blockchainId}
          target={target}
          expectedLp={expectedLp}
          stake={values.stake}
          onStakeChange={stake => form.update({ stake })}
        />
      </Stack>

      <EvmFormButton
        pending={isPending}
        disabled={isDisabled}
        label={[isApproved.data === false && t`Approve`, t`Migrate`]}
        testId="uniswap-migration-submit"
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={[]} userAddress={userAddress} />
    </Form>
  )
}
