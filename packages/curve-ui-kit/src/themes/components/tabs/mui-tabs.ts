import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import type { Components } from '@mui/material/styles'
import type { CSSObject } from '@mui/styled-engine'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { TypographyVariantKey } from '@ui-kit/themes/typography'
import { DesignSystem } from '../../design'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'

type TabStyle = { Label?: string; Fill?: string; Outline?: string }
type TabVariant = { Inset?: string; Default: TabStyle; Hover: TabStyle; Current: TabStyle }
type SpacingKey = keyof typeof SizesAndSpaces.Spacing | string | number
type TabSizeConfig = {
  className: string
  height: string
  padding: TabPadding
}
type TabStyleOptions = {
  height?: string
  padding?: TabPadding
}
type TabSizeStyleOptions = {
  root?: TabStyleOptions
  vertical?: TabStyleOptions
}
type TabPadding = {
  blockStart?: SpacingKey
  blockEnd?: SpacingKey
  inlineStart?: SpacingKey
  inlineEnd?: SpacingKey
}

export type TabSwitcherVariants = keyof typeof TABS_VARIANT_CLASSES

const { Spacing, ButtonSize } = SizesAndSpaces

// css classes used by the TabSwitcher component
const contained = 'variant-contained' as const
const underlined = 'variant-underlined' as const
const overlined = 'variant-overlined' as const
const small = 'size-small' as const
const medium = 'size-medium' as const
const extraExtraLarge = 'size-extraExtraLarge' as const
export const TABS_VARIANT_CLASSES = { contained, underlined, overlined }
export const TABS_SIZES_CLASSES = { small, medium, extraExtraLarge }
export const HIDE_INACTIVE_BORDERS_CLASS = 'hide-inactive-borders' as const
export const TAB_SUFFIX_CLASS = 'tab-suffix' as const

export const TAB_TEXT_VARIANTS = {
  small: 'buttonXs',
  medium: 'buttonS',
  extraExtraLarge: 'headingMBold',
} as const satisfies Record<keyof typeof TABS_SIZES_CLASSES, TypographyVariantKey>

export const TAB_HEIGHT: Record<keyof typeof TABS_SIZES_CLASSES, string> = {
  small: ButtonSize.xs,
  medium: ButtonSize.sm,
  extraExtraLarge: ButtonSize.md,
}

const BORDER_SIZE = '2px' as const
const BORDER_SIZE_INACTIVE = '1px' as const
const BORDER_SIZE_LARGE = '4px' as const
export const CONTAINED_TABS_MARGIN_RIGHT = 1

const DEFAULT_TAB_PADDING: TabPadding = { inlineStart: 0, inlineEnd: 0, blockStart: 0, blockEnd: 0 }

const DEFAULT_TAB_STYLES_BY_SIZE: Record<keyof typeof TABS_SIZES_CLASSES, TabSizeConfig> = {
  small: {
    className: small,
    height: TAB_HEIGHT.small,
    padding: { ...DEFAULT_TAB_PADDING, inlineStart: 'sm', inlineEnd: 'sm' },
  },
  medium: {
    className: medium,
    height: TAB_HEIGHT.medium,
    padding: { ...DEFAULT_TAB_PADDING, inlineStart: 'sm', inlineEnd: 'sm' },
  },
  extraExtraLarge: {
    className: extraExtraLarge,
    height: TAB_HEIGHT.extraExtraLarge,
    padding: { ...DEFAULT_TAB_PADDING, inlineStart: 'md', inlineEnd: 'md' },
  },
}

/**
 * Using ::after pseudo-selector for borders instead of CSS border properties for:
 *
 * 1. Consistency with MUI tab indicator implementation (absolute positioning)
 *
 * 2. Absolute positioning matches Figma design and avoids box model complications:
 *    - Borders don't affect element dimensions
 *    - Handles varying border heights and paddings cleanly
 *
 * 3. Simpler state management:
 *    - No need for transparent border fallbacks
 *    - Works seamlessly for both underline/overline variants
 *
 * 4. The ::after element enables separate transitions for opacity and background-color:
 *    - Hover state can smoothly transition from transparent to outline color via opacity
 *    - Active state can instantly switch outline colors without transition
 *    - This solves the limitation where a single CSS property (like border-color)
 *      cannot have different transition behaviors for hover vs active states
 *    In other words, this allows you to transition the border on and off state while
 *    keeping color changes instantenously.
 */
