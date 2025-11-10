import { enforce, group, test } from 'vest'

export const liquidationBandValidationGroup = ({ liquidationBand }: { liquidationBand?: number | null | undefined }) =>
  group('liquidationBandValidation', () => {
    test('liquidationBand', () => {
      if (liquidationBand != null) {
        enforce(liquidationBand).message('Liquidation band must be a number').isNumber()
      }
    })
  })

export const oraclePriceBandValidationGroup = ({ oraclePriceBand }: { oraclePriceBand?: number | null | undefined }) =>
  group('oraclePriceBandValidation', () => {
    test('oraclePriceBand', () => {
      if (oraclePriceBand != null) {
        enforce(oraclePriceBand).message('Oracle price band must be a number').isNumber()
      }
    })
  })
