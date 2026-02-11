import { alpha } from '@mui/material'
import { Blues, Grays, Greens, Oranges, Reds, Transparent, Violets, Yellows } from './0_primitives'
import { SurfacesAndText } from './1_surfaces_text'

/* TOKENS-STUDIO:BEGIN_THEME_CONSTANTS */
const ImportedThemeConstants = {
  "light": {
    "appBackground": "#f0edeb",
    "slider": {
      "default": {
        "SliderThumbImage": "/mui/slider-thumb-white.svg",
        "SliderThumbImageVertical": "/mui/slider-thumb-white-90.svg"
      },
      "hover": {
        "SliderThumbImage": "/mui/slider-thumb-white.svg",
        "SliderThumbImageVertical": "/mui/slider-thumb-white-90.svg"
      }
    }
  },
  "dark": {
    "appBackground": "#12110f",
    "slider": {
      "default": {
        "SliderThumbImage": "/mui/slider-thumb-blue.svg",
        "SliderThumbImageVertical": "/mui/slider-thumb-blue-90.svg"
      },
      "hover": {
        "SliderThumbImage": "/mui/slider-thumb-white.svg",
        "SliderThumbImageVertical": "/mui/slider-thumb-white-90.svg"
      }
    }
  },
  "chad": {
    "appBackground": "#bdbbec",
    "slider": {
      "default": {
        "SliderThumbImage": "/mui/slider-thumb-white.svg",
        "SliderThumbImageVertical": "/mui/slider-thumb-white-90.svg"
      },
      "hover": {
        "SliderThumbImage": "/mui/slider-thumb-white.svg",
        "SliderThumbImageVertical": "/mui/slider-thumb-white-90.svg"
      }
    }
  }
} as const
/* TOKENS-STUDIO:END_THEME_CONSTANTS */

