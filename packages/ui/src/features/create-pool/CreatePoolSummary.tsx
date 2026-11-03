import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { TokenIcon } from '@ui/components/TokenIcon'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { FormButton } from '@ui/features/forms/FormButton'
import { poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { EMPTY_POOL_PARAMETERS } from './constants'
import type { CreatePoolSummaryProps } from './types'

const { Spacing } = SizesAndSpaces

const SummarySection = ({ title, children }: { title: string; children: ReactNode }) => (
  <Stack>
    <Typography variant="headingXsBold" color="textSecondary">
      {title}
    </Typography>
    <Divider />
    {children}
  </Stack>
)

export const CreatePoolSummary = ({
  form: { values },
  creationFee,
  nativeSymbol,
  poolTypes,
  blockchainId,
  totalDepositValueUsd,
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
        <SummarySection title={t`Pool`}>
          <ActionInfo
            size="small"
            label={t`Type`}
            value={poolTypes.find(type => type.id === values.poolType)?.label ?? UNAVAILABLE_NOTATION}
          />
          <ActionInfo size="small" label={t`Name`} value={values.poolName || UNAVAILABLE_NOTATION} />
        </SummarySection>
        <SummarySection title={t`Tokens`}>
          {values.tokens.map((token, index) => (
            <ActionInfo
              size="small"
              key={poolAmountField(index)}
              label={
                <Stack direction="row" sx={{ gap: Spacing.xxs, alignItems: 'center' }}>
                  {token && <TokenIcon blockchainId={blockchainId} address={token.address} size="xs" />}
                  {token?.symbol ?? `${t`Token`} ${index + 1}`}
                </Stack>
              }
              value={token ? t`Standard` : UNAVAILABLE_NOTATION}
            />
          ))}
        </SummarySection>
        <SummarySection title={t`Parameters`}>
          {(poolTypes.find(type => type.id === values.poolType)?.parameters ?? EMPTY_POOL_PARAMETERS)
            .filter(parameter => !parameter.advanced || parameter.showInSummary)
            .map(({ name, label, summaryLabel, format }) => (
              <ActionInfo
                key={name}
                size="small"
                label={summaryLabel ?? label}
                value={values.poolType ? formatNumber(values[name], format) : UNAVAILABLE_NOTATION}
              />
            ))}
        </SummarySection>
        <SummarySection title={t`Initial liquidity`}>
          {values.poolType ? (
            values.addLiquidity ? (
              <>
                {values.tokens.map((token, index) => (
                  <ActionInfo
                    size="small"
                    key={poolAmountField(index)}
                    label={token?.symbol ?? `${t`Token`} ${index + 1}`}
                    value={
                      values[poolAmountField(index)]
                        ? formatNumber(values[poolAmountField(index)], 'token.amount')
                        : t`Not set`
                    }
                  />
                ))}
                <ActionInfo
                  size="small"
                  label={t`Value`}
                  value={mapQuery(totalDepositValueUsd, value => formatNumber(value, 'usd.amount'))}
                />
              </>
            ) : (
              <ActionInfo size="small" label={t`Amounts`} value={t`Add later`} />
            )
          ) : (
            <ActionInfo size="small" label={t`Amounts`} value={UNAVAILABLE_NOTATION} />
          )}
        </SummarySection>
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
