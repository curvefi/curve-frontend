import { noop } from 'lodash'
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
import type { MutationStatus } from '@tanstack/react-query'
import { RouterLink } from '@ui/components/RouterLink'
import { TokenIcon } from '@ui/components/TokenIcon'
import { WithWrapper } from '@ui/components/WithWrapper'
import { useIsMobileFormDrawer } from '@ui/features/form-context/FormPlacementContext'
import { ActionInfo, type ActionInfoProps } from '@ui/features/forms/action-info/ActionInfo'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import { MobileFormTabsDrawer } from '@ui/features/forms/tabs/MobileFormTabsDrawer'
import { poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { EMPTY_POOL_PARAMETERS } from './constants'
import { getCreatePoolTokens } from './create-pool.utils'
import type { CreatePoolSummaryProps } from './types'

const { Spacing } = SizesAndSpaces

const transactionStatusLabels: Record<MutationStatus, string> = {
  idle: t`Next`,
  pending: t`Pending`,
  success: t`Done`,
  error: t`Failed`,
}

const transactionStatusColors: Record<MutationStatus, ActionInfoProps['valueColor']> = {
  idle: 'textPrimary',
  pending: 'textPrimary',
  success: 'success.main',
  error: 'error',
}

const SummarySection = ({ title, children }: { title: string; children: ReactNode }) => (
  <Stack>
    <Typography variant="headingXsBold" color="textSecondary">
      {title}
    </Typography>
    <Divider />
    {children}
  </Stack>
)

const SummaryCard = ({
  form: { values },
  formId,
  creationFee,
  poolType,
  preset,
  network: { nativeCurrency },
  blockchainId,
  poolListUrl,
  totalDepositValueUsd,
  expectedLp,
  wallet,
  isPending,
  isLoading,
  isDisabled,
  created,
  isFunded,
  transactions,
}: CreatePoolSummaryProps & { formId: string }) => (
  <Card size="small">
    <CardHeader title={t`Pool summary`} />
    <CardContent>
      <Stack sx={{ gap: Spacing.sm }}>
        <SummarySection title={t`Pool`}>
          <ActionInfo size="small" label={t`Type`} value={poolType?.label ?? UNAVAILABLE_NOTATION} />
          <ActionInfo size="small" label={t`Name`} value={values.poolName || UNAVAILABLE_NOTATION} />
          <ActionInfo size="small" label={t`LP token symbol`} value={values.symbol || UNAVAILABLE_NOTATION} />
        </SummarySection>
        <SummarySection title={t`Tokens`}>
          {getCreatePoolTokens(values, values.tokenCount).map((token, index) => (
            <ActionInfo
              size="small"
              key={poolAmountField(index)}
              label={
                <Stack direction="row" sx={{ gap: Spacing.xxs, alignItems: 'center' }}>
                  {token && <TokenIcon blockchainId={blockchainId} address={token.address} size="xs" />}
                  {token?.symbol ?? `${t`Token`} ${index + 1}`}
                </Stack>
              }
              value={token ? t`Standard` /* only assetType: 0 is used for now */ : UNAVAILABLE_NOTATION}
            />
          ))}
        </SummarySection>
        <SummarySection title={t`Parameters`}>
          <ActionInfo
            size="small"
            label={t`Preset`}
            value={preset?.label ?? (poolType ? t`Custom` : UNAVAILABLE_NOTATION)}
          />
          {(poolType?.parameters ?? EMPTY_POOL_PARAMETERS).map(({ name, label, summaryLabel, format }) => (
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
                {getCreatePoolTokens(values, values.tokenCount).map((token, index) => (
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
                {!isFunded && (
                  <ActionInfo
                    size="small"
                    testId="create-pool-expected-lp"
                    label={t`LP expected`}
                    value={
                      created
                        ? mapQuery(expectedLp, value => formatNumber(value, 'token.balance'))
                        : t`Known after deployment`
                    }
                  />
                )}
                <ActionInfo
                  size="small"
                  label={t`TVL at deposit`}
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
            value={mapQuery(creationFee, fee => `${formatNumber(fee, 'token.amount')} ${nativeCurrency.symbol}`)}
          />
        )}
        {created && (
          <>
            <Alert severity="success" data-testid="create-pool-success">
              {t`Pool deployed`}.{' '}
              <Link href={created.explorerUrl} target="_blank" rel="noreferrer">{t`View on explorer`}</Link>
            </Alert>
            {isFunded && <Alert severity="success">{t`Initial liquidity added`}</Alert>}
          </>
        )}
        <Stack>
          <Typography variant="headingXsBold">{t`Transactions`}</Typography>
          <Stack aria-live="polite">
            {transactions.map(({ label, status }, index) => (
              <ActionInfo
                key={label}
                size="small"
                label={`${index + 1}. ${label}`}
                value={transactionStatusLabels[status]}
                valueColor={transactionStatusColors[status]}
              />
            ))}
          </Stack>
        </Stack>
        {!isFunded && (!created || values.addLiquidity) && (
          <FormButton
            {...wallet}
            testId="create-pool-submit"
            form={formId}
            pending={isPending}
            loading={isLoading}
            disabled={isDisabled}
            label={created ? t`Add initial liquidity` : t`Deploy pool`}
            fullWidth
          />
        )}
        {created && (
          <>
            {!isPending && !isFunded && (
              <RouterLink href={created.depositUrl} state={{ defaultTab: 'deposit' }}>
                {t`Deposit into pool`}
              </RouterLink>
            )}
            <RouterLink href={poolListUrl}>{t`Back to pools`}</RouterLink>
          </>
        )}
      </Stack>
    </CardContent>
  </Card>
)

export const CreatePoolSummary = (props: CreatePoolSummaryProps & { formId: string }) => {
  const isMobileDrawer = useIsMobileFormDrawer()
  return (
    <WithWrapper
      shouldWrap={isMobileDrawer}
      Wrapper={MobileFormTabsDrawer}
      tabs={[{ value: 'summary', label: t`Preview Pool` }]}
      onSelectTab={noop}
      omitFormButton={props.isFunded || (!!props.created && !props.form.values.addLiquidity)}
    >
      <Stack sx={{ gap: Spacing.md, minWidth: 0 }}>
        <SummaryCard {...props} />
        <FormAlerts
          error={props.error}
          formErrors={props.formErrors}
          userAddress={props.userAddress}
          handledErrors={['amplification', 'fee', 'feeMultiplier', 'priceOracleAveragingWindow', 'poolName', 'symbol']}
        />
      </Stack>
    </WithWrapper>
  )
}