/* TOKENS-STUDIO:BEGIN_THEME_FLAT */
const ImportedThemeFlat = {
  "light": {
    "Button.Error.Default.Fill": "#ed242f",
    "Button.Error.Default.Label & Icon": "#fdfcfc",
    "Button.Error.Disabled.Fill": "#8c111c",
    "Button.Error.Disabled.Label & Icon": "#968e84",
    "Button.Error.Hover.Fill": "#fdfcfc",
    "Button.Error.Hover.Label & Icon": "#ed242f",
    "Button.Focus Outline": "#3162f4",
    "Button.Focus Outline Width": "2px",
    "Button.Ghost.Default.Label & Icon": "#3162f4",
    "Button.Ghost.Disabled.Fill": "#968e84",
    "Button.Ghost.Disabled.Label & Icon": "#968e84",
    "Button.Ghost.Hover.Fill": "#ffffff00",
    "Button.Ghost.Hover.Label & Icon": "#191815",
    "Button.Navigation.Current.Fill": "#3162f4",
    "Button.Navigation.Current.Label & Icon": "#fdfcfc",
    "Button.Navigation.Default.Label & Icon": "#5a554f",
    "Button.Navigation.Hover.Fill": "#f8f7f7",
    "Button.Navigation.Hover.Label & Icon": "#1f1e1b",
    "Button.Outlined.Default.Label & Icon": "#1f1e1b",
    "Button.Outlined.Default.Outline": "#1f1e1b",
    "Button.Outlined.Disabled.Label & Icon": "#968e84",
    "Button.Outlined.Disabled.Outline": "#968e84",
    "Button.Outlined.Hover.Label & Icon": "#3162f4",
    "Button.Outlined.Hover.Outline": "#3162f4",
    "Button.Primary.Default.Fill": "#27b86c",
    "Button.Primary.Default.Label & Icon": "#f8f7f7",
    "Button.Primary.Disabled.Fill": "#d5dbf0",
    "Button.Primary.Disabled.Label & Icon": "#968e84",
    "Button.Primary.Hover.Fill": "#1f1e1b",
    "Button.Primary.Hover.Label & Icon": "#f8f7f7",
    "Button.Radius.lg": "0px",
    "Button.Radius.md": "0px",
    "Button.Radius.sm": "0px",
    "Button.Radius.xs": "0px",
    "Button.Secondary.Default.Fill": "#1f1e1b",
    "Button.Secondary.Default.Label & Icon": "#f8f7f7",
    "Button.Secondary.Disabled.Fill": "#bbb6af",
    "Button.Secondary.Disabled.Label & Icon": "#968e84",
    "Button.Secondary.Hover.Fill": "#3162f4",
    "Button.Secondary.Hover.Label & Icon": "#f8f7f7",
    "Button.Success.Default.Fill": "#27b86c",
    "Button.Success.Default.Label & Icon": "#252420",
    "Button.Success.Disabled.Fill": "#167d4a",
    "Button.Success.Disabled.Label & Icon": "#968e84",
    "Button.Success.Hover.Fill": "#252420",
    "Button.Success.Hover.Label & Icon": "#27b86c"
  },
  "dark": {
    "Button.Error.Default.Fill": "#ed242f",
    "Button.Error.Default.Label & Icon": "#fdfcfc",
    "Button.Error.Disabled.Fill": "#8c111c",
    "Button.Error.Disabled.Label & Icon": "#968e84",
    "Button.Error.Hover.Fill": "#fdfcfc",
    "Button.Error.Hover.Label & Icon": "#ed242f",
    "Button.Focus Outline": "#3162f4",
    "Button.Focus Outline Width": "2px",
    "Button.Ghost.Default.Label & Icon": "#5a81f3",
    "Button.Ghost.Disabled.Fill": "#302e2a",
    "Button.Ghost.Disabled.Label & Icon": "#2747b5",
    "Button.Ghost.Hover.Fill": "#ffffff00",
    "Button.Ghost.Hover.Label & Icon": "#f8f7f7",
    "Button.Navigation.Current.Fill": "#fefaef",
    "Button.Navigation.Current.Label & Icon": "#191815",
    "Button.Navigation.Default.Label & Icon": "#bbb6af",
    "Button.Navigation.Hover.Fill": "#1f1e1b",
    "Button.Navigation.Hover.Label & Icon": "#f8f7f7",
    "Button.Outlined.Default.Label & Icon": "#f8f7f7",
    "Button.Outlined.Default.Outline": "#f8f7f7",
    "Button.Outlined.Disabled.Label & Icon": "#968e84",
    "Button.Outlined.Disabled.Outline": "#968e84",
    "Button.Outlined.Hover.Label & Icon": "#5a81f3",
    "Button.Outlined.Hover.Outline": "#5a81f3",
    "Button.Primary.Default.Fill": "#3162f4",
    "Button.Primary.Default.Label & Icon": "#f8f7f7",
    "Button.Primary.Disabled.Fill": "#acbef1",
    "Button.Primary.Disabled.Label & Icon": "#968e84",
    "Button.Primary.Hover.Fill": "#f8f7f7",
    "Button.Primary.Hover.Label & Icon": "#252420",
    "Button.Radius.lg": "0px",
    "Button.Radius.md": "0px",
    "Button.Radius.sm": "0px",
    "Button.Radius.xs": "0px",
    "Button.Secondary.Default.Fill": "#f8f7f7",
    "Button.Secondary.Default.Label & Icon": "#252420",
    "Button.Secondary.Disabled.Fill": "#494540",
    "Button.Secondary.Disabled.Label & Icon": "#968e84",
    "Button.Secondary.Hover.Fill": "#3162f4",
    "Button.Secondary.Hover.Label & Icon": "#f8f7f7",
    "Button.Success.Default.Fill": "#27b86c",
    "Button.Success.Default.Label & Icon": "#252420",
    "Button.Success.Disabled.Fill": "#167d4a",
    "Button.Success.Disabled.Label & Icon": "#968e84",
    "Button.Success.Hover.Fill": "#252420",
    "Button.Success.Hover.Label & Icon": "#27b86c"
  },
  "chad": {
    "Button.Error.Default.Fill": "#ed242f",
    "Button.Error.Default.Label & Icon": "#fdfcfc",
    "Button.Error.Disabled.Fill": "#8c111c",
    "Button.Error.Disabled.Label & Icon": "#968e84",
    "Button.Error.Hover.Fill": "#fdfcfc",
    "Button.Error.Hover.Label & Icon": "#ed242f",
    "Button.Focus Outline": "#6a68b7",
    "Button.Focus Outline Width": "2px",
    "Button.Ghost.Default.Label & Icon": "#5f5cae",
    "Button.Ghost.Disabled.Fill": "#968e84",
    "Button.Ghost.Disabled.Label & Icon": "#968e84",
    "Button.Ghost.Hover.Fill": "#ffffff00",
    "Button.Ghost.Hover.Label & Icon": "#4a4395",
    "Button.Navigation.Current.Fill": "#4a4395",
    "Button.Navigation.Current.Label & Icon": "#fdfcfc",
    "Button.Navigation.Default.Label & Icon": "#5a554f",
    "Button.Navigation.Hover.Fill": "#e7e4e2",
    "Button.Navigation.Hover.Label & Icon": "#1f1e1b",
    "Button.Outlined.Default.Label & Icon": "#1f1e1b",
    "Button.Outlined.Default.Outline": "#1f1e1b",
    "Button.Outlined.Disabled.Label & Icon": "#968e84",
    "Button.Outlined.Disabled.Outline": "#968e84",
    "Button.Outlined.Hover.Label & Icon": "#6a68b7",
    "Button.Outlined.Hover.Outline": "#6a68b7",
    "Button.Primary.Default.Fill": "#2f2862",
    "Button.Primary.Default.Label & Icon": "#f8f7f7",
    "Button.Primary.Disabled.Fill": "#c6c4f2",
    "Button.Primary.Disabled.Label & Icon": "#968e84",
    "Button.Primary.Hover.Fill": "#252420",
    "Button.Primary.Hover.Label & Icon": "#f8f7f7",
    "Button.Radius.lg": "0px",
    "Button.Radius.md": "0px",
    "Button.Radius.sm": "0px",
    "Button.Radius.xs": "0px",
    "Button.Secondary.Default.Fill": "#252420",
    "Button.Secondary.Default.Label & Icon": "#f8f7f7",
    "Button.Secondary.Disabled.Fill": "#746e66",
    "Button.Secondary.Disabled.Label & Icon": "#968e84",
    "Button.Secondary.Hover.Fill": "#6a68b7",
    "Button.Secondary.Hover.Label & Icon": "#f8f7f7",
    "Button.Success.Default.Fill": "#27b86c",
    "Button.Success.Default.Label & Icon": "#252420",
    "Button.Success.Disabled.Fill": "#167d4a",
    "Button.Success.Disabled.Label & Icon": "#968e84",
    "Button.Success.Hover.Fill": "#252420",
    "Button.Success.Hover.Label & Icon": "#27b86c"
  }
} as const
/* TOKENS-STUDIO:END_THEME_FLAT */

