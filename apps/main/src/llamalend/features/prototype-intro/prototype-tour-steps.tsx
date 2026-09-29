import type { DriveStep } from 'driver.js'
import { type ReactNode } from 'react'
import { PROVISIONAL_POSITION_THRESHOLDS } from '@/llamalend/features/market-position-details/position-status.utils'
import {
  BufferEquations,
  CollateralEquations,
  Equation,
  Fraction,
  HealthEquation,
  LeverageEquation,
  RangeEquations,
  RoeEquations,
} from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import { MarketAssetsType } from '@evm-ui/types/market'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsy, type Nullish } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'

/* eslint-disable react-refresh/only-export-components -- step builders for the tour driver */

export type Surface = 'list' | 'borrow' | 'supply'
export type Guide = Surface | 'positions'
type TourStep = { element: NonNullable<DriveStep['element']>; title: string; content: ReactNode }

const CATEGORY_LABEL: Record<MarketAssetsType, string> = {
  [MarketAssetsType.Correlated]: 'Correlated',
  [MarketAssetsType.BlueChip]: 'Blue-chip',
  [MarketAssetsType.LongTail]: 'Long-tail',
}
const target = (testId: string) => document.querySelector(`[data-testid="${testId}"]`)
const within = (element: Element | null, testId: string) => element?.querySelector(`[data-testid="${testId}"]`)
const targetSelector = (testId: string) => `[data-testid="${testId}"]`
const withinSelector = (parentId: string, testId: string) => `${targetSelector(parentId)} ${targetSelector(testId)}`
export const visible = (element: Element | Nullish): element is Element =>
  !!element && element.getClientRects().length > 0

const Change = ({ children }: { children: ReactNode }) => (
  <Typography component="p" variant="bodySRegular">
    {children}
  </Typography>
)

const Comparison = ({ before, after }: { before: ReactNode; after: ReactNode }) => (
  <Stack className="llamalend-tour-comparison" spacing={1}>
    <Stack sx={{ gap: '2px' }}>
      <Typography component="span" variant="bodyXsBold">{t`Before`}</Typography>
      <Change>{before}</Change>
    </Stack>
    <Stack sx={{ gap: '2px' }}>
      <Typography component="span" variant="bodyXsBold">{t`After`}</Typography>
      <Change>{after}</Change>
    </Stack>
  </Stack>
)

const MathBlock = ({ children }: { children: ReactNode }) => (
  <Stack className="llamalend-tour-math" spacing={1}>
    {children}
  </Stack>
)

const listSteps = (): TourStep[] | undefined => {
  const list = target('llamalend-markets-table')
  const apr = within(list, 'data-table-header-rates_borrow')
  const mobileSort = within(list, 'btn-drawer-sort-lamalend-markets')
  const settings = within(list, 'btn-visibility-settings')
  const maxLeverage = within(list, 'data-table-header-maxLeverage')
  const first = visible(apr) ? apr : mobileSort
  const optional = visible(settings) ? settings : mobileSort
  if (!visible(first)) return undefined

  return [
    {
      element: withinSelector(
        'llamalend-markets-table',
        visible(apr) ? 'data-table-header-rates_borrow' : 'btn-drawer-sort-lamalend-markets',
      ),
      title: t`Borrow APR`,
      content: (
        <Comparison
          before={t`Net borrow APR was the default rate column.`}
          after={t`Borrow APR leads. It is interest charged on debt before collateral yield or incentives. Estimated net borrow APR remains available.`}
        />
      ),
    },
    ...notFalsy(
      visible(optional) && {
        element: withinSelector(
          'llamalend-markets-table',
          visible(settings) ? 'btn-visibility-settings' : 'btn-drawer-sort-lamalend-markets',
        ),
        title: t`Optional metrics`,
        content: (
          <Comparison
            before={t`These position metrics were not available in the market list controls.`}
            after={
              visible(settings)
                ? t`Table settings can reveal collateral yield, Liquidation range, Liquidation buffer, position RoE, and position leverage. Open a position for the calculations.`
                : t`Mobile sort can use collateral yield, Liquidation range, Liquidation buffer, and position leverage. Open a position for the calculations.`
            }
          />
        ),
      },
    ),
    ...notFalsy(
      (visible(maxLeverage) || visible(mobileSort)) && {
        element: withinSelector(
          'llamalend-markets-table',
          visible(maxLeverage) ? 'data-table-header-maxLeverage' : 'btn-drawer-sort-lamalend-markets',
        ),
        title: t`Max leverage`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`Max leverage used the market's supplied leverage figure.`}
              after={t`Max leverage uses remaining collateral exposure over equity at the maximum loan-to-value ratio (Max LTV), assuming no conversion into borrowed assets. It excludes swap costs and price movement.`}
            />
            <MathBlock>
              <LeverageEquation />
              <Equation>
                {t`Max leverage`}
                {' = '}
                <Fraction numerator="100%" denominator={t`100% − Max LTV`} />
              </Equation>
              <Change>{t`Max LTV = maximum loan-to-value ratio.`}</Change>
            </MathBlock>
          </Stack>
        ),
      },
    ),
  ]
}