export const defineMuiTab = ({ Tabs: { Transition }, Text }: DesignSystem): Components['MuiTab'] => ({
  styleOverrides: {
    root: {
      transition: Transition,
      position: 'relative',
      boxSizing: 'border-box',
      opacity: 1,
      whiteSpace: 'nowrap',
      minHeight: 0, // It's 48px by default in Mui
      minWidth: 0, // It's 90px by default in Mui, but we want it smaller
      maxWidth: 'none', // It's 360px by default in Mui, but that sometimes interferes when displaying fewer tabs than expected (dynamic tab list)
      '&::after': {
        content: '""',
        position: 'absolute',
        height: BORDER_SIZE,
        '.MuiTabs-vertical &': {
          height: '100%',
          width: BORDER_SIZE,
          left: 0,
          top: 0,
        },
      },
      [`& .${TAB_SUFFIX_CLASS}`]: {
        color: Text.TextColors.Tertiary,
      },
      [`&:hover .${TAB_SUFFIX_CLASS}`]: {
        color: 'inherit',
      },
      [`&.Mui-selected .${TAB_SUFFIX_CLASS}`]: {
        color: Text.TextColors.Secondary,
      },
    },
  },
})

/** Build tab styles for default, hover, and selected. */
const buildBaseStyles = ({ Label, Fill, Outline }: TabStyle, inset?: string) => ({
  color: Label,
  backgroundColor: Fill,
  '::after': {
    backgroundColor: Outline ?? 'transparent',
    inset,
  },
})

/** Build tab state styles for default, hover, and selected. */
const buildTabStateStylesByVariant = ({ Current, Default, Hover, Inset }: TabVariant) => ({
  ...buildBaseStyles(Default, Inset),
  '&:hover': buildBaseStyles(Hover, Inset),
  '&.Mui-selected': buildBaseStyles(Current, Inset),
})

/** Build breakpoint-aware padding styles for a tab. */
const tabPaddingStyles = ({ blockStart, blockEnd, inlineStart, inlineEnd }: TabPadding) => ({
  ...handleBreakpoints({
    paddingBlockStart: Spacing[blockStart as keyof typeof Spacing] ?? blockStart,
    paddingBlockEnd: Spacing[blockEnd as keyof typeof Spacing] ?? blockEnd,
    paddingInlineStart: Spacing[inlineStart as keyof typeof Spacing] ?? inlineStart,
    paddingInlineEnd: Spacing[inlineEnd as keyof typeof Spacing] ?? inlineEnd,
  }),
})

/** Build selectors that target inactive tabs per variant. */
const inactiveTabSelector = ({ hideInactiveBorders }: { hideInactiveBorders: boolean }, ...variants: string[]) =>
  variants
    .map(
      (variant) =>
        `&.${variant}${hideInactiveBorders ? `.${HIDE_INACTIVE_BORDERS_CLASS}` : ''} .MuiTab-root:not(.Mui-selected):not(:hover)::after`,
    )
    .join(', ')

/** Build per-size tab styles scoped for each orientation. */
const buildTabStylesBySize = (scope: 'root' | 'vertical', overrideStyles?: TabStyleOptions) =>
  fromEntries(
    recordValues(DEFAULT_TAB_STYLES_BY_SIZE).map(
      (defaultStyles) =>
        [
          `&${scope === 'vertical' ? '.MuiTabs-vertical' : ''}.${defaultStyles.className} .MuiTab-root`,
          {
            ...tabPaddingStyles({ ...defaultStyles.padding, ...overrideStyles?.padding }),
            height: overrideStyles?.height ?? defaultStyles.height,
          },
        ] as const,
    ),
  )