const InsetOverline = '0 0 auto' as const // Top border only
const InsetUnderline = 'auto 0 0' as const // Bottom border only

const SliderBackground = {
  Safe: { 25: Reds[400], 50: Reds[300], 75: Reds[200], 100: Greens[500] },
  Danger: { 25: Reds[200], 50: Reds[300], 75: Reds[400], 100: Reds[500] },
  Disabled: {
    25: alpha(Grays[300], 0.5),
    50: alpha(Grays[300], 0.5),
    75: alpha(Grays[300], 0.5),
    100: alpha(Grays[300], 0.5),
  },
} as const

type ThemeName = 'light' | 'dark' | 'chad'

const getThemeStringToken = (theme: ThemeName, path: string, fallback: string) => {
  const value = (ImportedThemeFlat as Record<ThemeName, Record<string, unknown>>)[theme]?.[path]
  return typeof value === 'string' ? value : fallback
}

export const createLightDesign = (
  Light: typeof SurfacesAndText.plain.Light | typeof SurfacesAndText.inverted.Light,
) => {
  const theme: ThemeName = 'light'

  const Color = {
    Neutral: Grays,
    Primary: Blues,
    Secondary: Greens,
    Tertiary: {
      '200': Reds[200],
      '300': Yellows[500],
      '400': Oranges[500],
      '600': Reds[500],
    },
  } as const

  const Layer = {
    '1': {
      Fill: Light.Layer[1].Fill,
      Outline: Light.Layer[1].Outline,
    },
    '2': {
      Fill: Light.Layer[2].Fill,
      Outline: Light.Layer[2].Outline,
    },
    '3': {
      Fill: Light.Layer[3].Fill,
      Outline: Light.Layer[3].Outline,
    },
    App: {
      Background: ImportedThemeConstants.light.appBackground,
    },
    Feedback: {
      Info: Light.Layer.Feedback.Info,
      Success: Light.Layer.Feedback.Success,
      Warning: Light.Layer.Feedback.Warning,
      Error: Light.Layer.Feedback.Error,
    },
    TypeAction: {
      Selected: Light.Layer.TypeAction.Selected,
      Hover: Light.Layer.TypeAction.Hover,
    },
    Highlight: {
      Fill: Light.Layer.Highlight,
      Outline: Color.Primary[500],
    },
  } as const

  const Text = {
    TextColors: {
      Primary: Light.Text.Primary,
      Secondary: Light.Text.Secondary,
      Tertiary: Light.Text.Tertiary,
      Highlight: Light.Text.Highlight,
      Disabled: Light.Text.Disabled,
      FilledFeedback: {
        Info: {
          Primary: Light.Text.FilledFeedback.Info.Primary,
          Secondary: Light.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: Light.Text.FilledFeedback.Highlight.Primary,
          Secondary: Light.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: Light.Text.FilledFeedback.Warning.Primary,
          Secondary: Light.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: Light.Text.FilledFeedback.Alert.Primary,
          Secondary: Light.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: Light.Text.FilledFeedback.Success.Primary,
          Secondary: Light.Text.FilledFeedback.Success.Secondary,
        },
      },
      Feedback: {
        Success: Light.Text.Feedback.Success,
        Warning: Light.Text.Feedback.Warning,
        Error: Light.Text.Feedback.Error,
        Inverted: getThemeStringToken(theme, 'Text.Feedback.Inverted', Grays[50]),
      },
    },
    FontFamily: {
      Heading: 'Mona Sans',
      Body: 'Mona Sans',
      Mono: 'Mona Sans',
      Button: 'Mona Sans',
    },
  } as const

  const Button = {
    Focus_Outline_Width: getThemeStringToken(theme, 'Button.Focus Outline Width', '0.125rem'), // 2px
    Focus_Outline: getThemeStringToken(theme, 'Button.Focus Outline', Color.Primary[500]),
    Radius: {
      xs: getThemeStringToken(theme, 'Button.Radius.xs', '0'),
      sm: getThemeStringToken(theme, 'Button.Radius.sm', '0'),
      md: getThemeStringToken(theme, 'Button.Radius.md', '0'),
      lg: getThemeStringToken(theme, 'Button.Radius.lg', '0'),
    },
    Primary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Primary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Default.Fill', Blues[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Primary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Hover.Fill', Grays[950]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Primary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Primary.Disabled.Fill', Color.Primary[100]),
      },
    },
    Secondary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Default.Fill', Grays[950]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Hover.Fill', Blues[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Disabled.Fill', Color.Neutral[400]),
      },
    },
    Outlined: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Default.Label & Icon', Text.TextColors.Primary),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Default.Outline', Text.TextColors.Primary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Hover.Label & Icon', Blues[500]),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Hover.Outline', Blues[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Disabled.Label & Icon', Text.TextColors.Disabled),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Disabled.Outline', Text.TextColors.Disabled),
      },
    },
    Ghost: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Default.Label & Icon', Text.TextColors.Highlight),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Hover.Label & Icon', Grays[975]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Hover.Fill', Transparent),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Disabled.Fill', Transparent),
      },
    },
    Success: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Success.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Success.Default.Fill', Greens[400]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Success.Hover.Label & Icon', Greens[400]),
        Fill: getThemeStringToken(theme, 'Button.Success.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Success.Disabled.Label & Icon', Light.Text.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Success.Disabled.Fill', Greens[600]),
      },
    },
    Error: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Error.Default.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Error.Default.Fill', Reds[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Error.Hover.Label & Icon', Reds[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Hover.Fill', Grays[10]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Error.Disabled.Label & Icon', Grays[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Disabled.Fill', Reds[800]),
      },
    },
    Navigation: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Default.Label & Icon', Text.TextColors.Tertiary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Hover.Label & Icon', Text.TextColors.Primary),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Hover.Fill', Layer[1].Fill),
      },
      Current: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Current.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Current.Fill', Layer.Highlight.Fill),
      },
    },
    Transition: 'Transition',
  } as const

  const Tabs = {
    UnderLined: {
      Inset: InsetUnderline,
      Container_Border: Light.Layer[1].Outline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
    Contained: {
      Default: {
        Label: Text.TextColors.Secondary,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
        Outline: Color.Primary[500],
      },
    },
    OverLined: {
      Inset: InsetOverline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
    Transition: 'Transition',
  } as const

  const Chips = {
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer[1].Fill,
      Stroke: Light.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral[50],
      Fill: Color.Neutral[900],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[2].Fill,
      Outline: Layer.Highlight.Outline,
    },
    BorderRadius: {
      Clickable: '0',
      NonClickable: '6.25rem', // 100px
    },
  } as const

  const Badges = {
    Border: {
      Default: Light.Badges.Border.Default,
      Active: Light.Badges.Border.Active,
      Alert: Light.Badges.Border.Alert,
      Highlight: Light.Badges.Border.Highlight,
      Warning: Light.Badges.Border.Warning,
      Accent: Light.Badges.Border.Accent,
    },
    Label: {
      Default: Light.Badges.Label.Default,
      Active: Light.Badges.Label.Active,
      Alert: Light.Badges.Label.Alert,
      Highlight: Light.Badges.Label.Highlight,
      Warning: Light.Badges.Label.Warning,
      Accent: Light.Badges.Label.Accent,
    },
    Fill: {
      Default: Light.Badges.Fill.Default,
      Active: Light.Badges.Fill.Active,
      Alert: Light.Badges.Fill.Alert,
      Highlight: Light.Badges.Fill.Highlight,
      Warning: Light.Badges.Fill.Warning,
      Accent: Light.Badges.Fill.Accent,
    },
  } as const

  const Chart = {
    LiquidationZone: {
      Current: Yellows[400],
      Future: Blues[200],
    },
    Candles: {
      Positive: Greens[400],
      Negative: Reds[600],
    },
    Lines: {
      Positive: Greens[400],
      Negative: Reds[600],
      Line1: Color.Primary[500],
      Line2: Yellows[500],
      Line3: Color.Secondary[500],
    },
  } as const

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Neutral[100],
    },
    Hover: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[3].Fill,
    },
    Current: {
      Label: Grays[50],
      Fill: Color.Neutral[900],
    },
  } as const

  const Table = {
    Header: {
      Fill: Light.Tables.Header.Fill,
      'Label_&_icon': {
        Default: Light.Tables.Header.Label.Default,
        Hover: Light.Tables.Header.Label.Hover,
        Active: Light.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: Light.Tables.Row.Default,
      Selected: Light.Tables.Row.Selected,
      Hover: Light.Tables.Row.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays[100],
          Active: Grays[50],
        },
        Border: {
          Default: Grays[200],
          Active: Light.Text.Highlight,
          Filled: Grays[850],
          Error: Reds[500],
        },
      },
      Nested: {
        Nested: Grays[10],
        Fill: Grays[100],
        Border: {
          Default: Grays[400],
          Active: Light.Text.Highlight,
          Filled: Grays[850],
          Error: Reds[500],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays[100],
        Outline: Grays[200],
      },
    },
  } as const

  const Sliders = {
    default: ImportedThemeConstants.light.slider.default,
    hover: ImportedThemeConstants.light.slider.hover,
    SliderBackground: { ...SliderBackground, Filled: { 100: Color.Primary[200] } },
  } as const

  const Switch = {
    Default: { Fill: Layer[1].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
    Checked: { Fill: Color.Primary[500], Outline: Color.Neutral[400], Label: Grays[50] },
  } as const

  return {
    theme: 'light',
    Color,
    Text,
    Button,
    Layer,
    Tabs,
    Chips,
    Badges,
    Chart,
    Toggles,
    Table,
    Inputs,
    Switch,
    Sliders,
  } as const
}