const positionSteps = (): TourStep[] | undefined => {
  const table = target('borrow-positions-table')
  const heading = within(table, 'borrow-positions-header')
  if (!table?.querySelector('tbody tr [data-testid^="data-table-cell-"]') || !visible(heading)) return undefined

  if (window.matchMedia('(max-width: 819.95px)').matches) {
    return [
      {
        element: withinSelector('borrow-positions-table', 'borrow-positions-header'),
        title: t`Borrowing positions`,
        content: (
          <Comparison
            before={t`The Borrowing table led with Net borrow APR and labeled debt as Borrow Amount. Health was derived from healthFull and healthNotFull.`}
            after={t`Borrow APR leads, debt is labeled Total debt, and Health uses the Liquidation range. Mobile shows the market and selected sort column; open a market for the full metrics.`}
          />
        ),
      },
    ]
  }

  const apr = within(table, 'data-table-cell-rates_borrow')
  const debt = within(table, 'data-table-cell-userBorrowed')
  const collateral = within(table, 'data-table-cell-userCollateral')
  const multiplier = within(table, 'user-position-yield-multiplier')
  const roe =
    multiplier?.closest('[data-testid="data-table-cell-userRoe"]') ?? within(table, 'data-table-header-userRoe')
  const healthValue = within(table, 'user-position-health-value')
  const distance = within(table, 'user-position-distance')
  const buffer = within(table, 'data-table-cell-userLiquidationBuffer')
  const leverageValue = within(table, 'user-position-leverage-value')
  const maxLeverage = within(table, 'user-position-max-leverage')
  const leverage =
    leverageValue?.closest('[data-testid="data-table-cell-userLeverage"]') ??
    within(table, 'data-table-header-userLeverage')
  const health =
    healthValue?.closest('[data-testid="data-table-cell-userHealth"]') ?? within(table, 'data-table-header-userHealth')
  if (![apr, debt, health].every(visible)) return undefined

  return [
    {
      element: withinSelector('borrow-positions-table', 'data-table-cell-rates_borrow'),
      title: t`Borrow APR`,
      content: (
        <Comparison
          before={t`Net borrow APR was the main rate in your Borrowing row.`}
          after={t`Borrow APR is the main rate, with estimated net borrow APR beneath it. Borrow APR is interest charged on debt before collateral yield or incentives.`}
        />
      ),
    },
    ...notFalsy(
      visible(debt) && {
        element: withinSelector('borrow-positions-table', 'data-table-cell-userBorrowed'),
        title: t`Total debt`,
        content: (
          <Comparison
            before={t`The column was Borrow Amount, and the table also showed loan-to-value (LTV).`}
            after={t`The column is Total debt and stays visible by default. It shows current debt in the debt token, including accrued interest. LTV is no longer a Borrowing table column.`}
          />
        ),
      },
    ),
    ...notFalsy(
      visible(collateral) && {
        element: withinSelector('borrow-positions-table', 'data-table-cell-userCollateral'),
        title: t`Collateral value`,
        content: (
          <Comparison
            before={t`The column was labeled Collateral Amount.`}
            after={t`It is labeled Collateral value and stays visible beside Total debt. The row shows the position's collateral value and token amount.`}
          />
        ),
      },
    ),
    {
      element: () =>
        within(target('borrow-positions-table'), 'user-position-health-value')?.closest(
          targetSelector('data-table-cell-userHealth'),
        ) ?? document.querySelector(withinSelector('borrow-positions-table', 'data-table-header-userHealth'))!,
      title: t`Health`,
      content: (
        <Stack spacing={1}>
          <Comparison
            before={t`The row derived Health from healthFull and healthNotFull and showed a bar.`}
            after={t`Health shows the oracle price relative to the upper edge of the Liquidation range, with a Status badge when its inputs are available. It remains 1.00 at or below that edge and stays visible by default.`}
          />
          {!healthValue && (
            <Change>{t`The current Health value needs a valid oracle price and range boundary.`}</Change>
          )}
          <MathBlock>
            <HealthEquation />
          </MathBlock>
        </Stack>
      ),
    },
    ...notFalsy(
      visible(roe) && {
        element: () =>
          within(target('borrow-positions-table'), 'user-position-yield-multiplier')?.closest(
            targetSelector('data-table-cell-userRoe'),
          ) ?? document.querySelector(withinSelector('borrow-positions-table', 'data-table-header-userRoe'))!,
        title: t`RoE and yield multiplier`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`The Borrowing table had no return on equity (RoE) or yield multiplier column.`}
              after={t`Optional RoE estimates an APR from current composition and rates, without assumed reinvestment. The smaller yield multiplier compares that return with unleveraged collateral APR; it is not exposure leverage. A negative estimate keeps its sign.`}
            />
            {!multiplier && <Change>{t`The estimate needs position and rate data that is not available yet.`}</Change>}
            <MathBlock>
              <RoeEquations />
            </MathBlock>
          </Stack>
        ),
      },
    ),
    ...notFalsy(
      visible(leverage) && {
        element: () =>
          within(target('borrow-positions-table'), 'user-position-leverage-value')?.closest(
            targetSelector('data-table-cell-userLeverage'),
          ) ?? document.querySelector(withinSelector('borrow-positions-table', 'data-table-header-userLeverage'))!,
        title: t`Leverage`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`The Borrowing table had no position leverage column.`}
              after={
                maxLeverage
                  ? t`Optional leverage shows remaining collateral exposure over equity, as on the position card. Market Max leverage appears beneath it. This is not the yield multiplier.`
                  : t`Optional leverage shows remaining collateral exposure over equity, as on the position card. Market Max leverage appears beneath it when the maximum loan-to-value ratio is available. This is not the yield multiplier.`
              }
            />
            <MathBlock>
              <LeverageEquation />
            </MathBlock>
          </Stack>
        ),
      },
    ),
    ...notFalsy(
      visible(distance) && {
        element: withinSelector('borrow-positions-table', 'data-table-cell-userDistanceToRange'),
        title: t`Distance to range`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`The Borrowing table did not show distance to the Liquidation range.`}
              after={t`This optional column shows the oracle's distance to the range, or In range, with both range boundaries beneath it. While it is shown, Liquidation buffer is hidden.`}
            />
            <MathBlock>
              <RangeEquations />
            </MathBlock>
          </Stack>
        ),
      },
    ),
    ...notFalsy(
      visible(buffer) && {
        element: withinSelector('borrow-positions-table', 'data-table-cell-userLiquidationBuffer'),
        title: t`Liquidation buffer`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`The Borrowing table had no separate debt-relative Liquidation buffer.`}
              after={t`When the position is in range, this optional column shows liquidation-adjusted margin. It is neither a price-drop allowance nor withdrawable equity. Showing Distance to range hides this column.`}
            />
            <MathBlock>
              <BufferEquations />
            </MathBlock>
          </Stack>
        ),
      },
    ),
  ]
}