/** Tab styles for each sizes and for both orientations */
const muiTabStylesBySize = ({ root, vertical }: TabSizeStyleOptions) => ({
  ...buildTabStylesBySize('root', root),
  ...buildTabStylesBySize('vertical', vertical),
})

/** Tab styles for both orientation. */
const muiTabStyles = ({ root, vertical }: { root: CSSObject; vertical?: CSSObject }) => ({
  '& .MuiTab-root': {
    justifyContent: 'flex-end',
    alignItems: 'center',
    ...root,
  },
  '&.MuiTabs-vertical .MuiTab-root': {
    justifyContent: 'center',
    ...vertical,
  },
})

// note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
export const defineMuiTabs = ({
  Tabs: { UnderLined, OverLined, Contained },
  Layer,
}: DesignSystem): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      minHeight: 0, // It's 48px by default in Mui, but we want it smaller
      position: 'relative', // For absolute positioning of scroll buttons
      [`&.${contained}`]: {
        ...muiTabStyles({
          root: {
            ...buildTabStateStylesByVariant(Contained),
          },
        }),
        ...muiTabStylesBySize({
          root: { padding: { blockEnd: 'xxs' } },
        }),
        '& .MuiTab-root:not(.Mui-selected):not(:last-child)': {
          marginRight: `${CONTAINED_TABS_MARGIN_RIGHT}px`,
        },
        '&.MuiTabs-vertical .MuiTab-root:not(.Mui-selected):not(:last-child)': {
          marginRight: 0,
          marginBottom: '1px',
        },
      },

      [`&.${overlined}`]: {
        ...muiTabStyles({
          root: {
            ...buildTabStateStylesByVariant(OverLined),
            justifyContent: 'center',
          },
        }),
        ...muiTabStylesBySize({}),
      },

      [`&.${underlined}`]: {
        ...muiTabStyles({
          root: {
            ...buildTabStateStylesByVariant(UnderLined),
            justifyContent: 'flex-end',
          },
          vertical: {
            justifyContent: 'center',
          },
        }),
        ...muiTabStylesBySize({
          root: { padding: { blockEnd: 'xs' } },
        }),
      },

      // Inactive tabs have a smaller border size
      [inactiveTabSelector({ hideInactiveBorders: false }, overlined, underlined)]: {
        height: BORDER_SIZE_INACTIVE,
        '.MuiTabs-vertical &': {
          height: '100%',
          width: BORDER_SIZE_INACTIVE,
        },
      },

      // ExtraExtraLarge tabs don't have a border hover for the underlined/overlined variants
      // Also override and hide inactive borders if configured so
      [`${inactiveTabSelector({ hideInactiveBorders: true }, overlined, underlined)}, &.${extraExtraLarge} .MuiTab-root::after`]:
        {
          height: '0px !important',
          '.MuiTabs-vertical &': {
            width: '0px !important',
          },
        },

      // Style scroll buttons (arrows) when tabs overflow
      '& .MuiTabScrollButton-root': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 1,
        color: Contained.Current.Outline,
        opacity: 1,
        backgroundColor: Layer[1].Fill,
        minWidth: 'auto',
        width: 'auto',
        '&:first-of-type': {
          left: 0,
        },
        '&:last-of-type': {
          right: 0,
        },
        '&.Mui-disabled': {
          opacity: 0,
        },
      },
    },
    indicator: {
      backgroundColor: Layer.Highlight.Outline,
      [`.${overlined} &`]: { top: 0 },
      [`.${contained} &`]: { top: 0 },

      [`.${extraExtraLarge} &`]: {
        height: BORDER_SIZE_LARGE,
      },

      '.MuiTabs-vertical &': {
        left: 0,
        right: 'auto',
        width: BORDER_SIZE,
      },
      [`.MuiTabs-vertical.${extraExtraLarge} &`]: {
        width: BORDER_SIZE_LARGE,
      },
    },
  },
})
