import { driver, type DriveStep, type Driver } from 'driver.js'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import 'driver.js/dist/driver.css'
import {
  BufferEquations,
  CollateralEquations,
  Equation,
  HealthEquation,
  LeverageEquation,
  RangeEquations,
  RoeEquations,
} from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { notFalsy, type Nullish } from '@primitives/objects.utils'
import { useLlamalendPrototypeTourSeen } from '@ui/features/storage/useLocalStorage'
import { getShadow } from '@ui/features/themes/basic-theme/shadows'
import { usePathname } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import './prototype-tour.css'

type Surface = 'list' | 'borrow' | 'supply'
type Guide = Surface | 'positions'
type TourStep = { element: NonNullable<DriveStep['element']>; title: string; content: ReactNode }

const CONTENT_VERSION = 3
const POSITION_CONTENT_VERSION = 4
const target = (testId: string) => document.querySelector(`[data-testid="${testId}"]`)
const within = (element: Element | null, testId: string) => element?.querySelector(`[data-testid="${testId}"]`)
const targetSelector = (testId: string) => `[data-testid="${testId}"]`
const withinSelector = (parentId: string, testId: string) => `${targetSelector(parentId)} ${targetSelector(testId)}`
const visible = (element: Element | Nullish): element is Element => !!element && element.getClientRects().length > 0

const Change = ({ children }: { children: ReactNode }) => (
  <Typography component="p" variant="bodySRegular">
    {children}
  </Typography>
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
        <Change>
          {t`Previously, Net borrow APR was the default rate column. Now Borrow APR leads: interest charged on debt before collateral yield or incentives. Estimated net borrow APR remains available.`}
        </Change>
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
          <Change>
            {visible(settings)
              ? t`Previously, table settings did not offer collateral yield, liquidation buffer, position RoE, or position leverage. Now you can reveal them there and open a position to see each calculation.`
              : t`Previously, mobile sort did not offer collateral yield, liquidation buffer, or position leverage. Now you can choose these metrics there and open a position to see each calculation.`}
          </Change>
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
          <Change>
            {t`Your Borrowing positions now lead with Borrow APR rather than Net borrow APR; add estimated RoE, its yield multiplier, and position leverage; and show range-based Health with position status. Leverage is remaining collateral exposure over equity. Open a market for the full metric explanations.`}
          </Change>
        ),
      },
    ]
  }

  const apr = within(table, 'data-table-cell-rates_borrow')
  const multiplier = within(table, 'user-position-yield-multiplier')
  const roe =
    multiplier?.closest('[data-testid="data-table-cell-userRoe"]') ?? within(table, 'data-table-header-userRoe')
  const healthValue = within(table, 'user-position-health-value')
  const leverageValue = within(table, 'user-position-leverage-value')
  const leverage =
    leverageValue?.closest('[data-testid="data-table-cell-userLeverage"]') ??
    within(table, 'data-table-header-userLeverage')
  const health =
    healthValue?.closest('[data-testid="data-table-cell-userHealth"]') ?? within(table, 'data-table-header-userHealth')
  if (![apr, roe, health].every(visible)) return undefined

  return [
    {
      element: withinSelector('borrow-positions-table', 'data-table-cell-rates_borrow'),
      title: t`Borrow APR`,
      content: (
        <Change>
          {t`Previously, Net borrow APR was the main rate in your Borrowing row. Now Borrow APR is the main figure, with estimated Net borrow APR beneath it. Borrow APR is interest charged on debt before collateral yield or incentives.`}
        </Change>
      ),
    },
    {
      element: () =>
        within(target('borrow-positions-table'), 'user-position-yield-multiplier')?.closest(
          targetSelector('data-table-cell-userRoe'),
        ) ?? document.querySelector(withinSelector('borrow-positions-table', 'data-table-header-userRoe'))!,
      title: t`RoE and yield multiplier`,
      content: (
        <Stack spacing={1}>
          <Change>
            {t`This column was absent in Stable. Now RoE estimates an APR from the position’s current composition and rates. The smaller figure beneath it is the yield multiplier, not exposure leverage. Both are estimates without assumed reinvestment.`}
          </Change>
          {!multiplier && <Change>{t`The estimate needs position and rate data that is not available yet.`}</Change>}
          <MathBlock>
            <RoeEquations />
          </MathBlock>
        </Stack>
      ),
    },
    ...notFalsy(
      visible(leverage) && {
        element: () =>
          within(target('borrow-positions-table'), 'user-position-leverage-value')?.closest(
            targetSelector('data-table-cell-userLeverage'),
          ) ?? document.querySelector(withinSelector('borrow-positions-table', 'data-table-header-userLeverage'))!,
        title: t`Leverage`,
        content: (
          <Stack spacing={1}>
            <Change>
              {t`This column was absent in Stable. Now it shows remaining collateral exposure over equity, using the same calculation as the position card. It amplifies relative-price gains and losses and potential collateral yield, less borrowing costs. It is not the yield multiplier.`}
            </Change>
            <MathBlock>
              <LeverageEquation />
            </MathBlock>
            <Change>{t`q: remaining collateral quantity; p: oracle price; b: converted borrowed assets; d: debt.`}</Change>
          </Stack>
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
          <Change>
            {t`Previously, this row showed Controller-derived Health and a bar. Now it shows Health relative to the Liquidation range, with a position-status badge when its inputs are available. Health remains 1.00 at or below the upper edge.`}
          </Change>
          {!healthValue && (
            <Change>{t`The current Health value needs a valid oracle price and range boundary.`}</Change>
          )}
          <MathBlock>
            <HealthEquation />
          </MathBlock>
        </Stack>
      ),
    },
  ]
}