const StatusScale = ({ assetsType }: { assetsType: MarketAssetsType | undefined }) => (
  <Stack spacing={0.75}>
    <Change>
      {t`Market types use different provisional scales. Near range measures the price drop to the upper boundary; the buffer warning uses healthFull, the position's full health percentage.`}
    </Change>
    <Stack component="ul" className="llamalend-tour-status-list" spacing={0.25}>
      {Object.values(MarketAssetsType).map(category => {
        const scale = PROVISIONAL_POSITION_THRESHOLDS[category]
        return (
          <Typography component="li" variant="bodyXsRegular" key={category}>
            <strong>
              {CATEGORY_LABEL[category]}
              {assetsType === category ? t` (this market)` : ''}:
            </strong>{' '}
            {t`Near range ≤ ${scale.nearRangeDropPercent}% price drop; buffer warning at healthFull ≤ ${scale.criticalBufferPercent}%.`}
          </Typography>
        )
      })}
    </Stack>
    {!assetsType && (
      <Change>{t`This market is uncategorized, so Near range has no cutoff and the buffer warning begins at healthFull ≤ 0%.`}</Change>
    )}
    <Change>{t`These cutoffs are prototype guidance, not calibrated liquidation probabilities.`}</Change>
  </Stack>
)

const StatusStates = ({ assetsType }: { assetsType: MarketAssetsType | undefined }) => (
  <Stack component="ul" className="llamalend-tour-status-list" spacing={0.25}>
    <Typography
      component="li"
      variant="bodyXsRegular"
    >{t`Above range: oracle above the upper boundary, outside the Near range cutoff.`}</Typography>
    <Typography
      component="li"
      variant="bodyXsRegular"
    >{t`Near range: above the upper boundary, within this market category's price-drop cutoff.`}</Typography>
    <Typography
      component="li"
      variant="bodyXsRegular"
    >{t`In range: oracle between the two boundaries; collateral may be converting.`}</Typography>
    <Typography component="li" variant="bodyXsRegular">{t`Below range: oracle below the lower boundary.`}</Typography>
    <Typography
      component="li"
      variant="bodyXsRegular"
    >{t`Liquidatable: healthFull < 0; this overrides the range status. Exactly 0 is not liquidatable.`}</Typography>
    <Typography component="li" variant="bodyXsRegular">{t`Position closed: no debt remains.`}</Typography>
    <Typography
      component="li"
      variant="bodyXsRegular"
    >{t`Status unavailable: oracle price or valid range boundaries are missing.`}</Typography>
    {!assetsType && (
      <Typography
        component="li"
        variant="bodyXsRegular"
      >{t`Near range is unavailable for uncategorized markets.`}</Typography>
    )}
  </Stack>
)

