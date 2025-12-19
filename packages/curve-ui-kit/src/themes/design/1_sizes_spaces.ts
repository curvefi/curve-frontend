import { Sizing, Spacing } from './0_primitives'

const MappedSpacing = {
  '3xs': { mobile: Spacing[75], tablet: Spacing[75], desktop: Spacing[75] },
  xxs: { mobile: Spacing[100], tablet: Spacing[100], desktop: Spacing[100] },
  xs: { mobile: Spacing[100], tablet: Spacing[200], desktop: Spacing[200] },
  sm: { mobile: Spacing[200], tablet: Spacing[300], desktop: Spacing[300] },
  md: { mobile: Spacing[300], tablet: Spacing[400], desktop: Spacing[400] },
  lg: { mobile: Spacing[400], tablet: Spacing[500], desktop: Spacing[500] },
  xl: { mobile: Spacing[500], tablet: Spacing[600], desktop: Spacing[600] },
  xxl: { mobile: Spacing[600], tablet: Spacing[700], desktop: Spacing[700] },
  '3xl': { mobile: Spacing[700], tablet: Spacing[800], desktop: Spacing[800] },
} as const

const MappedSizing = {
  xxs: { mobile: Sizing[50], tablet: Sizing[100], desktop: Sizing[100] },
  xs: { mobile: Sizing[150], tablet: Sizing[200], desktop: Sizing[200] },
  sm: { mobile: Sizing[200], tablet: Sizing[300], desktop: Sizing[300] },
  md: { mobile: Sizing[300], tablet: Sizing[400], desktop: Sizing[400] },
  lg: { mobile: Sizing[400], tablet: Sizing[500], desktop: Sizing[500] },
  xl: { mobile: Sizing[500], tablet: Sizing[600], desktop: Sizing[600] },
  xxl: { mobile: Sizing[600], tablet: Sizing[700], desktop: Sizing[700] },
  '3xl': { mobile: Sizing[700], tablet: Sizing[800], desktop: Sizing[800] },
} as const

const MappedIconSize = {
  xxs: { mobile: Sizing[100], tablet: Sizing[125], desktop: Sizing[125] },
  xs: { mobile: Sizing[125], tablet: Sizing[150], desktop: Sizing[150] },
  sm: { mobile: Sizing[150], tablet: Sizing[200], desktop: Sizing[200] },
  md: { mobile: Sizing[250], tablet: Sizing[250], desktop: Sizing[250] },
  lg: { mobile: Sizing[300], tablet: Sizing[350], desktop: Sizing[350] },
  xl: { mobile: Sizing[400], tablet: Sizing[500], desktop: Sizing[500] },
  xxl: { mobile: Sizing[500], tablet: Sizing[600], desktop: Sizing[600] },
  '3xl': { mobile: Sizing[600], tablet: Sizing[700], desktop: Sizing[700] },
  '4xl': { mobile: Sizing[700], tablet: Sizing[800], desktop: Sizing[800] },
} as const

const MappedGrid = {
  Column_Spacing: { mobile: Spacing[300], tablet: Spacing[400], desktop: Spacing[500] },
  Row_Spacing: { mobile: Spacing[300], tablet: Spacing[400], desktop: Spacing[500] },
} as const

const MappedFontSize = {
  xs: { mobile: Sizing[125], tablet: Sizing[125], desktop: Sizing[125] },
  sm: { mobile: Sizing[150], tablet: Sizing[150], desktop: Sizing[150] },
  md: { mobile: Sizing[200], tablet: Sizing[200], desktop: Sizing[200] },
  lg: { mobile: Sizing[250], tablet: Sizing[300], desktop: Sizing[300] },
  xl: { mobile: Sizing[350], tablet: Sizing[400], desktop: Sizing[400] },
  xxl: { mobile: Sizing[500], tablet: Sizing[600], desktop: Sizing[700] },
} as const

const MappedButtonSize = {
  xxs: Sizing[150], // 14px
  xs: Sizing[300], // 24px
  sm: Sizing[500], // 40px
  md: Sizing[600], // 48px
  lg: Sizing[650], // 56px
}

