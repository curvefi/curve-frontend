import { useClaimFeesForm } from '@/dao/components/PageVeCrv/hooks/useClaimFeesForm'
import { CLAIM_FEES_TOKENS, CLAIM_TOKEN_ADDRESSES } from '@/dao/components/PageVeCrv/queries/claim-fees.types'
import type { ChainId } from '@/dao/types/dao.types'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { recordValues } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import { FormContent } from '@ui/features/forms/components/FormContent'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimalGreaterThan, ZERO } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const FormClaimFees = ({ chainId }: { chainId: ChainId }) => {
  const { userAddress, claimables, error, isPending, claimingToken, onSubmit } = useClaimFeesForm({ chainId })

  return (
    <FormContent>
      <Stack sx={{ gap: Spacing.xs }}>
        <Typography variant="headingXsBold">{t`veCRV rewards`}</Typography>
        <Typography variant="bodySRegular" color="textSecondary">
          {t`DAO fees distributed to CRV lockers.`}
        </Typography>
      </Stack>

      {recordValues(CLAIM_FEES_TOKENS)
        .map(token => ({ token, ...claimables[token] }))
        .map(({ token, data, isLoading, error }) => (
          <Stack key={token} data-testid={`claim-fees-${token}`} sx={{ gap: Spacing.xs }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm }}>
              <Stack
                direction="row"
                sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm }}
              >
                <TokenLabel
                  blockchainId="ethereum"
                  address={CLAIM_TOKEN_ADDRESSES[token]}
                  label={token}
                  size="sm"
                  typographyVariant="bodyMRegular"
                />
                <WithSkeleton loading={isLoading}>
                  <Typography>{formatNumber(data, 'token.balance')}</Typography>
                </WithSkeleton>
              </Stack>
              <Button
                type="button"
                size="small"
                disabled={isPending || !!error || !decimalGreaterThan(data ?? ZERO, ZERO)}
                loading={isPending && claimingToken === token}
                onClick={() => onSubmit(token)}
              >
                {t`Claim`}
              </Button>
            </Stack>
            {error && (
              <Alert severity="error">
                {t`Unable to load ${token} fees.`} {getErrorMessage(error)}
              </Alert>
            )}
          </Stack>
        ))}

      <FormAlerts error={error} formErrors={[]} handledErrors={[]} userAddress={userAddress} />
    </FormContent>
  )
}