export const createDarkDesign = (Dark: typeof SurfacesAndText.plain.Dark | typeof SurfacesAndText.inverted.Dark) => {
  const theme: ThemeName = 'dark'

  const Color = {
    Neutral: {
      '25': Grays[975],
      '50': Grays[950],
      '75': Grays[900],
      '100': Grays[850],
      '150': Grays[800],
      '200': Grays[750],
      '300': Grays[700],
      '400': Grays[600],
      '500': Grays[500],
      '600': Grays[400],
      '700': Grays[300],
      '750': Grays[200],
      '800': Grays[150],
      '850': Grays[100],
      '900': Grays[75],
      '950': Grays[50],
      '975': Grays[25],
    },
    Primary: {
      '50': Blues[950],
      '100': Blues[900],
      '200': Blues[800],
      '300': Blues[700],
      '400': Blues[600],
      '500': Blues[500],
      '600': Blues[400],
      '700': Blues[300],
      '800': Blues[200],
      '900': Blues[100],
      '950': Blues[50],
    },
    Secondary: {
      '100': Greens[800],
      '200': Greens[700],
      '300': Greens[600],
      '400': Greens[500],
      '500': Greens[400],
      '600': Greens[300],
      '700': Greens[200],
      '800': Greens[100],
    },
    Tertiary: {
      '200': Reds[800],
      '300': Oranges[500],
      '400': Yellows[500],
      '600': Yellows[400],
    },
  } as const

  const Layer = {
    '1': {
      Fill: Dark.Layer[1].Fill,
      Outline: Dark.Layer[1].Outline,
    },
    '2': {
      Fill: Dark.Layer[2].Fill,
      Outline: Dark.Layer[2].Outline,
    },
    '3': {
      Fill: Dark.Layer[3].Fill,
      Outline: Dark.Layer[3].Outline,
    },
    App: {
      Background: ImportedThemeConstants.dark.appBackground,
    },
    Feedback: {
      Info: Dark.Layer.Feedback.Info,
      Success: Dark.Layer.Feedback.Success,
      Warning: Dark.Layer.Feedback.Warning,
      Error: Dark.Layer.Feedback.Error,
    },
    TypeAction: {
      Selected: Dark.Layer.TypeAction.Selected,
      Hover: Dark.Layer.TypeAction.Hover,
    },
    Highlight: {
      Fill: Dark.Layer.Highlight,
      Outline: Color.Primary[500],
    },
  } as const

  const Text = {
    TextColors: {
      Primary: Dark.Text.Primary,
      Secondary: Dark.Text.Secondary,
      Tertiary: Dark.Text.Tertiary,
      Highlight: Dark.Text.Highlight,
      Disabled: Dark.Text.Disabled,
      FilledFeedback: {
        Info: {
          Primary: Dark.Text.FilledFeedback.Info.Primary,
          Secondary: Dark.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: Dark.Text.FilledFeedback.Highlight.Primary,
          Secondary: Dark.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: Dark.Text.FilledFeedback.Warning.Primary,
          Secondary: Dark.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: Dark.Text.FilledFeedback.Alert.Primary,
          Secondary: Dark.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: Dark.Text.FilledFeedback.Success.Primary,
          Secondary: Dark.Text.FilledFeedback.Success.Secondary,
        },
      },
      Feedback: {
        Success: Dark.Text.Feedback.Success,
        Warning: Dark.Text.Feedback.Warning,
        Error: Dark.Text.Feedback.Error,
        Inverted: getThemeStringToken(theme, 'Text.Feedback.Inverted', Grays[950]),
      },
    },
    FontFamily: {
      Heading: 'Mona Sans',
      Body: 'Mona Sans',
      Mono: 'Mona Sans',
      Button: 'Mona Sans',
    },
  } as const

  const Button = {
    Focus_Outline_Width: getThemeStringToken(theme, 'Button.Focus Outline Width', '0.125rem'), // 2px
    Focus_Outline: getThemeStringToken(theme, 'Button.Focus Outline', Color.Primary[500]),
    Radius: {
      xs: getThemeStringToken(theme, 'Button.Radius.xs', '0'),
      sm: getThemeStringToken(theme, 'Button.Radius.sm', '0'),
      md: getThemeStringToken(theme, 'Button.Radius.md', '0'),
      lg: getThemeStringToken(theme, 'Button.Radius.lg', '0'),
    },
    Primary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Primary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Default.Fill', Blues[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Primary.Hover.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Hover.Fill', Grays[50]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Primary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Primary.Disabled.Fill', Color.Primary[800]),
      },
    },
    Secondary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Default.Fill', Grays[50]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Hover.Fill', Blues[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Disabled.Fill', Grays[750]),
      },
    },
    Outlined: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Default.Label & Icon', Text.TextColors.Primary),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Default.Outline', Text.TextColors.Primary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Hover.Label & Icon', Text.TextColors.Highlight),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Hover.Outline', Text.TextColors.Highlight),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Disabled.Label & Icon', Text.TextColors.Disabled),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Disabled.Outline', Text.TextColors.Disabled),
      },
    },
    Ghost: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Default.Label & Icon', Text.TextColors.Highlight),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Hover.Fill', Transparent),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Disabled.Label & Icon', Blues[700]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Disabled.Fill', Transparent),
      },
    },
    Success: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Success.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Success.Default.Fill', Greens[400]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Success.Hover.Label & Icon', Greens[400]),
        Fill: getThemeStringToken(theme, 'Button.Success.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Success.Disabled.Label & Icon', Dark.Text.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Success.Disabled.Fill', Greens[600]),
      },
    },
    Error: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Error.Default.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Error.Default.Fill', Reds[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Error.Hover.Label & Icon', Reds[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Hover.Fill', Grays[10]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Error.Disabled.Label & Icon', Grays[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Disabled.Fill', Reds[800]),
      },
    },
    Navigation: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Default.Label & Icon', Text.TextColors.Tertiary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Hover.Label & Icon', Text.TextColors.Primary),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Hover.Fill', Layer[1].Fill),
      },
      Current: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Current.Label & Icon', Grays[975]),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Current.Fill', Layer.Highlight.Fill),
      },
    },
    Transition: 'Transition',
  } as const

  const Tabs = {
    UnderLined: {
      Inset: InsetUnderline,
      Container_Border: Dark.Layer[1].Outline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
    Contained: {
      Default: {
        Label: Text.TextColors.Secondary,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
        Outline: Color.Primary[500],
      },
    },
    OverLined: {
      Inset: InsetOverline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
    Transition: 'Transition',
  } as const

  const Chips = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Layer[1].Fill,
      Stroke: Dark.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral[50],
      Fill: Color.Neutral[900],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[1].Fill,
      Outline: Layer.Highlight.Outline,
    },
    BorderRadius: {
      Clickable: '0',
      NonClickable: '6.25rem', // 100px
    },
  } as const

  const Badges = {
    Border: {
      Default: Dark.Badges.Border.Default,
      Active: Dark.Badges.Border.Active,
      Alert: Dark.Badges.Border.Alert,
      Highlight: Dark.Badges.Border.Highlight,
      Warning: Dark.Badges.Border.Warning,
      Accent: Dark.Badges.Border.Accent,
    },
    Label: {
      Default: Dark.Badges.Label.Default,
      Active: Dark.Badges.Label.Active,
      Alert: Dark.Badges.Label.Alert,
      Highlight: Dark.Badges.Label.Highlight,
      Warning: Dark.Badges.Label.Warning,
      Accent: Dark.Badges.Label.Accent,
    },
    Fill: {
      Default: Dark.Badges.Fill.Default,
      Active: Dark.Badges.Fill.Active,
      Alert: Dark.Badges.Fill.Alert,
      Highlight: Dark.Badges.Fill.Highlight,
      Warning: Dark.Badges.Fill.Warning,
      Accent: Dark.Badges.Fill.Accent,
    },
  } as const

  const Chart = {
    LiquidationZone: {
      Current: Oranges[900],
      Future: Blues[800],
    },
    Candles: {
      Positive: Greens[300],
      Negative: Reds[500],
    },
    Lines: {
      Positive: Greens[300],
      Negative: Reds[500],
      Line1: Color.Primary[500],
      Line2: Yellows[500],
      Line3: Color.Secondary[500],
    },
  } as const

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Neutral[100],
    },
    Hover: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[3].Fill,
    },
    Current: {
      Label: Color.Neutral[50],
      Fill: Color.Neutral[950],
    },
  } as const

  const Table = {
    Header: {
      Fill: Dark.Tables.Header.Fill,
      'Label_&_icon': {
        Default: Dark.Tables.Header.Label.Default,
        Hover: Dark.Tables.Header.Label.Hover,
        Active: Dark.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: Dark.Tables.Row.Default,
      Selected: Dark.Tables.Row.Selected,
      Hover: Dark.Tables.Row.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays[900],
          Active: Grays[900],
        },
        Border: {
          Default: Grays[800],
          Active: Dark.Text.Highlight,
          Filled: Grays[75],
          Error: Reds[500],
        },
      },
      Nested: {
        Nested: Grays[850],
        Fill: Grays[850],
        Border: {
          Default: Grays[600],
          Active: Dark.Text.Highlight,
          Filled: Grays[75],
          Error: Reds[500],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays[900],
        Outline: Grays[800],
      },
    },
  } as const

  const Sliders = {
    default: ImportedThemeConstants.dark.slider.default,
    hover: ImportedThemeConstants.dark.slider.hover,
    SliderBackground: { ...SliderBackground, Filled: { 100: Color.Primary[200] } },
  } as const

  const Switch = {
    Default: { Fill: Layer[1].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
    Checked: { Fill: Color.Primary[500], Outline: Color.Neutral[400], Label: Grays[50] },
  } as const

  return {
    theme: 'dark',
    Color,
    Text,
    Button,
    Layer,
    Tabs,
    Chips,
    Badges,
    Chart,
    Toggles,
    Table,
    Inputs,
    Switch,
    Sliders,
  } as const
}

