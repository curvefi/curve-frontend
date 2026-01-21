import { alpha } from '@mui/material'
import { Blues, Grays, Greens, Oranges, Reds, Transparent, Violets, Yellows } from './0_primitives'
import { SurfacesAndText } from './1_surfaces_text'

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

export const createLightDesign = (
  Light: typeof SurfacesAndText.plain.Light | typeof SurfacesAndText.inverted.Light,
) => {
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
      Background: '#f0edeb',
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
        Inverted: Grays[50],
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
    Focus_Outline_Width: '0.125rem', // 2px
    Focus_Outline: Color.Primary[500],
    Radius: {
      xs: '0',
      sm: '0',
      md: '0',
      lg: '0',
    },
    Primary: {
      Default: {
        Label: Grays[50],
        Fill: Blues[500],
      },
      Hover: {
        Label: Grays[50],
        Fill: Grays[950],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Color.Primary[100],
      },
    },
    Secondary: {
      Default: {
        Label: Grays[50],
        Fill: Grays[950],
      },
      Hover: {
        Label: Grays[50],
        Fill: Blues[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Color.Neutral[400],
      },
    },
    Outlined: {
      Default: {
        Label: Text.TextColors.Primary,
        Outline: Text.TextColors.Primary,
      },
      Hover: {
        Label: Blues[500],
        Outline: Blues[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Outline: Text.TextColors.Disabled,
      },
    },
    Ghost: {
      Default: {
        Label: Text.TextColors.Highlight,
      },
      Hover: {
        Label: Grays[975],
        Fill: Transparent,
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Transparent,
      },
    },
    Success: {
      Default: {
        Label: Grays[900],
        Fill: Greens[400],
      },
      Hover: {
        Label: Greens[400],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Light.Text.Disabled,
        Fill: Greens[600],
      },
    },
    Error: {
      Default: {
        Label: Grays[10],
        Fill: Reds[500],
      },
      Hover: {
        Label: Reds[500],
        Fill: Grays[10],
      },
      Disabled: {
        Label: Grays[500],
        Fill: Reds[800],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Tertiary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
      },
      Current: {
        Label: Grays[10],
        Fill: Layer.Highlight.Fill,
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
    default: {
      SliderThumbImage: '/mui/slider-thumb-white.svg',
      SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
    },
    hover: {
      SliderThumbImage: '/mui/slider-thumb-white.svg',
      SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
    },
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
      Background: '#12110f',
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
        Inverted: Grays[950],
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
    Focus_Outline_Width: '0.125rem', // 2px
    Focus_Outline: Color.Primary[500],
    Radius: {
      xs: '0',
      sm: '0',
      md: '0',
      lg: '0',
    },
    Primary: {
      Default: {
        Label: Grays[50],
        Fill: Blues[500],
      },
      Hover: {
        Label: Grays[900],
        Fill: Grays[50],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Color.Primary[800],
      },
    },
    Secondary: {
      Default: {
        Label: Grays[900],
        Fill: Grays[50],
      },
      Hover: {
        Label: Grays[50],
        Fill: Blues[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Grays[750],
      },
    },
    Outlined: {
      Default: {
        Label: Text.TextColors.Primary,
        Outline: Text.TextColors.Primary,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Text.TextColors.Highlight,
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Outline: Text.TextColors.Disabled,
      },
    },
    Ghost: {
      Default: {
        Label: Text.TextColors.Highlight,
      },
      Hover: {
        Label: Grays[50],
        Fill: Transparent,
      },
      Disabled: {
        Label: Blues[700],
        Fill: Transparent,
      },
    },
    Success: {
      Default: {
        Label: Grays[900],
        Fill: Greens[400],
      },
      Hover: {
        Label: Greens[400],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Dark.Text.Disabled,
        Fill: Greens[600],
      },
    },
    Error: {
      Default: {
        Label: Grays[10],
        Fill: Reds[500],
      },
      Hover: {
        Label: Reds[500],
        Fill: Grays[10],
      },
      Disabled: {
        Label: Grays[500],
        Fill: Reds[800],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Tertiary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
      },
      Current: {
        Label: Grays[975],
        Fill: Layer.Highlight.Fill,
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
    default: {
      SliderThumbImage: '/mui/slider-thumb-blue.svg',
      SliderThumbImageVertical: '/mui/slider-thumb-blue-90.svg',
    },
    hover: {
      SliderThumbImage: '/mui/slider-thumb-white.svg',
      SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
    },
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
      Background: '#bdbbec',
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
        Inverted: Grays[50],
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
    Focus_Outline_Width: '0.125rem', // 2px
    Focus_Outline: Color.Primary[500],
    Radius: {
      xs: '0',
      sm: '0',
      md: '0',
      lg: '0',
    },
    Primary: {
      Default: {
        Label: Grays[50],
        Fill: Violets[950],
      },
      Hover: {
        Label: Grays[50],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violets[200],
      },
    },
    Secondary: {
      Default: {
        Label: Grays[50],
        Fill: Grays[900],
      },
      Hover: {
        Label: Grays[50],
        Fill: Violets[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Grays[600],
      },
    },
    Outlined: {
      Default: {
        Label: Text.TextColors.Primary,
        Outline: Text.TextColors.Primary,
      },
      Hover: {
        Label: Violets[500],
        Outline: Violets[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Outline: Text.TextColors.Disabled,
      },
    },
    Ghost: {
      Default: {
        Label: Text.TextColors.Highlight,
      },
      Hover: {
        Label: Violets[800],
        Fill: Transparent,
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Transparent,
      },
    },
    Success: {
      Default: {
        Label: Grays[900],
        Fill: Greens[400],
      },
      Hover: {
        Label: Greens[400],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Greens[600],
      },
    },
    Error: {
      Default: {
        Label: Grays[10],
        Fill: Reds[500],
      },
      Hover: {
        Label: Reds[500],
        Fill: Grays[10],
      },
      Disabled: {
        Label: Grays[500],
        Fill: Reds[800],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Tertiary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
      },
      Current: {
        Label: Grays[10],
        Fill: Layer.Highlight.Fill,
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
    default: {
      SliderThumbImage: '/mui/slider-thumb-white.svg',
      SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
    },
    hover: {
      SliderThumbImage: '/mui/slider-thumb-white.svg',
      SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
    },
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
