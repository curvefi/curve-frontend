import type { DesignSystem } from '@ui-kit/themes/design'

type ShadowElevation = -2 | -1 | 1 | 2 | 3

export const getShadow = (design: DesignSystem, elevation: ShadowElevation) =>
  ({
    [-2]: `2px 2px 0px 0px ${design.Color.Neutral[800]} inset`,
    [-1]: `1px 1px 0px 0px ${design.Color.Neutral[800]} inset`,
    1: [
      '0px 0px 0px 1px #2A334524',
      '0px 1px 1px -0.5px #2A334524',
      '0px 3px 3px -1.5px #2A334624',
      '0px 4px 4px -2px #2A334524',
      '0px 8px 8px -8px #2A334514',
    ].join(','),
    2: [
      '0px 0px 0px 1px #2A334524',
      '0px 1px 1px -0.5px #2A334524',
      '0px 3px 3px -1.5px #2A334624',
      '0px 6px 6px -3px #2A334624',
      '0px 8px 8px -6px #2A334524',
      '0px 12px 12px -6px #2A334514',
    ].join(','),
    3: [
      '0px 0px 0px 1px #2A334524',
      '0px 1px 1px -0.5px #2A334524',
      '0px 3px 3px -1.5px #2A334524',
      '0px 8px 8px -4px #2A334524',
      '0px 16px 16px -8px #2A334524',
      '0px 32px 32px -16px #2A33451A',
    ].join(','),
  })[elevation]
