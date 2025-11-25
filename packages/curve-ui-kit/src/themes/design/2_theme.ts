import { alpha } from '@mui/material'
import { Blues, Grays, Greens, Reds, Yellows, Oranges, Violets, TransitionFunction } from './0_primitives'
import { SurfacesAndText } from './1_surfaces_text'

const { plain, inverted } = SurfacesAndText

const Transition = `all ${TransitionFunction}`
const InsetOverline = '0 0 auto' as const
const InsetUnderline = 'auto 0 0' as const

const SliderBackground = {
  Safe: {
    25: Reds[400],
    50: Reds[300],
    75: Reds[200],
    100: Greens[500],
  },
  Danger: {
    25: Reds[200],
    50: Reds[300],
    75: Reds[400],
    100: Reds[500],
  },
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
        '50': Blues['50'],
        '100': Blues['100'],
        '200': Blues['200'],
        '300': Blues['300'],
        '400': Blues['400'],
        '500': Blues['500'],
        '600': Blues['600'],
        '700': Blues['700'],
        '800': Blues['800'],
        '900': Blues['900'],
        '950': Blues['950'],
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
        Fill: Light.Layer['1'].Fill,
        Outline: Light.Layer['1'].Outline,
      },
      '2': {
        Fill: Light.Layer['2'].Fill,
        Outline: Light.Layer['2'].Outline,
      },
      '3': {
        Fill: Light.Layer['3'].Fill,
        Outline: Light.Layer['3'].Outline,
      },
      App: {
        Background: '#f0edeb',
      },
      Feedback: {
        Informational: Light.Layer.Feedback.Info,
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
        Outline: Blues['500'],
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
            Primary: Light.Text.FilledFeedback.info.primary,
            Secondary: Light.Text.FilledFeedback.info.secondary,
          },
          Highlight: {
            Primary: Light.Text.FilledFeedback.highlight.primary,
            Secondary: Light.Text.FilledFeedback.highlight.secondary,
          },
          Warning: {
            Primary: Light.Text.FilledFeedback.warning.primary,
            Secondary: Light.Text.FilledFeedback.warning.secondary,
          },
          Alert: {
            Primary: Light.Text.FilledFeedback.alert.primary,
            Secondary: Light.Text.FilledFeedback.alert.secondary,
          },
          Success: {
            Primary: Light.Text.FilledFeedback.success.primary,
            Secondary: Light.Text.FilledFeedback.success.secondary,
          },
        },
        Feedback: {
          Success: Light.Text.Feedback.Success,
          Warning: Light.Text.Feedback.Warning,
          Error: Light.Text.Feedback.Error,
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
      Focus_Outline: Blues['500'],
      Radius: {
        xs: '0',
        sm: '0',
        md: '0',
        lg: '0',
      },
      Primary: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Blues['500'],
        },
        Hover: {
          'Label_&_Icon': Grays['50'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Light.Text.Disabled,
          Fill: Blues['100'],
        },
      },
      Secondary: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Grays['900'],
        },
        Hover: {
          'Label_&_Icon': Grays['50'],
          Fill: Blues['500'],
        },
        Disabled: {
          'Label_&_Icon': Light.Text.Disabled,
          Fill: Grays['600'],
        },
      },
      Outlined: {
        Default: {
          'Label_&_Icon': Grays['950'],
          Outline: Grays['300'],
        },
        Hover: {
          'Label_&_Icon': Blues['500'],
          Outline: Blues['500'],
        },
        Disabled: {
          'Label_&_Icon': Light.Text.Disabled,
          Outline: Light.Text.Disabled,
        },
      },
      Ghost: {
        Default: {
          'Label_&_Icon': Light.Text.Highlight,
        },
        Hover: {
          'Label_&_Icon': Grays['975'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Light.Text.Disabled,
          Fill: Grays['500'],
        },
      },
      Success: {
        Default: {
          'Label_&_Icon': Grays['900'],
          Fill: Greens['400'],
        },
        Hover: {
          'Label_&_Icon': Greens['300'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Light.Text.Disabled,
          Fill: Greens['600'],
        },
      },
      Error: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Reds['500'],
        },
        Hover: {
          'Label_&_Icon': Oranges['500'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Grays['300'],
          Fill: Reds['700'],
        },
      },
      Navigation: {
        Default: {
          'Label_&_Icon': Light.Text.Tertiary,
        },
        Hover: {
          'Label_&_Icon': Light.Text.Primary,
          'Label_&_Icon_2': Light.Text.Primary,
          Fill: Light.Layer['1'].Fill,
        },
        Current: {
          'Label_&_Icon': Grays['50'],
          Fill: Light.Layer.Highlight,
        },
      },
    } as const
  const Tabs = {
      UnderLined: {
        Container_Border: Light.Layer['1'].Outline,
        Default: {
          'Label_&_Icon': Light.Text.Secondary,
          Outline: Light.Layer['2'].Outline,
        },
        Hover: {
          'Label_&_Icon': Light.Text.Highlight,
          Outline: Blues['500'],
        },
        Current: {
          'Label_&_Icon': Light.Text.Primary,
          Outline: Blues['500'],
        },
      },
      Contained: {
        Default: {
          'Label_&_Icon': Light.Text.Secondary,
          Fill: Grays['300'],
        },
        Hover: {
          'Label_&_Icon': Grays['50'],
          Fill: Grays['900'],
        },
        Current: {
          'Label_&_Icon': Light.Text.Primary,
          Fill: Light.Layer['1'].Fill,
          Outline: Blues['500'],
        },
      },
      OverLined: {
        Default: {
          'Label_&_Icon': Light.Text.Secondary,
          Outline: Light.Layer['2'].Outline,
        },
        Hover: {
          'Label_&_Icon': Light.Text.Primary,
          Outline: Grays['500'],
        },
        Current: {
          'Label_&_Icon': Light.Text.Primary,
          Outline: Blues['500'],
        },
      },
    } as const
  const Chips = {
      Default: {
        'Label_&_Icon': Light.Text.Secondary,
        Fill: Light.Layer['2'].Fill,
        Stroke: Light.Badges.Border.Default,
      },
      Hover: {
        'Label_&_Icon': Grays['50'],
        Fill: Grays['900'],
      },
      Current: {
        'Label_&_Icon': Light.Text.Highlight,
        Fill: Light.Layer['2'].Fill,
        Outline: Blues['500'],
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
      Liquidation_Zone: {
        Current: Yellows['400'],
        Future: Blues['200'],
      },
      Candles: {
        Positive: Greens['400'],
        Negative: Reds['600'],
      },
      Lines: {
        Positive: Greens['400'],
        Negative: Reds['600'],
        Line_1: Blues['500'],
        Line_2: Yellows['500'],
        Line_3: Greens['500'],
      },
    } as const
  const Toggles = {
      Default: {
        'Label_&_Icon': Light.Text.Primary,
        Fill: Grays['100'],
      },
      Hover: {
        'Label_&_Icon': Light.Text.Highlight,
        Fill: Light.Layer['3'].Fill,
      },
      Current: {
        'Label_&_Icon': Grays['50'],
        Fill: Grays['900'],
      },
    } as const
  const Table = {
      Header: {
        Fill: Light.Tables.Header.Fill,
        'Label_&_icon': {
          Default: Light.Tables.Header['Label_&_Icon'].Default,
          Hover: Light.Tables.Header['Label_&_Icon'].Hover,
          Active: Light.Tables.Header['Label_&_Icon'].Active,
        },
      },
      Row: {
        Default: Light.Tables.Row.Default,
        Selected: Light.Tables.Row.Selected,
        Hover: Light.Tables.Row.Hover,
      },
    } as const
  const InputBaseDefaultFill = Grays['100']
  const Inputs = {
      Base: {
        Default: {
          Fill: {
            Default: Grays['100'],
            Active: Grays['50'],
          },
          Border: {
            Default: Grays['200'],
            Active: Light.Text.Highlight,
            Filled: Grays['850'],
            Error: Reds['500'],
          },
        },
        Nested: {
          Nested: Grays['10'],
          Fill: Grays['100'],
          Border: {
            Default: Grays['400'],
            Active: Light.Text.Highlight,
            Filled: Grays['850'],
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
    Default: {
      Fill: Layer[1].Fill,
      Outline: Color.Neutral[400],
      Label: Color.Primary[500],
    },
    Checked: {
      Fill: Color.Primary[500],
      Outline: Color.Neutral[400],
      Label: Grays[50], 
    },
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
        '25': Grays['975'],
        '50': Grays['950'],
        '75': Grays['900'],
        '100': Grays['850'],
        '150': Grays['800'],
        '200': Grays['750'],
        '300': Grays['700'],
        '400': Grays['600'],
        '500': Grays['500'],
        '600': Grays['400'],
        '700': Grays['300'],
        '750': Grays['200'],
        '800': Grays['150'],
        '850': Grays['100'],
        '900': Grays['75'],
        '950': Grays['50'],
        '975': Grays['25'],
      },
      Primary: {
        '50': Blues['950'],
        '100': Blues['900'],
        '200': Blues['800'],
        '300': Blues['700'],
        '400': Blues['600'],
        '500': Blues['500'],
        '600': Blues['400'],
        '700': Blues['300'],
        '800': Blues['200'],
        '900': Blues['100'],
        '950': Blues['50'],
      },
      Secondary: {
        '100': Greens['800'],
        '200': Greens['700'],
        '300': Greens['600'],
        '400': Greens['500'],
        '500': Greens['400'],
        '600': Greens['300'],
        '700': Greens['200'],
        '800': Greens['100'],
      },
      Tertiary: {
        '200': Reds['800'],
        '300': Oranges['500'],
        '400': Yellows['500'],
        '600': Yellows['400'],
      },
    } as const
  const Layer = {
      '1': {
        Fill: Dark.Layer['1'].Fill,
        Outline: Dark.Layer['1'].Outline,
      },
      '2': {
        Fill: Dark.Layer['2'].Fill,
        Outline: Dark.Layer['2'].Outline,
      },
      '3': {
        Fill: Dark.Layer['3'].Fill,
        Outline: Dark.Layer['3'].Outline,
      },
      App: {
        Background: '#12110f',
      },
      Feedback: {
        Informational: Dark.Layer.Feedback.Info,
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
        Outline: Blues['500'],
      },
    } as const
  const Text = {
      TextColors: {
        Primary: Dark.Text.primary,
        Secondary: Dark.Text.secondary,
        Tertiary: Dark.Text.tertiary,
        Highlight: Dark.Text.highlight,
        Disabled: Dark.Text.Disabled,
        FilledFeedback: {
          Info: {
            Primary: Dark.Text.FilledFeedback.info.primary,
            Secondary: Dark.Text.FilledFeedback.info.secondary,
          },
          Highlight: {
            Primary: Dark.Text.FilledFeedback.highlight.primary,
            Secondary: Dark.Text.FilledFeedback.highlight.secondary,
          },
          Warning: {
            Primary: Dark.Text.FilledFeedback.warning.primary,
            Secondary: Dark.Text.FilledFeedback.warning.secondary,
          },
          Alert: {
            Primary: Dark.Text.FilledFeedback.alert.primary,
            Secondary: Dark.Text.FilledFeedback.alert.secondary,
          },
          Success: {
            Primary: Dark.Text.FilledFeedback.success.primary,
            Secondary: Dark.Text.FilledFeedback.success.secondary,
          },
        },
        Feedback: {
          Success: Dark.Text.Feedback.Success,
          Warning: Dark.Text.Feedback.Warning,
          Error: Dark.Text.Feedback.Error,
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
      Focus_Outline: Blues['500'],
      Radius: {
        xs: '0',
        sm: '0',
        md: '0',
        lg: '0',
      },
      Primary: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Blues['500'],
        },
        Hover: {
          'Label_&_Icon': Grays['900'],
          Fill: Grays['50'],
        },
        Disabled: {
          'Label_&_Icon': Dark.Text.Disabled,
          Fill: Blues['200'],
        },
      },
      Secondary: {
        Default: {
          'Label_&_Icon': Grays['900'],
          Fill: Grays['50'],
        },
        Hover: {
          'Label_&_Icon': Grays['900'],
          Fill: Blues['500'],
        },
        Disabled: {
          'Label_&_Icon': Dark.Text.Disabled,
          Fill: Grays['400'],
        },
      },
      Outlined: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Outline: Grays['700'],
        },
        Hover: {
          'Label_&_Icon': Blues['500'],
          Outline: Blues['500'],
        },
        Disabled: {
          'Label_&_Icon': Dark.Text.Disabled,
          Outline: Dark.Text.Disabled,
        },
      },
      Ghost: {
        Default: {
          'Label_&_Icon': Blues['300'],
        },
        Hover: {
          'Label_&_Icon': Grays['50'],
          Fill: Grays['50'],
        },
        Disabled: {
          'Label_&_Icon': Dark.Text.Disabled,
          Fill: Grays['850'],
        },
      },
      Success: {
        Default: {
          'Label_&_Icon': Grays['900'],
          Fill: Greens['300'],
        },
        Hover: {
          'Label_&_Icon': Greens['500'],
          Fill: Grays['50'],
        },
        Disabled: {
          'Label_&_Icon': Dark.Text.Disabled,
          Fill: Greens['600'],
        },
      },
      Error: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Reds['500'],
        },
        Hover: {
          'Label_&_Icon': Oranges['500'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Grays['300'],
          Fill: Reds['700'],
        },
      },
      Navigation: {
        Default: {
          'Label_&_Icon': Dark.Text.tertiary,
        },
        Hover: {
          'Label_&_Icon': Dark.Text.primary,
          'Label_&_Icon_2': Dark.Text.primary,
          Fill: Dark.Layer['1'].Fill,
        },
        Current: {
          'Label_&_Icon': Grays['50'],
          Fill: Dark.Layer.Highlight,
        },
      },
    } as const
  const Tabs = {
      UnderLined: {
        Container_Border: Dark.Layer['1'].Outline,
        Default: {
          'Label_&_Icon': Dark.Text.secondary,
          Outline: Dark.Layer['2'].Outline,
        },
        Hover: {
          'Label_&_Icon': Dark.Text.highlight,
          Outline: Blues['500'],
        },
        Current: {
          'Label_&_Icon': Dark.Text.primary,
          Outline: Blues['500'],
        },
      },
      Contained: {
        Default: {
          'Label_&_Icon': Dark.Text.secondary,
          Fill: Grays['750'],
        },
        Hover: {
          'Label_&_Icon': Grays['950'],
          Fill: Grays['75'],
        },
        Current: {
          'Label_&_Icon': Dark.Text.primary,
          Fill: Dark.Layer['1'].Fill,
          Outline: Blues['500'],
        },
      },
      OverLined: {
        Default: {
          'Label_&_Icon': Dark.Text.secondary,
          Outline: Dark.Layer['2'].Outline,
        },
        Hover: {
          'Label_&_Icon': Dark.Text.primary,
          Outline: Grays['500'],
        },
        Current: {
          'Label_&_Icon': Dark.Text.primary,
          Outline: Blues['500'],
        },
      },
    } as const
  const Chips = {
      Default: {
        'Label_&_Icon': Dark.Text.primary,
        Fill: Dark.Layer['2'].Fill,
        Stroke: Dark.Badges.Border.Default,
      },
      Hover: {
        'Label_&_Icon': Grays['950'],
        Fill: Grays['75'],
      },
      Current: {
        'Label_&_Icon': Text.TextColors.Highlight,
        Fill: Dark.Layer['2'].Fill,
        Outline: Blues['500'],
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
      Liquidation_Zone: {
        Current: Oranges['950'],
        Future: Blues['800'],
      },
      Candles: {
        Positive: Greens['300'],
        Negative: Reds['500'],
      },
      Lines: {
        Positive: Greens['300'],
        Negative: Reds['500'],
        Line_1: Blues['500'],
        Line_2: Yellows['500'],
        Line_3: Greens['400'],
      },
    } as const
  const Toggles = {
      Default: {
        'Label_&_Icon': Dark.Text.primary,
        Fill: Grays['850'],
      },
      Hover: {
        'Label_&_Icon': Dark.Text.highlight,
        Fill: Dark.Layer['3'].Fill,
      },
      Current: {
        'Label_&_Icon': Grays['950'],
        Fill: Grays['50'],
      },
    } as const
  const Table = {
      Header: {
        Fill: Dark.Tables.Header.Fill,
        'Label_&_icon': {
          Default: Dark.Tables.Header['Label_&_Icon'].Default,
          Hover: Dark.Tables.Header['Label_&_Icon'].Hover,
          Active: Dark.Tables.Header['Label_&_Icon'].Active,
        },
      },
      Row: {
        Default: Dark.Tables.Row.Default,
        Selected: Dark.Tables.Row.Selected,
        Hover: Dark.Tables.Row.Hover,
      },
    } as const
  const InputBaseDefaultFill = Grays['900']
  const Inputs = {
      Base: {
        Default: {
          Fill: {
            Default: Grays['900'],
            Active: Grays['900'],
          },
          Border: {
            Default: Grays['800'],
            Active: Dark.Text.highlight,
            Filled: Grays['75'],
            Error: Reds['500'],
          },
        },
        Nested: {
          Nested: Grays['850'],
          Fill: Grays['850'],
          Border: {
            Default: Grays['600'],
            Active: Dark.Text.highlight,
            Filled: Grays['75'],
            Error: Reds['500'],
          },
        },
      },
      Large: {
        Default: {
          Fill: Grays['900'],
          Outline: Grays['800'],
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
    Default: {
      Fill: Layer[1].Fill,
      Outline: Color.Neutral[400],
      Label: Color.Primary[500],
    },
    Checked: {
      Fill: Color.Primary[500],
      Outline: Color.Neutral[400],
      Label: Grays[50], 
    },
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
      App: {
        Background: '#bdbbec',
      },
      Feedback: {
        Informational: Chad.Layer.Feedback.Info,
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
        Outline: Violets['500'],
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
            Primary: Chad.Text.FilledFeedback.info.primary,
            Secondary: Chad.Text.FilledFeedback.info.secondary,
          },
          Highlight: {
            Primary: Chad.Text.FilledFeedback.highlight.primary,
            Secondary: Chad.Text.FilledFeedback.highlight.secondary,
          },
          Warning: {
            Primary: Chad.Text.FilledFeedback.warning.primary,
            Secondary: Chad.Text.FilledFeedback.warning.secondary,
          },
          Alert: {
            Primary: Chad.Text.FilledFeedback.alert.primary,
            Secondary: Chad.Text.FilledFeedback.alert.secondary,
          },
          Success: {
            Primary: Chad.Text.FilledFeedback.success.primary,
            Secondary: Chad.Text.FilledFeedback.success.secondary,
          },
        },
        Feedback: {
          Success: Chad.Text.Feedback.Success,
          Warning: Chad.Text.Feedback.Warning,
          Error: Chad.Text.Feedback.Error,
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
      Focus_Outline: Violets['600'],
      Radius: {
        xs: '0',
        sm: '0',
        md: '0',
        lg: '0',
      },
      Primary: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Violets['950'],
        },
        Hover: {
          'Label_&_Icon': Grays['50'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Chad.Text.Disabled,
          Fill: Violets['200'],
        },
      },
      Secondary: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Grays['900'],
        },
        Hover: {
          'Label_&_Icon': Grays['50'],
          Fill: Violets['500'],
        },
        Disabled: {
          'Label_&_Icon': Chad.Text.Disabled,
          Fill: Grays['600'],
        },
      },
      Outlined: {
        Default: {
          'Label_&_Icon': Grays['950'],
          Outline: Grays['950'],
        },
        Hover: {
          'Label_&_Icon': Violets['500'],
          Outline: Violets['500'],
        },
        Disabled: {
          'Label_&_Icon': Chad.Text.Disabled,
          Outline: Violets['200'],
        },
      },
      Ghost: {
        Default: {
          'Label_&_Icon': Chad.Text.Highlight,
        },
        Hover: {
          'Label_&_Icon': Violets['800'],
          Fill: Violets['500'],
        },
        Disabled: {
          'Label_&_Icon': Chad.Text.Disabled,
          Fill: Violets['200'],
        },
      },
      Success: {
        Default: {
          'Label_&_Icon': Grays['900'],
          Fill: Greens['400'],
        },
        Hover: {
          'Label_&_Icon': Greens['500'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Chad.Text.Disabled,
          Fill: Greens['600'],
        },
      },
      Error: {
        Default: {
          'Label_&_Icon': Grays['50'],
          Fill: Reds['500'],
        },
        Hover: {
          'Label_&_Icon': Oranges['500'],
          Fill: Grays['900'],
        },
        Disabled: {
          'Label_&_Icon': Grays['300'],
          Fill: Reds['700'],
        },
      },
      Navigation: {
        Default: {
          'Label_&_Icon': Chad.Text.Tertiary,
        },
        Hover: {
          'Label_&_Icon': Chad.Text.Primary,
          'Label_&_Icon_2': Chad.Text.Primary,
          Fill: Chad.Layer['1'].Fill,
        },
        Current: {
          'Label_&_Icon': Grays['50'],
          Fill: Chad.Layer.Highlight,
        },
      },
    } as const
  const Tabs = {
      UnderLined: {
        Container_Border: Chad.Layer['1'].Outline,
        Default: {
          'Label_&_Icon': Chad.Text.Secondary,
          Outline: Chad.Layer['2'].Outline,
        },
        Hover: {
          'Label_&_Icon': Chad.Text.Highlight,
          Outline: Violets['500'],
        },
        Current: {
          'Label_&_Icon': Chad.Text.Primary,
          Outline: Violets['500'],
        },
      },
      Contained: {
        Default: {
          'Label_&_Icon': Chad.Text.FilledFeedback.highlight.secondary,
          Fill: Violets['950'],
        },
        Hover: {
          'Label_&_Icon': Grays['50'],
          Fill: Violets['800'],
        },
        Current: {
          'Label_&_Icon': Chad.Text.Primary,
          Fill: Chad.Layer['1'].Fill,
          Outline: Violets['500'],
        },
      },
      OverLined: {
        Default: {
          'Label_&_Icon': Chad.Text.Secondary,
          Outline: Chad.Layer['2'].Outline,
        },
        Hover: {
          'Label_&_Icon': Chad.Text.Primary,
          Outline: Grays['500'],
        },
        Current: {
          'Label_&_Icon': Chad.Text.Primary,
          Outline: Violets['500'],
        },
      },
    } as const
  const Chips = {
      Default: {
        'Label_&_Icon': Chad.Text.Secondary,
        Fill: Chad.Layer['1'].Fill,
        Stroke: Chad.Badges.Border.Default,
      },
      Hover: {
        'Label_&_Icon': Grays['50'],
        Fill: Violets['950'],
      },
      Current: {
        'Label_&_Icon': Chad.Text.Highlight,
        Fill: Chad.Layer['2'].Fill,
        Outline: Violets['500'],
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
      Liquidation_Zone: {
        Current: Yellows['400'],
        Future: Blues['200'],
      },
      Candles: {
        Positive: Greens['400'],
        Negative: Reds['600'],
      },
      Lines: {
        Positive: Greens['400'],
        Negative: Reds['600'],
        Line_1: Violets['500'],
        Line_2: Yellows['500'],
        Line_3: Greens['500'],
      },
    } as const
  const Toggles = {
      Default: {
        'Label_&_Icon': Chad.Text.Primary,
        Fill: Violets['300'],
      },
      Hover: {
        'Label_&_Icon': Chad.Text.Highlight,
        Fill: Chad.Layer['3'].Fill,
      },
      Current: {
        'Label_&_Icon': Grays['50'],
        Fill: Violets['800'],
      },
    } as const
  const Table = {
      Header: {
        Fill: Chad.Tables.Header.Fill,
        'Label_&_icon': {
          Default: Chad.Tables.Header['Label_&_Icon'].Default,
          Hover: Chad.Tables.Header['Label_&_Icon'].Active,
          Active: Chad.Tables.Header['Label_&_Icon'].Active,
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
            Active: Violets['400'],
            Filled: Violets['600'],
            Error: Reds['500'],
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
    Default: {
      Fill: Layer[1].Fill,
      Outline: Color.Neutral[400],
      Label: Color.Primary[500],
    },
    Checked: {
      Fill: Color.Primary[500],
      Outline: Color.Neutral[400],
      Label: Grays[50], 
    },
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
