import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { FormButton } from '@ui/features/forms/FormButton'
import { poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { CreatePoolSummaryProps } from './types'

const { Spacing } = SizesAndSpaces

export const CreatePoolSummary = ({
  form: { values },
  creationFee,
  nativeSymbol,
  poolTypes,
  poolListUrl,
  wallet,
  isPending,
  isLoading,
  isDisabled,
  created,
  isFunded,
  isDepositing,
}: CreatePoolSummaryProps) => (
  <Card size="small">
    <CardHeader title={t`Pool summary`} />
    <CardContent>
      <Stack sx={{ gap: Spacing.sm }}>
        <ActionInfo
          size="small"
          label={t`Type`}
          value={poolTypes.find(type => type.id === values.poolType)?.label ?? UNAVAILABLE_NOTATION}
        />
        <ActionInfo size="small" label={t`Name`} value={values.poolName || UNAVAILABLE_NOTATION} />
        <ActionInfo size="small" label={t`LP symbol`} value={values.symbol || UNAVAILABLE_NOTATION} />
        <Divider />
        {values.tokens.map((token, index) => (
          <ActionInfo
            size="small"
            key={poolAmountField(index)}
            label={`${t`Token`} ${index + 1}`}
            value={token?.symbol ?? UNAVAILABLE_NOTATION}
          />
        ))}
        <Divider />
        {poolTypes
          .find(type => type.id === values.poolType)
          ?.parameters.filter(parameter => !parameter.advanced)
          .map(({ name, label, format }) => (
            <ActionInfo key={name} size="small" label={label} value={formatNumber(values[name], format)} />
          ))}
        <Divider />
        {values.addLiquidity ? (
          values.tokens.map((token, index) => (
            <ActionInfo
              size="small"
              key={poolAmountField(index)}
              label={token?.symbol ?? `${t`Token`} ${index + 1}`}
              value={formatNumber(values[poolAmountField(index)], 'token.amount')}
            />
          ))
        ) : (
          <ActionInfo size="small" label={t`Initial liquidity`} value={t`Add later`} />
        )}
        {!created && (
          <ActionInfo
            size="small"
            label={t`Estimated deployment fee`}
            value={mapQuery(creationFee, fee => `${formatNumber(fee, 'token.amount')} ${nativeSymbol}`)}
          />
        )}
        {created && (
          <>
            <Alert severity="success">
              {t`Pool deployed`}.{' '}
              <Link href={created.explorerUrl} target="_blank" rel="noreferrer">{t`View on explorer`}</Link>
            </Alert>
            {isDepositing && (
              <Alert severity="info">{t`Confirm the initial liquidity transaction in your wallet.`}</Alert>
            )}
            {isFunded && <Alert severity="success">{t`Initial liquidity added`}</Alert>}
          </>
        )}
        {!isFunded && (
          <FormButton
            {...wallet}
            pending={isPending}
            loading={isLoading}
            disabled={isDisabled}
            label={created ? t`Add initial liquidity` : t`Deploy pool`}
            fullWidth
          />
        )}
        {created && <RouterLink href={poolListUrl}>{t`Back to pools`}</RouterLink>}
      </Stack>
    </CardContent>
  </Card>
)
