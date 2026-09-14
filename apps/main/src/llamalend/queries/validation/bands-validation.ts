import { group, test } from 'vest'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const liquidationBandValidationGroup = ({ liquidationBand }: { liquidationBand?: number | null | undefined }) =>
  group('liquidationBandValidation', () => {
    test('liquidationBand', () => {
      if (liquidationBand != null) {
        enforce(liquidationBand).message('Liquidation band must be a number').isNumber()
      }
    })
  })
