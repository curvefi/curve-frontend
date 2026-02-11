export const PRIMITIVE_ROOT_ALIASES: Record<string, string> = {
  Orange: 'Oranges',
  Oranges: 'Oranges',
  Violet: 'Violets',
  Violets: 'Violets',
  Yellow: 'Yellows',
  Yellows: 'Yellows',
}

export const GRID_SPACING_KEYS = ['Column Spacing', 'Row Spacing'] as const

export const BUTTON_HEIGHT_TO_SIZE: Record<string, string> = {
  XXS: 'xxs',
  XS: 'xs',
  S: 'sm',
  M: 'md',
  L: 'lg',
}

export const LEGACY_PRIMITIVE_FALLBACKS = {
  'Spacing.450': '1.25rem',
  'Sizing.450': '2.25rem',
} as const

export const TYPOGRAPHY_KEY_OVERRIDES: Record<string, string> = {
  'Heading.XXL': 'headingXxl',
  'Heading.MBold': 'headingMBold',
  'Heading.MLight': 'headingMLight',
  'Heading.SBold': 'headingSBold',
  'Heading.XsBold': 'headingXsBold',
  'Heading.XsMedium': 'headingXsMedium',
  'Body.MRegular': 'bodyMRegular',
  'Body.MBold': 'bodyMBold',
  'Body.SRegular': 'bodySRegular',
  'Body.SBold': 'bodySBold',
  'Body.XsRegular': 'bodyXsRegular',
  'Body.XsBold': 'bodyXsBold',
  'ButtonLabel.XS': 'buttonXs',
  'ButtonLabel.S': 'buttonS',
  'ButtonLabel.M': 'buttonM',
  'Table.Header.M': 'tableHeaderM',
  'Table.Header.S': 'tableHeaderS',
  'Table.Cell.L': 'tableCellL',
  'Table.Cell.MRegular': 'tableCellMRegular',
  'Table.Cell.MBold': 'tableCellMBold',
  'Table.Cell.SRegular': 'tableCellSRegular',
  'Table.Cell.SBold': 'tableCellSBold',
  'Highlighted.XSNotional': 'highlightXsNotional',
  'Highlighted.XS': 'highlightXs',
  'Highlighted.S': 'highlightS',
  'Highlighted.M': 'highlightM',
  'Highlighted.L': 'highlightL',
  'Highlighted.XL': 'highlightXl',
  'Highlighted.XXL': 'highlightXxl',
}