const SliderHeight = {
  small: { mobile: Sizing[200], tablet: Sizing[200], desktop: Sizing[200] },
  medium: { mobile: Sizing[300], tablet: Sizing[300], desktop: Sizing[300] },
} as const
const SliderThumbWidth = {
  small: { mobile: Sizing[150], tablet: Sizing[150], desktop: Sizing[150] },
  medium: { mobile: Sizing[200], tablet: Sizing[200], desktop: Sizing[200] },
} as const

const MappedFontWeight = {
  Extra_Light: 200,
  Light: 300,
  Normal: 400,
  Medium: 500,
  Semi_Bold: 600,
  Bold: 700,
  Extra_Bold: 800,
} as const

const MappedLineHeight = {
  xs: {
    mobile: '0.75rem', // 12px
    tablet: '0.75rem', // 12px
    desktop: '0.875rem', // 14px
  },
  sm: {
    mobile: '0.875rem', // 14px
    tablet: '0.875rem', // 14px
    desktop: '1rem', // 16px
  },
  md: {
    mobile: '1.5rem', // 24px
    tablet: '1.5rem', // 24px
    desktop: '1.5rem', // 24px
  },
  lg: {
    mobile: '1.5rem', // 24px
    tablet: '1.5rem', // 24px
    desktop: '2rem', // 32px
  },
  xl: {
    mobile: '2rem', // 32px
    tablet: '2rem', // 32px
    desktop: '2.5rem', // 40px
  },
  xxl: {
    mobile: '2.5rem', // 40px
    tablet: '2.5rem', // 40px
    desktop: '4rem', // 64px
  },
} as const

const MappedModalWidth = {
  xs: '19rem', // 304px
  sm: '24rem', // 384px
  md: '28rem', // 448px
  lg: '32rem', // 512px
  xl: '36rem', // 576px
}

const MappedModalHeight = {
  sm: '100dvh',
  md: '80dvh',
}
const MappedColumnWidth = { sm: 125, md: 200, lg: 350 }
export const SizesAndSpaces = {
  Spacing: MappedSpacing,
  Sizing: MappedSizing,
  IconSize: MappedIconSize,
  ButtonSize: MappedButtonSize,
  Grid: MappedGrid,
  FontSize: MappedFontSize,
  FontWeight: MappedFontWeight,
  LineHeight: MappedLineHeight,
  OutlineWidth: '0.125rem', // 2px
  Slider: { Height: SliderHeight, ThumbWidth: SliderThumbWidth },
  Width: { modal: MappedModalWidth, column: MappedColumnWidth },
  MinWidth: {
    tableHeader: '50rem', // 800px
    select: '5rem', // 80px
    twoCardLayout: 961, // matches old action card breakpoint (in px)
  },
  MaxWidth: {
    disclaimer: '43rem', // 688px
    tableTitle: '67rem', // 1072px
    table: '96rem', // 1536px
    banner: '96rem', // 1536px
    footer: '96rem', // 1536px
    connectWallet: '50rem', // 800px
    actionCard: '28rem', // 448px
    legacyActionCard: '29rem', // 464px // only used in the scrvusd action card which isn't refactored to use the new token inputs yet
    emptyStateCard: '27.5rem', // 440px
    section: '59.5rem', // 952px
    tooltip: '27.5rem', // 440px
    sliderInput: {
      sm: '5rem', // 80px
      md: '6.25rem', // 100px
      bands: '6.8rem', // 108.8px
    },
  },
  Height: {
    modal: MappedModalHeight,
    row: Sizing[700],
    userPositionsTitle: Sizing[500],
  },
  MinHeight: {
    tableNoResults: { sm: '15vh', lg: '35vh' },
    pageContent: '80vh',
  },
  MaxHeight: {
    popover: '17rem', // 272px
    tokenSelector: '47rem', // 752px
    userEventsTable: '28.875rem', // 462px
    drawer: '80vh',
  },
  Inset: {
    scrollUpButton: {
      mobile: '1.25rem', // 20px
      tablet: '4rem', // 64px
      desktop: '4rem', // 64px
    },
  },
} as const
