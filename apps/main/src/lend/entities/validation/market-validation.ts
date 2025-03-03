import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { enforce, group, test } from 'vest'

export const userMarketValidationGroup = ({ market, rOwmId }: { market: OneWayMarketTemplate; rOwmId: string }) =>
  group('marketValidation', () => {
    test('market', 'Market is required', () => {
      enforce(market).isNotEmpty()
    })

    test('rOwmId', 'rOwmId is required', () => {
      enforce(rOwmId).isNotEmpty()
      enforce(rOwmId).equals(market.id)
    })
  })