const borrowSteps = (assetsType: MarketAssetsType | undefined): TourStep[] | undefined => {
  const card = target('beta-position-card')
  const health = within(card, 'health-details-health-metric')
  const status = within(card, 'position-status')
  const range = within(card, 'liquidation-range')
  const buffer = within(card, 'health-details-liquidation-buffer-metric')
  if (!card || ![health, range, buffer].every(visible)) return undefined
  const collateral = within(card, 'position-collateral-value')
  const leverage = within(card, 'position-leverage')
  const roe = within(card, 'position-roe')
  const apr = target('market-net-borrow-apr')
  const apy = target('market-net-supply-apy')

  return [
    {
      element: withinSelector('beta-position-card', 'health-details-health-metric'),
      title: t`Health`,
      content: (
        <Stack spacing={1}>
          <Comparison
            before={t`Health was derived from healthFull and healthNotFull and described the cushion before hard liquidation.`}
            after={t`Health shows the oracle price relative to the start of the Liquidation range. It remains 1.00 at or below the upper edge; then monitor the separate Liquidation buffer.`}
          />
          <MathBlock>
            <HealthEquation />
          </MathBlock>
        </Stack>
      ),
    },
    ...notFalsy(
      visible(status) && {
        element: withinSelector('beta-position-card', 'position-status'),
        title: t`Status`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`The card used Health and conditional alerts; it had no separate Status badge.`}
              after={t`A separate badge now names the position's range location and liquidation state. Its states and category-specific warning scales are listed below.`}
            />
            <StatusStates assetsType={assetsType} />
            <StatusScale assetsType={assetsType} />
          </Stack>
        ),
      },
    ),
    {
      element: withinSelector('beta-position-card', 'liquidation-range'),
      title: t`Distance to range`,
      content: (
        <Stack spacing={1}>
          <Comparison
            before={t`The card showed one Liquidation threshold and its distance.`}
            after={t`The main figure shows the oracle's distance to the Liquidation range, or In range. Both range boundaries appear beneath it. Conversions may occur in both directions; the lower edge is not the hard-liquidation price.`}
          />
          <MathBlock>
            <RangeEquations />
          </MathBlock>
        </Stack>
      ),
    },
    {
      element: withinSelector('beta-position-card', 'health-details-liquidation-buffer-metric'),
      title: t`Liquidation buffer`,
      content: (
        <Stack spacing={1}>
          <Comparison
            before={t`Liquidation buffer appeared beside the Health bar, based on healthNotFull and the market's discount gap.`}
            after={t`The standalone Liquidation buffer displays healthFull as a debt-relative percentage and amount. It is neither a price-drop allowance nor withdrawable equity. Its warning color uses a provisional market-category cutoff.`}
          />
          <MathBlock>
            <BufferEquations />
          </MathBlock>
        </Stack>
      ),
    },
    ...notFalsy(
      visible(collateral) && {
        element: withinSelector('beta-position-card', 'position-collateral-value'),
        title: t`Collateral value`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`Collateral value showed a total with token amounts beneath it.`}
              after={t`The same total now has a composition bar for remaining collateral and converted borrowed assets. A zero total is unavailable, not 100% cash.`}
            />
            <MathBlock>
              <CollateralEquations />
            </MathBlock>
          </Stack>
        ),
      },
    ),
    ...notFalsy(
      visible(leverage) && {
        element: withinSelector('beta-position-card', 'position-leverage'),
        title: t`Leverage`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`The card displayed the SDK's current leverage value.`}
              after={t`Leverage is calculated as remaining collateral exposure over equity. It amplifies relative-price gains, losses, and potential collateral yield, less borrowing costs. Market Max leverage uses the same ratio at the maximum loan-to-value limit. It is not the yield multiplier.`}
            />
            <MathBlock>
              <LeverageEquation />
            </MathBlock>
          </Stack>
        ),
      },
    ),
    ...notFalsy(
      visible(roe) && {
        element: withinSelector('beta-position-card', 'position-roe'),
        title: t`Return on equity`,
        content: (
          <Stack spacing={1}>
            <Comparison
              before={t`The position card had no return on equity (RoE) metric.`}
              after={t`RoE estimates an APR from current composition and rates without assumed reinvestment. It excludes price movement and conversion profit or loss.`}
            />
            <MathBlock>
              <RoeEquations />
            </MathBlock>
            <Change>{t`Lender CRV rewards are not borrower income.`}</Change>
          </Stack>
        ),
      },
    ),
    ...notFalsy(
      visible(apr) && {
        element: targetSelector('market-net-borrow-apr'),
        title: t`Borrow APR`,
        content: (
          <Comparison
            before={t`Net borrow APR led the header, with its period average beneath it.`}
            after={t`Borrow APR leads: interest charged on debt before collateral yield or incentives. The smaller Net line shows estimated net borrow APR after collateral yield and incentives. Yield paid in another asset is not a same-asset borrowing cost.`}
          />
        ),
      },
    ),
    ...notFalsy(
      visible(apy) && {
        element: targetSelector('market-net-supply-apy'),
        title: t`Supply APY`,
        content: <SupplyApyCopy />,
      },
    ),
  ]
}

const SupplyApyCopy = () => (
  <Comparison
    before={t`Net supply APY led the header, with its period average beneath it.`}
    after={t`Supply APY leads: estimated earnings related to your share of the pool. Net supply APY appears below. Rates vary with the market, monetary policy, and incentives.`}
  />
)

const supplySteps = (): TourStep[] | undefined => {
  const apy = target('market-net-supply-apy')
  return visible(apy)
    ? [{ element: targetSelector('market-net-supply-apy'), title: t`Supply APY`, content: <SupplyApyCopy /> }]
    : undefined
}

export const getSteps = (guide: Guide, assetsType: MarketAssetsType | undefined) =>
  guide === 'list'
    ? listSteps()
    : guide === 'positions'
      ? positionSteps()
      : guide === 'borrow'
        ? borrowSteps(assetsType)
        : supplySteps()

