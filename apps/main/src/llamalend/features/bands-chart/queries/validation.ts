import { enforce, group, test } from 'vest'

export const liquidationBandValidationGroup = ({ liquidationBand }: { liquidationBand: number | null | undefined }) =>
  group('liquidationBandValidation', () => {
    test('liquidationBand', () => {
      if (liquidationBand != null) {
        enforce(liquidationBand).message('Liquidation band must be a number').isNumber()
      }
    })
  })
