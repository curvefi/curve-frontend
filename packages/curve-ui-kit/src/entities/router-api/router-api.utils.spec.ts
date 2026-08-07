import { zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FetchError } from '@primitives/fetch.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { fetchApiRoutes, getRouteById } from './router-api.query'
import type { RouteResponse } from './router-api.types'
import { getExpectedFn } from './router-api.utils'

vi.mock('./router-api.query', () => ({ fetchApiRoutes: vi.fn(), getRouteById: vi.fn() }))

const route = (router: RouteProvider): RouteResponse => ({
  id: `${router}:route`,
  router,
  amountIn: ['1'],
  amountOut: ['7'],
  gas: null,
  priceImpact: null,
  createdAt: 0,
  warnings: [],
  tx: { to: zeroAddress, from: zeroAddress, data: '0x', value: '0' },
})

const getExpected = (router?: RouteProvider) =>
  getExpectedFn({ chainId: 1, router, userAddress: zeroAddress, zapAddress: zeroAddress, slippage: '0.5' })

const quote = (getExpected: ReturnType<typeof getExpectedFn>) => getExpected(zeroAddress, zeroAddress, 1n, zeroAddress)

describe('getExpectedFn', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getRouteById).mockImplementation(routeId => route(routeId!.split(':')[0] as RouteProvider))
  })

  it('prefers Curve Solver for ZapV2 quotes', async () => {
    vi.mocked(fetchApiRoutes).mockResolvedValue([route('curve-solver')])

    await expect(quote(getExpected())).resolves.toMatchObject({ outAmount: '7' })
    expect(vi.mocked(fetchApiRoutes).mock.calls.map(([params]) => params.router)).toEqual(['curve-solver'])
  })

  it('falls back to Enso when Curve Solver fails', async () => {
    vi.mocked(fetchApiRoutes).mockImplementation(({ router }) =>
      router === 'curve-solver'
        ? Promise.reject(new FetchError(404, 'No route', ''))
        : Promise.resolve([route(router as RouteProvider)]),
    )
    await quote(getExpected())

    expect(vi.mocked(fetchApiRoutes).mock.calls.map(([params]) => params.router)).toEqual(['curve-solver', 'enso'])
  })

  it('keeps an explicitly selected provider', async () => {
    vi.mocked(fetchApiRoutes).mockResolvedValue([route('curve')])

    await quote(getExpected('curve'))

    expect(vi.mocked(fetchApiRoutes).mock.calls.map(([params]) => params.router)).toEqual(['curve'])
  })
})
