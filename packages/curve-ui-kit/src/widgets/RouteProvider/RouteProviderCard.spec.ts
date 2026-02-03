// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import { lightTheme } from '@ui-kit/themes'
import { RouteProviderCard } from './RouteProviderCard'

const theme = lightTheme()
const rootFontSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16

const toPixels = (value: string) => {
  const parsed = parseFloat(value)
  if (Number.isNaN(parsed)) {
    return 0
  }
  if (value.endsWith('rem')) {
    return parsed * rootFontSize()
  }
  return parsed
}

const renderRouteProviderCard = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(
      createElement(
        ThemeProvider,
        { theme },
        createElement(RouteProviderCard, {
          route: { provider: 'curve', toAmountOutput: '69.4241', isLoading: false },
          tokenSymbol: 'crvUSD',
          usdPrice: 1.0,
          isSelected: true,
          bestOutputAmount: '69.4241',
          providerLabel: 'Curve',
          onSelect: () => undefined,
          icon: createElement('span', {
            'data-testid': 'route-icon',
            style: { width: '16px', height: '16px', display: 'inline-block' },
          }),
        }),
      ),
    )
  })

  const card = container.querySelector('[data-testid="route-provider-card"]')
  if (!card) {
    throw new Error('RouteProviderCard did not render a card element.')
  }

  return { container, root, card }
}

describe('RouteProviderCard', () => {
  it('renders with the expected card height', () => {
    const { root, container, card } = renderRouteProviderCard()
    const rows = container.querySelector('[data-testid="route-provider-rows"]')
    const amount = container.querySelector('[data-testid="route-provider-amount"]')
    const usd = container.querySelector('[data-testid="route-provider-usd"]')
    const chip = container.querySelector('[aria-label="Best price"]')
    const icon = container.querySelector('[data-testid="route-icon"]')

    if (!rows || !amount || !usd || !chip || !icon) {
      throw new Error('RouteProviderCard test nodes are missing.')
    }

    const rowsStyle = getComputedStyle(rows)
    const cardStyle = getComputedStyle(card)
    const topRowHeight = Math.max(
      toPixels(getComputedStyle(amount).lineHeight),
      toPixels(getComputedStyle(chip).height),
    )
    const bottomRowHeight = Math.max(
      toPixels(getComputedStyle(usd).lineHeight),
      toPixels(getComputedStyle(icon).height),
    )
    const totalHeight =
      toPixels(cardStyle.paddingTop) +
      toPixels(cardStyle.paddingBottom) +
      toPixels(rowsStyle.rowGap) +
      topRowHeight +
      bottomRowHeight

    expect(totalHeight).toBeCloseTo(48, 1)
    act(() => root.unmount())
    container.remove()
  })

  it('renders a hover background style for the card', () => {
    const { root, container, card } = renderRouteProviderCard()
    const cssClass = card.className.split(' ').find((name) => name.startsWith('css-'))
    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')
    const escapedClass = cssClass ? cssClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''

    expect(cssClass).toBeTruthy()
    expect(styleText).toMatch(new RegExp(`\\.${escapedClass}:hover\\{[^}]*background-color:[^;]+;`))

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
