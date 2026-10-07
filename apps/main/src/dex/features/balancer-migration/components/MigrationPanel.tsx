import { useMemo, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { SelectableCard } from '@ui/components/SelectableCard'
import { SelectableChip } from '@ui/components/SelectableChip'
import { TokenIcons } from '@ui/components/TokenIcons'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { BalancerPosition } from '../api/balancer.api'
import { type CurveTarget, getCurveLpPriceUsd } from '../migration.utils'
import { useMigrateMutation } from '../mutations/migrate.mutation'
import { useMigrationQuote } from '../queries/migration-quote.query'

const { Spacing } = SizesAndSpaces

/** Balancer pool tokens and Curve LP tokens both use 18 decimals. */
const LP_DECIMALS = 18
const PERCENTAGES = [25, 50, 75, 100] as const
const SLIPPAGES_BPS = [10, 50, 100] as const

type MigrationPanelProps = {
  chainId: number
  blockchainId: string
  userAddress: Address
  position: BalancerPosition
  targets: CurveTarget[]
}

const parseBpt = (balance: string) => {
  try {
    return parseUnits(balance, LP_DECIMALS)
  } catch {
    return 0n
  }
}

export const MigrationPanel = ({ chainId, blockchainId, userAddress, position, targets }: MigrationPanelProps) => {
  const [targetAddress, setTargetAddress] = useState(targets[0]?.pool.address)
  const [percentage, setPercentage] = useState<number>(100)
  const [slippageBps, setSlippageBps] = useState<number>(50)

  const target = targets.find(({ pool }) => pool.address === targetAddress) ?? targets[0]
  const walletBpt = parseBpt(position.userBalance.walletBalance)
  const amountIn = (walletBpt * BigInt(percentage)) / 100n
  const amountInUsd = (position.userBalance.walletBalanceUsd * percentage) / 100

  const quote = useMigrationQuote(
    {
      chainId,
      userAddress,
      tokenIn: position.address,
      tokenOut: target?.pool.lpTokenAddress,
      amountIn: amountIn.toString(),
      slippageBps,
    },
    !!target,
  )
  const { onSubmit, error, isPending } = useMigrateMutation({ chainId, userAddress, onReset: () => setPercentage(100) })

  const preview = useMemo(() => {
    if (!quote.data || !target) return null
    const lpOut = Number(formatUnits(BigInt(quote.data.amountOut), LP_DECIMALS))
    const valueOutUsd = maybe(getCurveLpPriceUsd(target.pool), price => lpOut * price)
    return {
      lpOut,
      minLpOut: Number(formatUnits(BigInt(quote.data.minAmountOut), LP_DECIMALS)),
      valueOutUsd,
      valueChangePct: valueOutUsd == null || !amountInUsd ? null : ((valueOutUsd - amountInUsd) / amountInUsd) * 100,
    }
  }, [quote.data, target, amountInUsd])

  const quoteValue = <T,>(data: T) => q({ data, isLoading: quote.isLoading, error: quote.error })
  const stakedBpt = position.userBalance.stakedBalances.filter(({ balance }) => Number(balance) > 0)

  return (
    <Card>
      <CardHeader title={t`Migrate ${position.name}`} />
      <CardContent>
        <Stack sx={{ gap: Spacing.md }}>
          {stakedBpt.length > 0 && (
            <Alert variant="outlined" severity="warning">
              {t`Staked LP tokens can't be migrated from here. Unstake them first:`}{' '}
              {stakedBpt
                .map(({ balance, stakingType }) => `${formatNumber(Number(balance), 'token.compact')} (${stakingType})`)
                .join(', ')}
            </Alert>
          )}

          {walletBpt === 0n ? (
            <Alert variant="outlined" severity="info">{t`No unstaked LP tokens in your wallet for this pool.`}</Alert>
          ) : target ? (
            <>
              <Stack sx={{ gap: Spacing.xs }}>
                <Typography variant="headingXsBold">{t`Target Curve pool`}</Typography>
                {targets.map(({ pool, matchedSymbols }) => (
                  <SelectableCard
                    key={pool.address}
                    isSelected={pool.address === target.pool.address}
                    onClick={() => setTargetAddress(pool.address)}
                    sx={{ padding: Spacing.sm, justifyContent: 'space-between', display: 'flex', gap: Spacing.sm }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
                      <TokenIcons blockchainId={blockchainId} tokens={pool.coins} size="md" />
                      <Stack sx={{ alignItems: 'start' }}>
                        <Typography variant="bodyMBold">{pool.name}</Typography>
                        <Typography variant="bodyXsRegular" color="textSecondary">
                          {t`Shares ${matchedSymbols.join(', ')}`}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="bodySRegular">
                      {t`TVL`} {formatNumber(pool.tvlUsd, 'usd.notional')}
                    </Typography>
                  </SelectableCard>
                ))}
              </Stack>

              <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="bodySRegular" color="textSecondary">{t`Amount`}</Typography>
                {PERCENTAGES.map(p => (
                  <SelectableChip key={p} label={`${p}%`} selected={percentage === p} toggle={() => setPercentage(p)} />
                ))}
                <Typography variant="bodySRegular" color="textSecondary" sx={{ marginInlineStart: Spacing.md }}>
                  {t`Slippage`}
                </Typography>
                {SLIPPAGES_BPS.map(bps => (
                  <SelectableChip
                    key={bps}
                    label={`${bps / 100}%`}
                    selected={slippageBps === bps}
                    toggle={() => setSlippageBps(bps)}
                  />
                ))}
              </Stack>

              <Stack>
                <ActionInfo
                  label={t`You withdraw`}
                  value={`${formatNumber(Number(formatUnits(amountIn, LP_DECIMALS)), 'token.compact')} ${position.symbol}`}
                  valueRight={formatNumber(amountInUsd, 'usd.amount')}
                />
                <ActionInfo
                  label={t`You receive (estimated)`}
                  value={quoteValue(
                    preview && `${formatNumber(preview.lpOut, 'token.compact')} ${target.pool.lpTokenSymbol}`,
                  )}
                  valueRight={preview && formatNumber(preview.valueOutUsd, 'usd.amount')}
                />
                <ActionInfo
                  label={t`Minimum received`}
                  value={quoteValue(
                    preview && `${formatNumber(preview.minLpOut, 'token.compact')} ${target.pool.lpTokenSymbol}`,
                  )}
                />
                <ActionInfo
                  label={t`Estimated value change`}
                  labelTooltip={{
                    title: t`Curve LP value from the Prices API TVL and LP supply, versus Balancer's USD value.`,
                  }}
                  value={quoteValue(preview && formatNumber(preview.valueChangePct, 'percent.value'))}
                />
                <ActionInfo
                  label={t`Price impact`}
                  value={quoteValue(
                    quote.data && formatNumber(quote.data.priceImpact && quote.data.priceImpact / 100, 'percent.value'),
                  )}
                />
                <ActionInfo
                  label={t`Route`}
                  value={quoteValue(
                    quote.data?.route.map(({ action, protocol }) => `${action} (${protocol})`).join(', '),
                  )}
                />
              </Stack>

              {quote.error && (
                <Alert variant="outlined" severity="error">
                  {t`No migration route found:`} {quote.error.message}
                </Alert>
              )}
              {error && (
                <Alert variant="outlined" severity="error">
                  {error.message}
                </Alert>
              )}

              <Button
                size="large"
                disabled={!quote.data || amountIn === 0n}
                loading={isPending}
                onClick={() =>
                  onSubmit({
                    chainId,
                    tokenIn: position.address,
                    tokenOut: target.pool.lpTokenAddress,
                    amountIn: amountIn.toString(),
                    slippageBps,
                    label: position.name,
                  })
                }
              >
                {t`Approve and migrate`}
              </Button>
            </>
          ) : (
            <Alert variant="outlined" severity="info">
              {t`No Curve pool on this network shares tokens with this Balancer pool.`}
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
