import { zeroAddress } from 'viem'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'

export const createMockMintMarket = (overrides: object) =>
  Object.assign(Object.create(MintMarketTemplate.prototype), {
    id: 'wsteth',
    collateralSymbol: 'wstETH',
    collateral: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    collateralDecimals: 18,
    controller: '0x1234567890123456789012345678901234567890',
    leverageZap: zeroAddress,
    deleverageZap: zeroAddress,
    leverageV2: { hasLeverage: () => false },
    ...overrides,
  }) as MintMarketTemplate
