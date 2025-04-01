import { Blues, Grays, Greens, Reds, TransitionFunction, Violet } from './0_primitives'
import { SurfacesAndText } from './1_surfaces_text'

const { plain, inverted } = SurfacesAndText

const Transition = `all ${TransitionFunction}`
const InsetOverline = '0 0 auto' as const // Top border only
const InsetUnderline = 'auto 0 0' as const // Bottom border only

export const createLightDesign = (Light: typeof plain.Light | typeof inverted.Light) => {
  const Color = {
    Neutral: Grays,
    Primary: Blues,
    Secondary: Greens,
    Tertiary: Reds,
  } as const

  const Layer = {
    '1': Light.Layer[1],
    '2': Light.Layer[2],
    '3': Light.Layer[3],
    App: {
      Background: '#f0edeb',
    },
    Highlight: {
      Fill: Light.Layer.Highlight,
      Outline: Light.Layer.Highlight,
    },
    TypeAction: Light.Layer.TypeAction,
    Feedback: Light.Layer.Feedback,
  } as const

  const Text = {
    TextColors: {
      Primary: Light.Text.Primary,
      Secondary: Light.Text.Secondary,
      Tertiary: Light.Text.Tertiary,
      Highlight: Light.Text.Highlight,
      Disabled: Light.Text.Disabled,
      Feedback: Light.Text.Feedback,
    },
    FontFamily: {
      Heading: 'Mona Sans',
      Body: 'Mona Sans',
      Mono: 'Mona Sans',
      Button: 'Mona Sans',
    },
  } as const

  const Button = {
    Focus_Outline: Color.Primary[500],
    Transition,
    Primary: {
      Default: {
        Label: Grays[50],
        Fill: Blues[500],
      },
      Hover: {
        Label: Grays[50],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Blues[500],
      },
    },
    Secondary: {
      Default: {
        Label: Grays[50],
        Fill: Grays[900],
      },
      Hover: {
        Label: Grays[50],
        Fill: Blues[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Color.Neutral[900],
      },
    },
    Outlined: {
      Default: {
        Label: Grays[950],
        Outline: Grays[300],
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
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Grays[900],
      },
    },
    Success: {
      Default: {
        Label: Grays[900],
        Fill: Greens[400],
      },
      Hover: {
        Label: Greens[300],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Grays[950],
        Fill: Greens[200],
      },
    },
    Error: {
      Default: {
        Label: Grays[50],
        Fill: Reds[500],
      },
      Hover: {
        Label: Reds[400],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Grays[50],
        Fill: Reds[500],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Secondary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
      },
      Current: {
        Label: Grays[50],
        Fill: Layer.Highlight.Fill,
      },
    },
  } as const

  const Tabs = {
    Transition,
    UnderLined: {
      Inset: InsetUnderline,
      Default: {
        Label: Text.TextColors.Secondary,
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
        Fill: Color.Neutral[300],
      },
      Hover: {
        Label: Color.Neutral[50],
        Fill: Color.Neutral[900],
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
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Color.Neutral[200],
        Outline: Color.Neutral[500],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
  } as const

  const Chips = {
    BorderRadius: {
      Clickable: 0,
      NonClickable: '100px',
    },
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer[2].Fill,
      Stroke: Layer[2].Outline,
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
  } as const

  const Badges = {
    Label: {
      Default: Light.Badges.Label.Default,
      Active: Light.Badges.Label.Active,
      Alert: Light.Badges.Label.Alert,
      Highlight: Light.Badges.Label.Highlight,
      Warning: Light.Badges.Label.Warning,
      Accent: Light.Badges.Label.Accent,
    },
    Border: {
      Default: Light.Badges.Border.Default,
      Active: Light.Badges.Border.Active,
      Alert: Light.Badges.Border.Alert,
      Highlight: Light.Badges.Border.Highlight,
      Warning: Light.Badges.Border.Warning,
      Accent: Light.Badges.Border.Accent,
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

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
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
    Header: { Fill: Light.Tables.Header.Fill },
    Row: {
      Default: Light.Layer[1].Fill,
      Selected: Light.Layer.TypeAction.Selected,
      Hover: Light.Layer.TypeAction.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: Grays[100],
        Border: {
          Default: Grays[400],
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
        Fill: Grays[150],
      },
    },
    SliderThumbImage: '/mui/slider-thumb-white.svg',
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
    Toggles,
    Table,
    Inputs,
    Switch,
  } as const
}

export const createDarkDesign = (Dark: typeof plain.Dark | typeof inverted.Dark) => {
  const color = Grays
  const Color = {
    Neutral: {
      '25': color[975],
      '50': color[950],
      '75': color[900],
      '100': color[850],
      '150': color[800],
      '200': color[750],
      '300': color[700],
      '400': color[600],
      '500': color[500],
      '600': color[400],
      '700': color[300],
      '750': color[200],
      '800': color[150],
      '850': color[100],
      '900': color[75],
      '950': color[50],
      '975': color[25],
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
      '200': Reds[500],
      '300': Reds[400],
      '400': Reds[300],
      '600': Reds[200],
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
    Highlight: {
      Fill: Dark.Layer.Highlight,
      Outline: Dark.Layer.Highlight,
    },
    TypeAction: {
      Hover: Dark.Layer.TypeAction.Hover,
      Selected: Dark.Layer.TypeAction.Selected,
    },
    Feedback: Dark.Layer.Feedback,
  } as const

  const Text = {
    TextColors: {
      Primary: Dark.Text.Primary,
      Secondary: Dark.Text.Secondary,
      Tertiary: Dark.Text.Tertiary,
      Highlight: Dark.Text.Highlight,
      Disabled: Dark.Text.Disabled,
      Feedback: Dark.Text.Feedback,
    },
    FontFamily: {
      Heading: 'Mona Sans',
      Body: 'Mona Sans',
      Mono: 'Mona Sans',
      Button: 'Mona Sans',
    },
  } as const

  const Button = {
    Focus_Outline: Color.Primary[500],
    Transition,
    Primary: {
      Default: {
        Label: color[50],
        Fill: Blues[500],
      },
      Hover: {
        Label: color[900],
        Fill: color[50],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Blues[500],
      },
    },
    Secondary: {
      Default: {
        Label: color[900],
        Fill: color[50],
      },
      Hover: {
        Label: color[900],
        Fill: Blues[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Color.Neutral[50],
      },
    },
    Outlined: {
      Default: {
        Label: color[50],
        Outline: color[700],
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
        Label: Color.Primary[700],
      },
      Hover: {
        Label: color[50],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: color[850],
      },
    },
    Success: {
      Default: {
        Label: color[900],
        Fill: Greens[300],
      },
      Hover: {
        Label: Greens[500],
        Fill: color[50],
      },
      Disabled: {
        Label: color[950],
        Fill: Greens[200],
      },
    },
    Error: {
      Default: {
        Label: color[50],
        Fill: Reds[500],
      },
      Hover: {
        Label: Reds[400],
        Fill: color[900],
      },
      Disabled: {
        Label: color[50],
        Fill: Reds[500],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Secondary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
      },
      Current: {
        Label: color[50],
        Fill: Layer.Highlight.Fill,
      },
    },
  } as const

  const Tabs = {
    Transition,
    UnderLined: {
      Inset: InsetUnderline,
      Default: {
        Label: Text.TextColors.Secondary,
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
        Fill: Color.Neutral[200],
      },
      Hover: {
        Label: Color.Neutral[50],
        Fill: Color.Neutral[900],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
        Outline: Color.Primary[500],
      },
    },
    OverLined: {
      Inset: InsetOverline,
      Default: { Label: Text.TextColors.Secondary },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Color.Neutral[200],
        Outline: Color.Neutral[500],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
  } as const

  const Chips = {
    BorderRadius: {
      Clickable: 0,
      NonClickable: '100px',
    },
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer[2].Fill,
      Stroke: Layer[2].Outline,
    },
    Hover: {
      Label: Color.Neutral[50],
      Fill: Color.Neutral[900],
    },
    Current: {
      Label: Color.Neutral[950],
      Fill: Layer[2].Fill,
      Outline: Layer.Highlight.Outline,
    },
  } as const

  const Badges = {
    Label: {
      Default: Dark.Badges.Label.Default,
      Active: Dark.Badges.Label.Active,
      Alert: Dark.Badges.Label.Alert,
      Highlight: Dark.Badges.Label.Highlight,
      Warning: Dark.Badges.Label.Warning,
      Accent: Dark.Badges.Label.Accent,
    },
    Border: {
      Default: Dark.Badges.Border.Default,
      Active: Dark.Badges.Border.Active,
      Alert: Dark.Badges.Border.Alert,
      Highlight: Dark.Badges.Border.Highlight,
      Warning: Dark.Badges.Border.Warning,
      Accent: Dark.Badges.Border.Accent,
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

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
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
    Header: { Fill: Dark.Tables.Header.Fill },
    Row: {
      Default: Dark.Layer[1].Fill,
      Selected: Dark.Layer.TypeAction.Selected,
      Hover: Dark.Layer.TypeAction.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: color[850],
        Border: {
          Default: color[600],
          Active: Dark.Text.Highlight,
          Filled: color[75],
          Error: Reds[500],
        },
      },
      Nested: {
        Nested: color[850],
        Fill: color[850],
        Border: {
          Default: color[600],
          Active: Dark.Text.Highlight,
          Filled: color[75],
          Error: Reds[500],
        },
      },
    },
    Large: {
      Default: {
        Fill: color[975],
      },
    },
    SliderThumbImage: '/mui/slider-thumb-black.svg',
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
      Label: color[50],
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
    Toggles,
    Table,
    Inputs,
    Switch,
  } as const
}

export const createChadDesign = (Chad: typeof plain.Chad | typeof inverted.Chad) => {
  const Color = {
    Neutral: Grays,
    Primary: Violet,
    Secondary: Greens,
    Tertiary: Reds,
  } as const

  const Layer = {
    '1': Chad.Layer[1],
    '2': Chad.Layer[2],
    '3': Chad.Layer[3],
    App: {
      Background: '#bdbbec',
    },
    Highlight: {
      Fill: Chad.Layer.Highlight,
      Outline: Chad.Layer.Highlight,
    },
    TypeAction: Chad.Layer.TypeAction,
    Feedback: Chad.Layer.Feedback,
  } as const

  const Text = {
    TextColors: {
      Primary: Chad.Text.Primary,
      Secondary: Chad.Text.Secondary,
      Tertiary: Chad.Text.Tertiary,
      Highlight: Chad.Text.Highlight,
      Disabled: Chad.Text.Disabled,
      Feedback: Chad.Text.Feedback,
    },
    FontFamily: {
      Heading: 'Minecraft',
      Body: 'Hubot Sans',
      Mono: 'Hubot Sans',
      Button: 'Minecraft',
    },
  } as const

  const Button = {
    Focus_Outline: Color.Primary[600],
    Transition,
    Primary: {
      Default: {
        Label: Grays[50],
        Fill: Violet[500],
      },
      Hover: {
        Label: Grays[50],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violet[500],
      },
    },
    Secondary: {
      Default: {
        Label: Grays[50],
        Fill: Violet[900],
      },
      Hover: {
        Label: Grays[50],
        Fill: Violet[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Color.Primary[950],
      },
    },
    Outlined: {
      Default: {
        Label: Grays[950],
        Outline: Grays[300],
      },
      Hover: {
        Label: Violet[500],
        Outline: Violet[500],
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
        Label: Grays[800],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Violet[950],
      },
    },
    Success: {
      Default: {
        Label: Grays[900],
        Fill: Greens[400],
      },
      Hover: {
        Label: Greens[500],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Grays[950],
        Fill: Greens[200],
      },
    },
    Error: {
      Default: {
        Label: Grays[50],
        Fill: Reds[500],
      },
      Hover: {
        Label: Reds[400],
        Fill: Grays[900],
      },
      Disabled: {
        Label: Grays[50],
        Fill: Reds[500],
      },
    },
    Navigation: {
      Default: {
        Label: Text.TextColors.Secondary,
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Layer[1].Fill,
      },
      Current: {
        Label: Grays[50],
        Fill: Layer.Highlight.Fill,
      },
    },
  } as const

  const Tabs = {
    Transition,
    UnderLined: {
      Inset: InsetUnderline,
      Default: {
        Label: Text.TextColors.Secondary,
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
        Fill: Color.Primary[200],
      },
      Hover: {
        Label: Color.Neutral[50],
        Fill: Color.Primary[950],
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
      },
      Hover: {
        Label: Text.TextColors.Primary,
        Fill: Color.Neutral[200],
        Outline: Color.Neutral[500],
      },
      Current: {
        Label: Text.TextColors.Primary,
        Outline: Color.Primary[500],
      },
    },
  } as const

  const Chips = {
    BorderRadius: {
      Clickable: 0,
      NonClickable: 0,
    },
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer[1].Fill,
      Stroke: Layer[2].Outline,
    },
    Hover: {
      Label: Color.Neutral[50],
      Fill: Color.Primary[950],
    },
    Current: {
      Label: Text.TextColors.Primary,
      Fill: Layer[2].Fill,
      Outline: Layer.Highlight.Outline,
    },
  } as const

  const Badges = {
    Label: {
      Default: Chad.Badges.Label.Default,
      Active: Chad.Badges.Label.Active,
      Alert: Chad.Badges.Label.Alert,
      Highlight: Chad.Badges.Label.Highlight,
      Warning: Chad.Badges.Label.Warning,
      Accent: Chad.Badges.Label.Accent,
    },
    Border: {
      Default: Chad.Badges.Border.Default,
      Active: Chad.Badges.Border.Active,
      Alert: Chad.Badges.Border.Alert,
      Highlight: Chad.Badges.Border.Highlight,
      Warning: Chad.Badges.Border.Warning,
      Accent: Chad.Badges.Border.Accent,
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

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
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
    Header: { Fill: Chad.Tables.Header.Fill },
    Row: {
      Default: Chad.Layer[1].Fill,
      Selected: Chad.Layer.TypeAction.Selected,
      Hover: Chad.Layer.TypeAction.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: Violet[50],
        Border: {
          Default: Violet[200],
          Active: Chad.Text.Highlight,
          Filled: Violet[400],
          Error: Reds[500],
        },
      },
      Nested: {
        Nested: Violet[50],
        Fill: Violet[50],
        Border: {
          Default: Violet[200],
          Active: Chad.Text.Highlight,
          Filled: Violet[400],
          Error: Reds[500],
        },
      },
    },
    Large: {
      Default: {
        Fill: Violet[50],
      },
    },
    SliderThumbImage: '/mui/slider-thumb-white.svg',
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
    Toggles,
    Table,
    Inputs,
    Switch,
  } as const
}