export const createChadDesign = (Chad: typeof SurfacesAndText.plain.Chad | typeof SurfacesAndText.inverted.Chad) => {
  const theme: ThemeName = 'chad'

  const Color = {
    Neutral: Grays,
    Primary: Violets,
    Secondary: Greens,
    Tertiary: {
      '200': Reds[200],
      '300': Yellows[500],
      '400': Oranges[500],
      '600': Reds[500],
    },
  } as const

  const Layer = {
    '1': {
      Fill: Chad.Layer[1].Fill,
      Outline: Chad.Layer[1].Outline,
    },
    '2': {
      Fill: Chad.Layer[2].Fill,
      Outline: Chad.Layer[2].Outline,
    },
    '3': {
      Fill: Chad.Layer[3].Fill,
      Outline: Chad.Layer[3].Outline,
    },
    App: {
      Background: ImportedThemeConstants.chad.appBackground,
    },
    Feedback: {
      Info: Chad.Layer.Feedback.Info,
      Success: Chad.Layer.Feedback.Success,
      Warning: Chad.Layer.Feedback.Warning,
      Error: Chad.Layer.Feedback.Error,
    },
    TypeAction: {
      Selected: Chad.Layer.TypeAction.Selected,
      Hover: Chad.Layer.TypeAction.Hover,
    },
    Highlight: {
      Fill: Chad.Layer.Highlight,
      Outline: Color.Primary[500],
    },
  } as const

  const Text = {
    TextColors: {
      Primary: Chad.Text.Primary,
      Secondary: Chad.Text.Secondary,
      Tertiary: Chad.Text.Tertiary,
      Highlight: Chad.Text.Highlight,
      Disabled: Chad.Text.Disabled,
      FilledFeedback: {
        Info: {
          Primary: Chad.Text.FilledFeedback.Info.Primary,
          Secondary: Chad.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: Chad.Text.FilledFeedback.Highlight.Primary,
          Secondary: Chad.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: Chad.Text.FilledFeedback.Warning.Primary,
          Secondary: Chad.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: Chad.Text.FilledFeedback.Alert.Primary,
          Secondary: Chad.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: Chad.Text.FilledFeedback.Success.Primary,
          Secondary: Chad.Text.FilledFeedback.Success.Secondary,
        },
      },
      Feedback: {
        Success: Chad.Text.Feedback.Success,
        Warning: Chad.Text.Feedback.Warning,
        Error: Chad.Text.Feedback.Error,
        Inverted: getThemeStringToken(theme, 'Text.Feedback.Inverted', Grays[50]),
      },
    },
    FontFamily: {
      Heading: 'Minecraft',
      Body: 'Hubot Sans',
      Mono: 'Hubot Sans',
      Button: 'Minecraft',
    },
  } as const

  const Button = {
    Focus_Outline_Width: getThemeStringToken(theme, 'Button.Focus Outline Width', '0.125rem'), // 2px
    Focus_Outline: getThemeStringToken(theme, 'Button.Focus Outline', Color.Primary[500]),
    Radius: {
      xs: getThemeStringToken(theme, 'Button.Radius.xs', '0'),
      sm: getThemeStringToken(theme, 'Button.Radius.sm', '0'),
      md: getThemeStringToken(theme, 'Button.Radius.md', '0'),
      lg: getThemeStringToken(theme, 'Button.Radius.lg', '0'),
    },
    Primary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Primary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Default.Fill', Violets[950]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Primary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Primary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Primary.Disabled.Fill', Violets[200]),
      },
    },
    Secondary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Default.Fill', Grays[900]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Hover.Fill', Violets[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Disabled.Fill', Grays[600]),
      },
    },
    Outlined: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Default.Label & Icon', Text.TextColors.Primary),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Default.Outline', Text.TextColors.Primary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Hover.Label & Icon', Violets[500]),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Hover.Outline', Violets[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Disabled.Label & Icon', Text.TextColors.Disabled),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Disabled.Outline', Text.TextColors.Disabled),
      },
    },
    Ghost: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Default.Label & Icon', Text.TextColors.Highlight),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Hover.Label & Icon', Violets[800]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Hover.Fill', Transparent),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Disabled.Fill', Transparent),
      },
    },
    Success: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Success.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Success.Default.Fill', Greens[400]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Success.Hover.Label & Icon', Greens[400]),
        Fill: getThemeStringToken(theme, 'Button.Success.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Success.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Success.Disabled.Fill', Greens[600]),
      },
    },
    Error: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Error.Default.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Error.Default.Fill', Reds[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Error.Hover.Label & Icon', Reds[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Hover.Fill', Grays[10]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Error.Disabled.Label & Icon', Grays[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Disabled.Fill', Reds[800]),
      },
    },
    Navigation: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Default.Label & Icon', Text.TextColors.Tertiary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Hover.Label & Icon', Text.TextColors.Primary),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Hover.Fill', Layer[1].Fill),
      },
      Current: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Current.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Current.Fill', Layer.Highlight.Fill),
      },
    },
    Transition: 'Transition',
  } as const

  const Tabs = {
    UnderLined: {
      Inset: InsetUnderline,
      Container_Border: Layer[1].Outline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
    Contained: {
      Default: {
        Label: Text.TextColors.Secondary,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
        Outline: Color.Primary[500],
      },
    },
    OverLined: {
      Inset: InsetOverline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
    Transition: 'Transition',
  } as const

  const Chips = {
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer[1].Fill,
      Stroke: Chad.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral[50],
      Fill: Color.Primary[950],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[2].Fill,
      Outline: Layer.Highlight.Outline,
    },
    BorderRadius: {
      Clickable: '0',
      NonClickable: '0',
    },
  } as const

  const Badges = {
    Border: {
      Default: Chad.Badges.Border.Default,
      Active: Chad.Badges.Border.Active,
      Alert: Chad.Badges.Border.Alert,
      Highlight: Chad.Badges.Border.Highlight,
      Warning: Chad.Badges.Border.Warning,
      Accent: Chad.Badges.Border.Accent,
    },
    Label: {
      Default: Chad.Badges.Label.Default,
      Active: Chad.Badges.Label.Active,
      Alert: Chad.Badges.Label.Alert,
      Highlight: Chad.Badges.Label.Highlight,
      Warning: Chad.Badges.Label.Warning,
      Accent: Chad.Badges.Label.Accent,
    },
    Fill: {
      Default: Chad.Badges.Fill.Default,
      Active: Chad.Badges.Fill.Active,
      Alert: Chad.Badges.Fill.Alert,
      Highlight: Chad.Badges.Fill.Highlight,
      Warning: Chad.Badges.Fill.Warning,
      Accent: Chad.Badges.Fill.Accent,
    },
  } as const

  const Chart = {
    LiquidationZone: {
      Current: Yellows[400],
      Future: Blues[200],
    },
    Candles: {
      Positive: Greens[400],
      Negative: Reds[600],
    },
    Lines: {
      Positive: Greens[400],
      Negative: Reds[600],
      Line1: Color.Primary[500],
      Line2: Yellows[500],
      Line3: Color.Secondary[500],
    },
  } as const

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Primary[300],
    },
    Hover: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[3].Fill,
    },
    Current: {
      Label: Grays[50],
      Fill: Color.Primary[800],
    },
  } as const

  const Table = {
    Header: {
      Fill: Chad.Tables.Header.Fill,
      'Label_&_icon': {
        Default: Chad.Tables.Header.Label.Default,
        Hover: Chad.Tables.Header.Label.Active,
        Active: Chad.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: Chad.Tables.Row.Default,
      Selected: Chad.Tables.Row.Selected,
      Hover: Chad.Tables.Row.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays[100],
          Active: Grays[100],
        },
        Border: {
          Default: Grays[400],
          Active: Violets[400],
          Filled: Violets[600],
          Error: Reds[500],
        },
      },
      Nested: {
        Nested: Grays[50],
        Fill: Violets[50],
        Border: {
          Default: Grays[200],
          Active: Violets[400],
          Filled: Violets[400],
          Error: Reds[500],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays[100],
        Outline: Grays[200],
      },
    },
  } as const

  const Sliders = {
    default: ImportedThemeConstants.chad.slider.default,
    hover: ImportedThemeConstants.chad.slider.hover,
    SliderBackground: { ...SliderBackground, Filled: { 100: Color.Primary[200] } },
  } as const

  const Switch = {
    Default: { Fill: Layer[1].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
    Checked: { Fill: Color.Primary[500], Outline: Color.Neutral[400], Label: Grays[50] },
  } as const

  return {
    theme: 'chad',
    Color,
    Text,
    Button,
    Layer,
    Tabs,
    Chips,
    Badges,
    Chart,
    Toggles,
    Table,
    Inputs,
    Switch,
    Sliders,
  } as const
}
