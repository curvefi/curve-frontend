import { zeroAddress } from 'viem'
import type { RouteResponse } from '@primitives/router.utils'

export const mockRoutes: RouteResponse[] = [
  {
    id: 'curve',
    router: 'curve',
    amountIn: ['69424100000000000000'],
    amountOut: ['69424100000000000000'],
    priceImpact: 0.01,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Curve', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'curve', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000001', data: '0x', from: zeroAddress, value: '0' },
  },
  {
    id: 'enso',
    router: 'enso',
    amountIn: ['69424100000000000000'],
    amountOut: ['67743200000000000000'],
    priceImpact: 0.1,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Enso', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'enso', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000002', data: '0x', from: zeroAddress, value: '0' },
  },
  {
    id: 'odos',
    router: 'odos',
    amountIn: ['69424100000000000000'],
    amountOut: ['67014200000000000000'],
    priceImpact: 0.001,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Odos', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'odos', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000003', data: '0x', from: zeroAddress, value: '0' },
  },
]