const borrowSteps = (): TourStep[] | undefined => {
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
          <Change>
            {t`Previously, Health showed a Controller-derived cushion. Now it shows proximity to the start of the Liquidation range. It remains 1.00 at or below the upper edge; monitor the Liquidation buffer after that.`}
          </Change>
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
            <Change>
              {t`Previously, the card relied on Health and conditional alerts. Now a separate Status badge describes range location and buffer. Near range, Low buffer, and Critical buffer use provisional thresholds for this market category.`}
            </Change>
            <MathBlock>
              <Equation>{t`Liquidatable when Controller full health < 0`}</Equation>
            </MathBlock>
            <Change>{t`Exact zero is critical, not liquidatable.`}</Change>
          </Stack>
        ),
      },
    ),
    {
      element: withinSelector('beta-position-card', 'liquidation-range'),
      title: t`Liquidation range`,
      content: (
        <Stack spacing={1}>
          <Change>
            {t`Previously, the card showed one Liquidation threshold and its distance. Now it shows both edges of the Liquidation range. Conversions may occur both ways; losses need not recover when the price recovers. The lower edge is not the hard-liquidation price.`}
          </Change>
          <MathBlock>
            <RangeEquations />
          </MathBlock>
          <Change>{t`p: oracle price; u: upper boundary; l: lower boundary.`}</Change>
        </Stack>
      ),
    },
    {
      element: withinSelector('beta-position-card', 'health-details-liquidation-buffer-metric'),
      title: t`Liquidation buffer`,
      content: (
        <Stack spacing={1}>
          <Change>{t`Previously, this card had no separate debt-relative buffer. Now Liquidation buffer shows liquidation-adjusted margin. It is not a price-drop allowance or withdrawable equity.`}</Change>
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
            <Change>
              {t`Collateral value used to show the total with token amounts beneath it. The total is calculated the same way; a new composition bar shows the shares of remaining collateral and converted borrowed assets. A zero total is unavailable, not 100% cash.`}
            </Change>
            <MathBlock>
              <CollateralEquations />
            </MathBlock>
            <Change>{t`q: remaining collateral quantity; p: oracle price; b: converted borrowed assets.`}</Change>
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
            <Change>
              {t`Previously, the card displayed the SDK’s current leverage value. Now it calculates remaining collateral exposure over equity. It amplifies relative-price gains and losses and potential collateral yield, less borrowing costs. It is not the yield multiplier.`}
            </Change>
            <MathBlock>
              <LeverageEquation />
            </MathBlock>
            <Change>{t`d: debt.`}</Change>
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
            <Change>{t`Return on equity was not shown before. Now the card estimates RoE as an APR from current composition and rates, without assumed reinvestment. It excludes price movement and conversion profit or loss.`}</Change>
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
          <Change>
            {t`Previously, Net Borrow APR led the header, with its average beneath it. Now Borrow APR leads: interest charged on debt before collateral yield. Estimated net borrow APR sits below and subtracts collateral yield and incentives. Yield paid in another asset is not a same-asset borrowing cost.`}
          </Change>
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
  <Change>
    {t`Previously, Net Supply APY led the header, with its average beneath it. Now Supply APY leads: estimated earnings related to your share of the pool. Net supply APY sits below. These rates vary with the market, monetary policy, and incentives.`}
  </Change>
)

const supplySteps = (): TourStep[] | undefined => {
  const apy = target('market-net-supply-apy')
  return visible(apy)
    ? [{ element: targetSelector('market-net-supply-apy'), title: t`Supply APY`, content: <SupplyApyCopy /> }]
    : undefined
}

const getSteps = (guide: Guide) =>
  guide === 'list'
    ? listSteps()
    : guide === 'positions'
      ? positionSteps()
      : guide === 'borrow'
        ? borrowSteps()
        : supplySteps()

export const PrototypeTour = ({
  surface,
  ready,
  positionsReady = false,
}: {
  surface: Surface
  ready: boolean
  positionsReady?: boolean
}) => {
  const beta = useNewLlamalendHealth()
  const pathname = usePathname()
  const theme = useTheme()
  const [seen, setSeen] = useLlamalendPrototypeTourSeen(surface, CONTENT_VERSION)
  const [positionsSeen, setPositionsSeen] = useLlamalendPrototypeTourSeen('positions', POSITION_CONTENT_VERSION)
  const [replay, setReplay] = useState<Guide | null>(null)
  const [portal, setPortal] = useState<{ element: HTMLElement; content: ReactNode } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const positionTriggerRef = useRef<HTMLButtonElement>(null)
  const tourRef = useRef<Driver | null>(null)

  // Driver measures the popover before React inserts the copy.
  useLayoutEffect(() => {
    const popover = portal?.element.closest<HTMLElement>('.driver-popover')
    if (!popover) return
    const { design } = theme
    popover.style.setProperty('--llamalend-tour-surface', design.Layer[1].Fill)
    popover.style.setProperty('--llamalend-tour-border', design.Layer[1].Outline)
    popover.style.setProperty('--llamalend-tour-math-surface', design.Layer[2].Fill)
    popover.style.setProperty('--llamalend-tour-text', design.Text.TextColors.Primary)
    popover.style.setProperty('--llamalend-tour-muted', design.Text.TextColors.Secondary)
    popover.style.setProperty('--llamalend-tour-primary', design.Button.Primary.Default.Fill)
    popover.style.setProperty('--llamalend-tour-primary-text', design.Button.Primary.Default.Label)
    popover.style.setProperty('--llamalend-tour-primary-hover', design.Button.Primary.Hover.Fill)
    popover.style.setProperty('--llamalend-tour-focus', design.Button.Focus_Outline)
    popover.style.setProperty('--llamalend-tour-radius', design.Button.Radius.sm)
    popover.style.setProperty('--llamalend-tour-shadow', getShadow(design, 2))
    popover.style.fontFamily = theme.typography.fontFamily ?? 'inherit'
    tourRef.current?.refresh()
  }, [portal, theme])

  useEffect(() => {
    if (!beta || !ready) return
    const guide: Guide | null =
      replay ?? (seen ? (surface === 'list' && positionsReady && !positionsSeen ? 'positions' : null) : surface)
    if (!guide || (guide === 'positions' && !positionsReady)) return
    let cleanup = false
    const observer = new MutationObserver(begin)
    // Query refreshes can replace a highlighted node without changing its selector.
    const activeObserver = new MutationObserver(() => {
      const tour = tourRef.current
      const active = tour?.getActiveElement()
      if (!tour || !active || active.isConnected) return
      const element = tour.getActiveStep()?.element
      const replacement =
        typeof element === 'string'
          ? document.querySelector(element)
          : typeof element === 'function'
            ? element()
            : element
      if (visible(replacement)) tour.moveTo(tour.getActiveIndex() ?? 0)
    })

    function begin() {
      if (tourRef.current) return
      const steps = getSteps(guide!)
      if (!steps) return
      observer.disconnect()
      const tour = driver({
        steps: steps.map(({ element, title }): DriveStep => ({ element, popover: { title, description: ' ' } })),
        animate: false,
        smoothScroll: false,
        popoverClass: 'llamalend-prototype-tour',
        showProgress: steps.length > 1,
        allowKeyboardControl: true,
        nextBtnText: t`Next`,
        prevBtnText: t`Back`,
        doneBtnText: t`Explore page`,
        overlayColor: '#000000',
        overlayOpacity: 0.62,
        stagePadding: 8,
        onHighlighted: element => {
          document.querySelectorAll('.driver-active-element').forEach(active => {
            if (active === element) return
            active.classList.remove('driver-active-element')
            active.removeAttribute('aria-controls')
            active.removeAttribute('aria-expanded')
            active.removeAttribute('aria-haspopup')
          })
        },
        onPopoverRender: popover => {
          popover.wrapper.setAttribute('aria-modal', 'true')
          const index = tourRef.current?.getActiveIndex() ?? 0
          setPortal({ element: popover.description, content: steps[index]?.content })
        },
        onDestroyed: () => {
          activeObserver.disconnect()
          tourRef.current = null
          setPortal(null)
          if (!cleanup) {
            if (guide === 'positions') setPositionsSeen(true)
            else setSeen(true)
            setReplay(null)
            requestAnimationFrame(() =>
              (guide === 'positions' ? positionTriggerRef.current : triggerRef.current)?.focus(),
            )
          }
        },
      })
      tourRef.current = tour
      tour.drive()
      activeObserver.observe(document.body, { childList: true, subtree: true })
    }

    begin()
    if (!tourRef.current) observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      cleanup = true
      observer.disconnect()
      activeObserver.disconnect()
      tourRef.current?.destroy()
      tourRef.current = null
    }
  }, [beta, pathname, ready, positionsReady, positionsSeen, replay, seen, setPositionsSeen, setSeen, surface])

  if (!beta) return null
  return (
    <>
      {portal && createPortal(portal.content, portal.element)}
      {(seen || (surface === 'list' && positionsSeen)) && (
        <Stack
          className="llamalend-prototype-guide"
          spacing={0.5}
          sx={{
            backgroundColor: theme.design.Layer[1].Fill,
            borderColor: theme.design.Layer[1].Outline,
            color: theme.design.Text.TextColors.Primary,
            boxShadow: getShadow(theme.design, 1),
          }}
        >
          <Typography variant="bodyXsRegular">{t`What changed`}</Typography>
          {seen && (
            <Button
              ref={triggerRef}
              variant="text"
              size="small"
              disabled={!ready}
              onClick={() => setReplay(surface)}
              data-testid={`prototype-tour-trigger-${surface}`}
            >
              {t`Replay page guide`}
            </Button>
          )}
          {surface === 'list' && positionsSeen && (
            <Button
              ref={positionTriggerRef}
              variant="text"
              size="small"
              disabled={!positionsReady}
              onClick={() => setReplay('positions')}
              data-testid="prototype-tour-trigger-positions"
            >
              {t`Replay position guide`}
            </Button>
          )}
        </Stack>
      )}
    </>
  )
}
