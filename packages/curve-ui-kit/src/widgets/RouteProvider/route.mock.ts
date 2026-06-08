import { zeroAddress } from 'viem'
import type { RouteResponse } from '@ui-kit/entities/router-api'

export const mockRoutes: RouteResponse[] = [
  {
    id: 'curve',
    router: 'curve',
    amountIn: ['69424100000000000000'],
    amountOut: ['69424100000000000000'],
    priceImpact: 0.01,
    gas: null,
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
    gas: `2100`,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Enso', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'enso', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000002', data: '0x', from: zeroAddress, value: '0' },
  },
  {
    id: 'curve-solver',
    router: 'curve-solver',
    amountIn: ['69424100000000000000'],
    amountOut: ['68324100000000000000'],
    priceImpact: null,
    gas: `173000`,
    createdAt: 0,
    warnings: [],
    route: [
      {
        name: 'Curve Solver',
        tokenIn: [zeroAddress],
        tokenOut: [zeroAddress],
        protocol: 'curve-solver',
        action: 'swap',
        chainId: 1,
      },
    ],
    tx: { to: '0x0000000000000000000000000000000000000004', data: '0x', from: zeroAddress, value: '0' },
  },
  {
    id: 'odos',
    router: 'odos',
    amountIn: ['69424100000000000000'],
    amountOut: ['67014200000000000000'],
    priceImpact: 0.001,
    gas: `2100`,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Odos', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'odos', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000003', data: '0x', from: zeroAddress, value: '0' },
  },
  {
    id: '0x',
    router: '0x',
    amountIn: ['69424100000000000000'],
    amountOut: ['66914200000000000000'],
    priceImpact: null,
    gas: `2100`,
    createdAt: 0,
    warnings: [],
    route: [
      { name: '0x RFQ', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: '0x', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000004', data: '0x', from: zeroAddress, value: '0' },
  },
]
