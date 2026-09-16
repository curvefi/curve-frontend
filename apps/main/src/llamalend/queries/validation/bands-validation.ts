import { group, test } from 'vest'
import type { Nullish } from '@primitives/objects.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const liquidationBandValidationGroup = ({ liquidationBand }: { liquidationBand?: number | Nullish }) =>
  group('liquidationBandValidation', () => {
    test('liquidationBand', () => {
      if (liquidationBand != null) {
        enforce(liquidationBand).message('Liquidation band must be a number').isNumber()
      }
    })
  })
