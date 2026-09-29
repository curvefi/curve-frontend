import { driver, type DriveStep, type Driver } from 'driver.js'
import { type ReactNode, use, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import 'driver.js/dist/driver.css'
import { MarketContext } from '@/llamalend/features/market-context'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useLlamalendPrototypeTourSeen } from '@ui/features/storage/useLocalStorage'
import { getShadow } from '@ui/features/themes/basic-theme/shadows'
import { usePathname } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { getSteps, visible, type Guide, type Surface } from './prototype-tour-steps'
import './prototype-tour.css'

const CONTENT_VERSIONS: Record<Guide, number> = { list: 6, positions: 11, borrow: 8, supply: 4 }
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
  const market = use(MarketContext)
  const assetsType = market ? getMarketAssetsType(market.chainId, market.controllerAddress) : undefined
  const pathname = usePathname()
  const theme = useTheme()
  const [seen, setSeen] = useLlamalendPrototypeTourSeen(surface, CONTENT_VERSIONS[surface])
  const [positionsSeen, setPositionsSeen] = useLlamalendPrototypeTourSeen('positions', CONTENT_VERSIONS.positions)
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
            ? (element as () => Element | undefined)()
            : element
      if (visible(replacement)) tour.moveTo(tour.getActiveIndex() ?? 0)
    })

    function begin() {
      if (tourRef.current) return
      const steps = getSteps(guide!, assetsType)
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
  }, [
    assetsType,
    beta,
    pathname,
    ready,
    positionsReady,
    positionsSeen,
    replay,
    seen,
    setPositionsSeen,
    setSeen,
    surface,
  ])

  if (!beta) return null
  const showPageGuide = surface !== 'list' || seen
  return (
    <>
      {portal && createPortal(portal.content, portal.element)}
      {(showPageGuide || (surface === 'list' && positionsSeen)) && (
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
          {showPageGuide && (
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
