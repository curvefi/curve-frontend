import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { enforce, group, test } from 'vest'

export const userMarketValidationGroup = ({ market }: { market: OneWayMarketTemplate }) =>
  group('marketValidation', () => {
    test('market', 'Market is required', () => {
      enforce(market).isNotEmpty()
    })
  })
