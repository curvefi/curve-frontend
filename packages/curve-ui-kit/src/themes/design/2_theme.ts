import { alpha } from '@mui/material'
import { Blues, Grays, Greens, Reds, Yellows, Oranges, Violets, TransitionFunction } from './0_primitives'
import { SurfacesAndText } from './1_surfaces_text'

const { plain, inverted } = SurfacesAndText
const Transition = `all ${TransitionFunction}`
const InsetOverline = '0 0 auto' as const
const InsetUnderline = 'auto 0 0' as const

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

export const createLightDesign = (Light: typeof plain.Light | typeof inverted.Light) => {
  const Color = {
    Neutral: {
      '25': Grays['25'],
      '50': Grays['50'],
      '75': Grays['75'],
      '100': Grays['100'],
      '150': Grays['150'],
      '200': Grays['200'],
      '300': Grays['300'],
      '400': Grays['400'],
      '500': Grays['500'],
      '600': Grays['600'],
      '700': Grays['700'],
      '750': Grays['750'],
      '800': Grays['800'],
      '850': Grays['850'],
      '900': Grays['900'],
      '950': Grays['950'],
      '975': Grays['975'],
    },
    Primary: {
      '50': Violets['50'],
      '100': Violets['100'],
      '200': Violets['200'],
      '300': Violets['300'],
      '400': Violets['400'],
      '500': Violets['500'],
      '600': Violets['600'],
      '700': Violets['700'],
      '800': Violets['800'],
      '900': Violets['900'],
      '950': Violets['950'],
    },
    Secondary: {
      '100': Greens['100'],
      '200': Greens['200'],
      '300': Greens['300'],
      '400': Greens['400'],
      '500': Greens['500'],
      '600': Greens['600'],
      '700': Greens['700'],
      '800': Greens['800'],
    },
    Tertiary: {
      '200': Reds['200'],
      '300': Yellows['500'],
      '400': Oranges['500'],
      '600': Reds['500'],
    },
  } as const
  const Layer = {
    '1': {
      Fill: plain.Chad.Layer['1'].Fill,
      Outline: plain.Chad.Layer['1'].Outline,
    },
    '2': {
      Fill: plain.Chad.Layer['2'].Fill,
      Outline: plain.Chad.Layer['2'].Outline,
    },
    '3': {
      Fill: plain.Chad.Layer['3'].Fill,
      Outline: plain.Chad.Layer['3'].Outline,
    },
    Highlight: {
      Outline: Color.Primary['500'],
      Fill: plain.Chad.Layer.Highlight,
    },
    App: {
      Background: '#bdbbecff',
    },
    TypeAction: {
      Selected: plain.Chad.Layer.TypeAction.Selected,
      Hover: plain.Chad.Layer.TypeAction.Hover,
    },
    Feedback: {
      Warning: plain.Chad.Layer.Feedback.Warning,
      Success: plain.Chad.Layer.Feedback.Success,
      Error: plain.Chad.Layer.Feedback.Error,
      Info: plain.Chad.Layer.Feedback.Info,
    },
  } as const
  const Text = {
    TextColors: {
      Primary: plain.Chad.Text.Primary,
      Secondary: plain.Chad.Text.Secondary,
      Tertiary: plain.Chad.Text.Tertiary,
      Highlight: plain.Chad.Text.Highlight,
      Disabled: plain.Chad.Text.Disabled,
      Feedback: {
        Success: plain.Chad.Text.Feedback.Success,
        Error: plain.Chad.Text.Feedback.Error,
        Warning: plain.Chad.Text.Feedback.Warning,
      },
      FilledFeedback: {
        Info: {
          Primary: plain.Chad.Text.FilledFeedback.Info.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: plain.Chad.Text.FilledFeedback.Highlight.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: plain.Chad.Text.FilledFeedback.Warning.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: plain.Chad.Text.FilledFeedback.Alert.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: plain.Chad.Text.FilledFeedback.Success.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Success.Secondary,
        },
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
    Primary: {
      Default: {
        Label: Grays['50'],
        Fill: Violets['950'],
      },
      Hover: {
        Label: Grays['50'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violets['200'],
      },
    },
    Focus_Outline_Width: 2,
    Focus_Outline: Color.Primary['600'],
    Secondary: {
      Default: {
        Label: Grays['50'],
        Fill: Grays['900'],
      },
      Hover: {
        Label: Grays['50'],
        Fill: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Grays['600'],
      },
    },
    Ghost: {
      Default: {
        Label: Text.TextColors.Highlight,
      },
      Hover: {
        Label: Violets['800'],
        Fill: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violets['200'],
      },
    },
    Radius: {
      Md: undefined,
      Xs: undefined,
      Sm: undefined,
      Lg: undefined,
    },
    Success: {
      Default: {
        Label: Grays['900'],
        Fill: Greens['400'],
      },
      Hover: {
        Label: Greens['500'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: plain.Chad.Text.Disabled,
        Fill: Greens['600'],
      },
    },
    Error: {
      Default: {
        Label: Grays['50'],
        Fill: Reds['500'],
      },
      Hover: {
        Label: Oranges['500'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: Grays['300'],
        Fill: Reds['700'],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Tertiary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer['1'].Fill,
      },
      Current: {
        Label: Grays['50'],
        Fill: Layer.Highlight.Fill,
      },
    },
    Outlined: {
      Default: {
        Label: Grays['950'],
        Outline: Grays['950'],
      },
      Hover: {
        Label: Violets['500'],
        Outline: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Outline: Violets['200'],
      },
    },
    Transition: 'Transition',
  } as const
  const Tabs = {
    Contained: {
      Default: {
        Label: plain.Chad.Text.FilledFeedback.Highlight.Secondary,
        Fill: Color.Primary['950'],
      },
      Hover: {
        Label: Color.Neutral['50'],
        Fill: Color.Primary['800'],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Fill: Layer['1'].Fill,
        Outline: Color.Primary['500'],
      },
    },
    UnderLined: {
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer['2'].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary['500'],
      },
      'Container border': Layer['1'].Outline,
    },
    OverLined: {
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer['2'].Outline,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Outline: Color.Neutral['500'],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary['500'],
      },
    },
    Transition: 'Transition',
  } as const
  const Chips = {
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer['1'].Fill,
      Stroke: plain.Chad.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral['50'],
      Fill: Color.Primary['950'],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer['2'].Fill,
      Outline: Layer.Highlight.Outline,
    },
    BorderRadius: {
      Clickable: '0',
      NonClickable: '6.25rem' /* 100px */,
    },
  } as const
  const Badges = {
    Border: {
      Default: plain.Chad.Badges.Border.Default,
      Active: plain.Chad.Badges.Border.Active,
      Alert: plain.Chad.Badges.Border.Alert,
      Highlight: plain.Chad.Badges.Border.Highlight,
      Warning: plain.Chad.Badges.Border.Warning,
      Accent: plain.Chad.Badges.Border.Accent,
    },
    Label: {
      Default: plain.Chad.Badges.Label.Default,
      Active: plain.Chad.Badges.Label.Active,
      Alert: plain.Chad.Badges.Label.Alert,
      Highlight: plain.Chad.Badges.Label.Highlight,
      Warning: plain.Chad.Badges.Label.Warning,
      Accent: plain.Chad.Badges.Label.Accent,
    },
    Fill: {
      Default: plain.Chad.Badges.Fill.Default,
      Active: plain.Chad.Badges.Fill.Active,
      Alert: plain.Chad.Badges.Fill.Alert,
      Highlight: plain.Chad.Badges.Fill.Highlight,
      Warning: plain.Chad.Badges.Fill.Warning,
      Accent: plain.Chad.Badges.Fill.Accent,
    },
  } as const
  const Chart = {
    Candles: {
      Positive: Greens['400'],
      Negative: Reds['600'],
    },
    Lines: {
      Positive: Greens['400'],
      Negative: Reds['600'],
      Line1: Color.Primary['500'],
      Line2: Yellows['500'],
      'Line 3': Color.Secondary['500'],
    },
    LiquidationZone: {
      Current: Yellows['400'],
      Future: Blues['200'],
    },
  } as const
  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Primary['300'],
    },
    Hover: {
      Label: Text.TextColors.Highlight,
      Fill: Layer['3'].Fill,
    },
    Current: {
      Label: Grays['50'],
      Fill: Color.Primary['800'],
    },
  } as const
  const Table = {
    Header: {
      Fill: plain.Chad.Tables.Header.Fill,
      Label: {
        Default: plain.Chad.Tables.Header.Label.Default,
        Hover: plain.Chad.Tables.Header.Label.Active,
        Active: plain.Chad.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: plain.Chad.Tables.Row.Default,
      Selected: plain.Chad.Tables.Row.Selected,
      Hover: plain.Chad.Tables.Row.Hover,
    },
  } as const
  const InputBaseDefaultFill = Grays['100']
  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays['100'],
          Active: Grays['100'],
        },
        Border: {
          Default: Grays['200'],
          Error: Reds['500'],
          Active: Violets['400'],
          Filled: Violets['600'],
        },
      },
      Nested: {
        Nested: Grays['50'],
        Fill: Violets['50'],
        Border: {
          Default: Grays['200'],
          Active: Violets['400'],
          Filled: Violets['400'],
          Error: Reds['500'],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays['100'],
        Outline: Grays['200'],
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
    Default: { Fill: Layer['1'].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
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

export const createDarkDesign = (Dark: typeof plain.Dark | typeof inverted.Dark) => {
  const Color = {
    Neutral: {
      '25': Grays['25'],
      '50': Grays['50'],
      '75': Grays['75'],
      '100': Grays['100'],
      '150': Grays['150'],
      '200': Grays['200'],
      '300': Grays['300'],
      '400': Grays['400'],
      '500': Grays['500'],
      '600': Grays['600'],
      '700': Grays['700'],
      '750': Grays['750'],
      '800': Grays['800'],
      '850': Grays['850'],
      '900': Grays['900'],
      '950': Grays['950'],
      '975': Grays['975'],
    },
    Primary: {
      '50': Violets['50'],
      '100': Violets['100'],
      '200': Violets['200'],
      '300': Violets['300'],
      '400': Violets['400'],
      '500': Violets['500'],
      '600': Violets['600'],
      '700': Violets['700'],
      '800': Violets['800'],
      '900': Violets['900'],
      '950': Violets['950'],
    },
    Secondary: {
      '100': Greens['100'],
      '200': Greens['200'],
      '300': Greens['300'],
      '400': Greens['400'],
      '500': Greens['500'],
      '600': Greens['600'],
      '700': Greens['700'],
      '800': Greens['800'],
    },
    Tertiary: {
      '200': Reds['200'],
      '300': Yellows['500'],
      '400': Oranges['500'],
      '600': Reds['500'],
    },
  } as const
  const Layer = {
    '1': {
      Fill: plain.Chad.Layer['1'].Fill,
      Outline: plain.Chad.Layer['1'].Outline,
    },
    '2': {
      Fill: plain.Chad.Layer['2'].Fill,
      Outline: plain.Chad.Layer['2'].Outline,
    },
    '3': {
      Fill: plain.Chad.Layer['3'].Fill,
      Outline: plain.Chad.Layer['3'].Outline,
    },
    Highlight: {
      Outline: Color.Primary['500'],
      Fill: plain.Chad.Layer.Highlight,
    },
    App: {
      Background: '#bdbbecff',
    },
    TypeAction: {
      Selected: plain.Chad.Layer.TypeAction.Selected,
      Hover: plain.Chad.Layer.TypeAction.Hover,
    },
    Feedback: {
      Warning: plain.Chad.Layer.Feedback.Warning,
      Success: plain.Chad.Layer.Feedback.Success,
      Error: plain.Chad.Layer.Feedback.Error,
      Info: plain.Chad.Layer.Feedback.Info,
    },
  } as const
  const Text = {
    TextColors: {
      Primary: plain.Chad.Text.Primary,
      Secondary: plain.Chad.Text.Secondary,
      Tertiary: plain.Chad.Text.Tertiary,
      Highlight: plain.Chad.Text.Highlight,
      Disabled: plain.Chad.Text.Disabled,
      Feedback: {
        Success: plain.Chad.Text.Feedback.Success,
        Error: plain.Chad.Text.Feedback.Error,
        Warning: plain.Chad.Text.Feedback.Warning,
      },
      FilledFeedback: {
        Info: {
          Primary: plain.Chad.Text.FilledFeedback.Info.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: plain.Chad.Text.FilledFeedback.Highlight.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: plain.Chad.Text.FilledFeedback.Warning.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: plain.Chad.Text.FilledFeedback.Alert.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: plain.Chad.Text.FilledFeedback.Success.Primary,
          Secondary: plain.Chad.Text.FilledFeedback.Success.Secondary,
        },
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
    Primary: {
      Default: {
        Label: Grays['50'],
        Fill: Violets['950'],
      },
      Hover: {
        Label: Grays['50'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violets['200'],
      },
    },
    Focus_Outline_Width: 2,
    Focus_Outline: Color.Primary['600'],
    Secondary: {
      Default: {
        Label: Grays['50'],
        Fill: Grays['900'],
      },
      Hover: {
        Label: Grays['50'],
        Fill: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Grays['600'],
      },
    },
    Ghost: {
      Default: {
        Label: Text.TextColors.Highlight,
      },
      Hover: {
        Label: Violets['800'],
        Fill: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violets['200'],
      },
    },
    Radius: {
      Md: undefined,
      Xs: undefined,
      Sm: undefined,
      Lg: undefined,
    },
    Success: {
      Default: {
        Label: Grays['900'],
        Fill: Greens['400'],
      },
      Hover: {
        Label: Greens['500'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: plain.Chad.Text.Disabled,
        Fill: Greens['600'],
      },
    },
    Error: {
      Default: {
        Label: Grays['50'],
        Fill: Reds['500'],
      },
      Hover: {
        Label: Oranges['500'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: Grays['300'],
        Fill: Reds['700'],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Tertiary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer['1'].Fill,
      },
      Current: {
        Label: Grays['50'],
        Fill: Layer.Highlight.Fill,
      },
    },
    Outlined: {
      Default: {
        Label: Grays['950'],
        Outline: Grays['950'],
      },
      Hover: {
        Label: Violets['500'],
        Outline: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Outline: Violets['200'],
      },
    },
    Transition: 'Transition',
  } as const
  const Tabs = {
    Contained: {
      Default: {
        Label: plain.Chad.Text.FilledFeedback.Highlight.Secondary,
        Fill: Color.Primary['950'],
      },
      Hover: {
        Label: Color.Neutral['50'],
        Fill: Color.Primary['800'],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Fill: Layer['1'].Fill,
        Outline: Color.Primary['500'],
      },
    },
    UnderLined: {
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer['2'].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary['500'],
      },
      'Container border': Layer['1'].Outline,
    },
    OverLined: {
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer['2'].Outline,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Outline: Color.Neutral['500'],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary['500'],
      },
    },
    Transition: 'Transition',
  } as const
  const Chips = {
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer['1'].Fill,
      Stroke: plain.Chad.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral['50'],
      Fill: Color.Primary['950'],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer['2'].Fill,
      Outline: Layer.Highlight.Outline,
    },
    BorderRadius: {
      Clickable: '0',
      NonClickable: '6.25rem' /* 100px */,
    },
  } as const
  const Badges = {
    Border: {
      Default: plain.Chad.Badges.Border.Default,
      Active: plain.Chad.Badges.Border.Active,
      Alert: plain.Chad.Badges.Border.Alert,
      Highlight: plain.Chad.Badges.Border.Highlight,
      Warning: plain.Chad.Badges.Border.Warning,
      Accent: plain.Chad.Badges.Border.Accent,
    },
    Label: {
      Default: plain.Chad.Badges.Label.Default,
      Active: plain.Chad.Badges.Label.Active,
      Alert: plain.Chad.Badges.Label.Alert,
      Highlight: plain.Chad.Badges.Label.Highlight,
      Warning: plain.Chad.Badges.Label.Warning,
      Accent: plain.Chad.Badges.Label.Accent,
    },
    Fill: {
      Default: plain.Chad.Badges.Fill.Default,
      Active: plain.Chad.Badges.Fill.Active,
      Alert: plain.Chad.Badges.Fill.Alert,
      Highlight: plain.Chad.Badges.Fill.Highlight,
      Warning: plain.Chad.Badges.Fill.Warning,
      Accent: plain.Chad.Badges.Fill.Accent,
    },
  } as const
  const Chart = {
    Candles: {
      Positive: Greens['400'],
      Negative: Reds['600'],
    },
    Lines: {
      Positive: Greens['400'],
      Negative: Reds['600'],
      Line1: Color.Primary['500'],
      Line2: Yellows['500'],
      'Line 3': Color.Secondary['500'],
    },
    LiquidationZone: {
      Current: Yellows['400'],
      Future: Blues['200'],
    },
  } as const
  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Primary['300'],
    },
    Hover: {
      Label: Text.TextColors.Highlight,
      Fill: Layer['3'].Fill,
    },
    Current: {
      Label: Grays['50'],
      Fill: Color.Primary['800'],
    },
  } as const
  const Table = {
    Header: {
      Fill: plain.Chad.Tables.Header.Fill,
      Label: {
        Default: plain.Chad.Tables.Header.Label.Default,
        Hover: plain.Chad.Tables.Header.Label.Active,
        Active: plain.Chad.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: plain.Chad.Tables.Row.Default,
      Selected: plain.Chad.Tables.Row.Selected,
      Hover: plain.Chad.Tables.Row.Hover,
    },
  } as const
  const InputBaseDefaultFill = Grays['100']
  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays['100'],
          Active: Grays['100'],
        },
        Border: {
          Default: Grays['200'],
          Error: Reds['500'],
          Active: Violets['400'],
          Filled: Violets['600'],
        },
      },
      Nested: {
        Nested: Grays['50'],
        Fill: Violets['50'],
        Border: {
          Default: Grays['200'],
          Active: Violets['400'],
          Filled: Violets['400'],
          Error: Reds['500'],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays['100'],
        Outline: Grays['200'],
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
    Default: { Fill: Layer['1'].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
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

export const createChadDesign = (Chad: typeof plain.Chad | typeof inverted.Chad) => {
  const Color = {
    Neutral: {
      '25': Grays['25'],
      '50': Grays['50'],
      '75': Grays['75'],
      '100': Grays['100'],
      '150': Grays['150'],
      '200': Grays['200'],
      '300': Grays['300'],
      '400': Grays['400'],
      '500': Grays['500'],
      '600': Grays['600'],
      '700': Grays['700'],
      '750': Grays['750'],
      '800': Grays['800'],
      '850': Grays['850'],
      '900': Grays['900'],
      '950': Grays['950'],
      '975': Grays['975'],
    },
    Primary: {
      '50': Violets['50'],
      '100': Violets['100'],
      '200': Violets['200'],
      '300': Violets['300'],
      '400': Violets['400'],
      '500': Violets['500'],
      '600': Violets['600'],
      '700': Violets['700'],
      '800': Violets['800'],
      '900': Violets['900'],
      '950': Violets['950'],
    },
    Secondary: {
      '100': Greens['100'],
      '200': Greens['200'],
      '300': Greens['300'],
      '400': Greens['400'],
      '500': Greens['500'],
      '600': Greens['600'],
      '700': Greens['700'],
      '800': Greens['800'],
    },
    Tertiary: {
      '200': Reds['200'],
      '300': Yellows['500'],
      '400': Oranges['500'],
      '600': Reds['500'],
    },
  } as const
  const Layer = {
    '1': {
      Fill: Chad.Layer['1'].Fill,
      Outline: Chad.Layer['1'].Outline,
    },
    '2': {
      Fill: Chad.Layer['2'].Fill,
      Outline: Chad.Layer['2'].Outline,
    },
    '3': {
      Fill: Chad.Layer['3'].Fill,
      Outline: Chad.Layer['3'].Outline,
    },
    Highlight: {
      Outline: Color.Primary['500'],
      Fill: Chad.Layer.Highlight,
    },
    App: {
      Background: '#bdbbecff',
    },
    TypeAction: {
      Selected: Chad.Layer.TypeAction.Selected,
      Hover: Chad.Layer.TypeAction.Hover,
    },
    Feedback: {
      Warning: Chad.Layer.Feedback.Warning,
      Success: Chad.Layer.Feedback.Success,
      Error: Chad.Layer.Feedback.Error,
      Info: Chad.Layer.Feedback.Info,
    },
  } as const
  const Text = {
    TextColors: {
      Primary: Chad.Text.Primary,
      Secondary: Chad.Text.Secondary,
      Tertiary: Chad.Text.Tertiary,
      Highlight: Chad.Text.Highlight,
      Disabled: Chad.Text.Disabled,
      Feedback: {
        Success: Chad.Text.Feedback.Success,
        Error: Chad.Text.Feedback.Error,
        Warning: Chad.Text.Feedback.Warning,
      },
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
    },
    FontFamily: {
      Heading: 'Minecraft',
      Body: 'Hubot Sans',
      Mono: 'Hubot Sans',
      Button: 'Minecraft',
    },
  } as const
  const Button = {
    Primary: {
      Default: {
        Label: Grays['50'],
        Fill: Violets['950'],
      },
      Hover: {
        Label: Grays['50'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violets['200'],
      },
    },
    Focus_Outline_Width: 2,
    Focus_Outline: Color.Primary['600'],
    Secondary: {
      Default: {
        Label: Grays['50'],
        Fill: Grays['900'],
      },
      Hover: {
        Label: Grays['50'],
        Fill: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Grays['600'],
      },
    },
    Ghost: {
      Default: {
        Label: Text.TextColors.Highlight,
      },
      Hover: {
        Label: Violets['800'],
        Fill: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violets['200'],
      },
    },
    Radius: {
      Md: undefined,
      Xs: undefined,
      Sm: undefined,
      Lg: undefined,
    },
    Success: {
      Default: {
        Label: Grays['900'],
        Fill: Greens['400'],
      },
      Hover: {
        Label: Greens['500'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: Chad.Text.Disabled,
        Fill: Greens['600'],
      },
    },
    Error: {
      Default: {
        Label: Grays['50'],
        Fill: Reds['500'],
      },
      Hover: {
        Label: Oranges['500'],
        Fill: Grays['900'],
      },
      Disabled: {
        Label: Grays['300'],
        Fill: Reds['700'],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Tertiary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer['1'].Fill,
      },
      Current: {
        Label: Grays['50'],
        Fill: Layer.Highlight.Fill,
      },
    },
    Outlined: {
      Default: {
        Label: Grays['950'],
        Outline: Grays['950'],
      },
      Hover: {
        Label: Violets['500'],
        Outline: Violets['500'],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Outline: Violets['200'],
      },
    },
    Transition: 'Transition',
  } as const
  const Tabs = {
    Contained: {
      Default: {
        Label: Chad.Text.FilledFeedback.Highlight.Secondary,
        Fill: Color.Primary['950'],
      },
      Hover: {
        Label: Color.Neutral['50'],
        Fill: Color.Primary['800'],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Fill: Layer['1'].Fill,
        Outline: Color.Primary['500'],
      },
    },
    UnderLined: {
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer['2'].Outline,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Outline: Layer.Highlight.Outline,
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary['500'],
      },
      'Container border': Layer['1'].Outline,
    },
    OverLined: {
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer['2'].Outline,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Outline: Color.Neutral['500'],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary['500'],
      },
    },
    Transition: 'Transition',
  } as const
  const Chips = {
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer['1'].Fill,
      Stroke: Chad.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral['50'],
      Fill: Color.Primary['950'],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer['2'].Fill,
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
    Candles: {
      Positive: Greens['400'],
      Negative: Reds['600'],
    },
    Lines: {
      Positive: Greens['400'],
      Negative: Reds['600'],
      Line1: Color.Primary['500'],
      Line2: Yellows['500'],
      'Line 3': Color.Secondary['500'],
    },
    LiquidationZone: {
      Current: Yellows['400'],
      Future: Blues['200'],
    },
  } as const
  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Primary['300'],
    },
    Hover: {
      Label: Text.TextColors.Highlight,
      Fill: Layer['3'].Fill,
    },
    Current: {
      Label: Grays['50'],
      Fill: Color.Primary['800'],
    },
  } as const
  const Table = {
    Header: {
      Fill: Chad.Tables.Header.Fill,
      Label: {
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
  const InputBaseDefaultFill = Grays['100']
  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays['100'],
          Active: Grays['100'],
        },
        Border: {
          Default: Grays['200'],
          Error: Reds['500'],
          Active: Violets['400'],
          Filled: Violets['600'],
        },
      },
      Nested: {
        Nested: Grays['50'],
        Fill: Violets['50'],
        Border: {
          Default: Grays['200'],
          Active: Violets['400'],
          Filled: Violets['400'],
          Error: Reds['500'],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays['100'],
        Outline: Grays['200'],
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
    Default: { Fill: Layer['1'].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
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
