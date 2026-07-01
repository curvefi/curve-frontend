import { type FunctionComponent, ReactNode, useMemo } from 'react'
import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import Button from '@mui/material/Button'
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader'
import Grid, { type GridProps } from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { constQ } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, borderStyle } from '@ui-kit/utils'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'
import { LineGraphCell, RateTooltipProps } from './cells'
import { BorrowRateTooltip } from './cells/RateCell/BorrowRateTooltip'
import { RewardsIcons } from './cells/RateCell/RewardsIcons'
import { SupplyRateLendTooltip } from './cells/RateCell/SupplyRateLendTooltip'
import { FavoriteMarketButton } from './chips/FavoriteMarketButton'

const { Spacing } = SizesAndSpaces

const EXPANDED_DETAILS_METRIC_CATEGORY = 'llamalend.marketListExpandedDetails'
const POSITION_METRIC_CATEGORY = 'llamalend.marketListPosition'

const ratesConfig: Record<
  MarketRateType,
  {
    tooltipComponent: FunctionComponent<RateTooltipProps>
    title: string
    rateKey: keyof LlamaMarket['rates']
  }
> = {
  [MarketRateType.Supply]: {
    tooltipComponent: SupplyRateLendTooltip,
    title: NET_SUPPLY_RATE_TITLE,
    rateKey: 'lendTotalApyMinBoosted',
  },
  [MarketRateType.Borrow]: {
    tooltipComponent: BorrowRateTooltip,
    title: t`Borrow APR`,
    rateKey: 'borrowApr',
  },
}

function useMobileGraphSize() {
  const pageWidth = useLayoutStore(state => state.windowWidth)
  const isTiny = useIsTiny()
  return useMemo(() => ({ width: pageWidth ? pageWidth - (isTiny ? 20 : 40) : 300, height: 48 }), [pageWidth, isTiny])
}

const RateItem = ({ market, type }: { market: LlamaMarket; type: MarketRateType }) => {
  const { tooltipComponent: Tooltip, title, rateKey } = ratesConfig[type]
  const rateValue = market.rates[rateKey] as number
  return (
    rateValue != null && (
      <Grid size={6}>
        <Tooltip market={market}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
            {/* todo: omit metric component tooltip */}
            <Metric
              category="llamalend.marketListRates"
              label={title}
              value={constQ(rateValue)}
              valueOptions={{ unit: 'percentage' }}
              leadingIcon={<RewardsIcons market={market} rateType={type} />}
            />
          </Stack>
        </Tooltip>
      </Grid>
    )
  )
}

const GridSection = ({ children }: { children: ReactNode }) => (
  <Grid container spacing={Spacing.md} sx={{ paddingInline: Spacing.md }}>
    {children}
  </Grid>
)

const GridHeader = ({ ...props }: Omit<CardHeaderProps, 'sx'>) => (
  <Grid size={12}>
    <CardHeader {...props} sx={{ borderBottom: borderStyle }} />
  </Grid>
)

const GridMetric = ({ size = 12, ...metricProps }: MetricProps & { size?: GridProps['size'] }) => (
  <Grid size={size}>
    <Metric {...metricProps} />
  </Grid>
)

const LinkButton = ({ children, href, testId }: { children: ReactNode; href: string; testId: string }) => (
  <Button sx={{ flex: 1 }} component={Link} href={href} data-testid={testId}>
    {children}
  </Button>
)

export const LlamaMarketExpandedPanel = ({
  row: { original: market },
  isUserPositionTable = false,
}: Parameters<ExpandedPanel<LlamaMarket>>[0] & {
  isUserPositionTable?: boolean
}) => {
  const {
    controllerAddress,
    favoriteKey,
    assets,
    leverage,
    liquidityUsd,
    url,
    userHasPositions,
    lendingPosition,
    utilizationPercent,
    tvl,
    totalCollateralUsd,
    totalDebtUsd,
    type,
  } = market
  const graphSize = useMobileGraphSize()

  return (
    <>
      <GridSection>
        <GridHeader
          title={t`Market Details`}
          action={
            <Stack direction="row" sx={{ gap: Spacing.sm }}>
              <CopyIconButton
                label={t`Copy market address`}
                copyText={controllerAddress}
                confirmationText={t`Market address copied`}
                data-testid={`copy-market-address-${controllerAddress}`}
              />
              <FavoriteMarketButton address={favoriteKey} />
            </Stack>
          }
        />
        <RateItem market={market} type={MarketRateType.Borrow} />
        <RateItem market={market} type={MarketRateType.Supply} />
        <Grid size={12} data-testid="llama-market-graph">
          <Stack direction="column" sx={{ alignItems: 'center' }}>
            <Typography variant="bodyXsRegular" color="textTertiary" sx={{ alignSelf: 'start' }}>
              {t`${AVERAGE_CATEGORIES['llamalend.marketList.rate'].period} Rate Chart`}
            </Typography>

            <LineGraphCell market={market} type={MarketRateType.Borrow} graphSize={graphSize} />
          </Stack>
        </Grid>
        {leverage && (
          <GridMetric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={t`Leverage 🔥`}
            value={constQ(leverage)}
            valueOptions={{ unit: 'multiplier' }}
          />
        )}
        <GridMetric
          category={EXPANDED_DETAILS_METRIC_CATEGORY}
          label={t`Utilization`}
          value={constQ(utilizationPercent)}
          valueOptions={{ unit: 'percentage' }}
          testId="metric-utilizationPercent"
        />
        <GridMetric
          category={EXPANDED_DETAILS_METRIC_CATEGORY}
          label={t`Available Liquidity`}
          value={constQ(liquidityUsd)}
          valueOptions={{ unit: 'dollar' }}
        />
        <GridMetric
          category={EXPANDED_DETAILS_METRIC_CATEGORY}
          label={t`Total Debt`}
          value={constQ(totalDebtUsd)}
          valueOptions={{ unit: 'dollar' }}
        />
        <GridMetric
          category={EXPANDED_DETAILS_METRIC_CATEGORY}
          label={t`Total Collateral`}
          value={constQ(totalCollateralUsd)}
          valueOptions={{ unit: 'dollar' }}
        />
        <GridMetric
          category={EXPANDED_DETAILS_METRIC_CATEGORY}
          label={t`TVL`}
          value={constQ(tvl)}
          valueOptions={{ unit: 'dollar' }}
        />
      </GridSection>
      {/* TODO: implement borrow position metrics after backend endpoint is ready */}
      {/* {userHasPositions?.Borrow && (
        <GridSection>
          <GridHeader title={t`Borrow details`} />
        </GridSection>
      )} */}
      {lendingPosition && (
        <GridSection>
          <GridHeader title={t`Lending details`} />
          {lendingPosition && (
            <GridMetric
              category={POSITION_METRIC_CATEGORY}
              label={t`Earnings`}
              value={constQ(lendingPosition.earnings)}
              valueOptions={{ unit: 'dollar' }}
            />
          )}
          {lendingPosition && (
            <GridMetric
              category={POSITION_METRIC_CATEGORY}
              label={t`Supplied Amount`}
              value={constQ(lendingPosition.supplied)}
              valueOptions={{ unit: { symbol: assets.borrowed.symbol, position: 'suffix' } }}
            />
          )}
        </GridSection>
      )}
      {isUserPositionTable ? (
        <LinkButton
          href={url} // the url is already build for borrow/supply in the UserPositionsMarketRateTable
          testId="llama-market-go-to-position"
        >
          {t`Manage position`}
        </LinkButton>
      ) : (
        <Stack direction="row" sx={{ gap: Spacing.xs }}>
          {type === LlamaMarketType.Lend && (
            <LinkButton href={url + LEND_MARKET_ROUTES.PAGE_VAULT} testId="llama-market-go-to-vault">
              {t`Earn`}
            </LinkButton>
          )}
          <LinkButton href={url} testId="llama-market-go-to-borrow">
            {t`Borrow`}
          </LinkButton>
        </Stack>
      )}
    </>
  )
}
