import { Blues, Grays, Greens, Reds, Violet } from './0_primitives'
import { SurfacesAndText } from './1_surfaces_text'

const { plain, inverted } = SurfacesAndText

const Transition = 'color ease-out 0.256s, background-color ease-out 0.256s, filter ease-out 0.256s'

export const createLightDesign = (Light: typeof plain.Light | typeof inverted.Light) => {
  const Color = {
    Neutral: {
      '25': Grays[25],
      '50': Grays[50],
      '75': Grays[75],
      '100': Grays[100],
      '150': Grays[150],
      '200': Grays[200],
      '300': Grays[300],
      '400': Grays[400],
      '500': Grays[500],
      '600': Grays[600],
      '700': Grays[700],
      '750': Grays[750],
      '800': Grays[800],
      '850': Grays[850],
      '900': Grays[900],
      '950': Grays[950],
      '975': Grays[975],
    },
    Primary: {
      '50': Blues[50],
      '100': Blues[100],
      '200': Blues[200],
      '300': Blues[300],
      '400': Blues[400],
      '500': Blues[500],
      '600': Blues[600],
      '700': Blues[700],
      '800': Blues[800],
      '900': Blues[900],
      '950': Blues[950],
    },
    Secondary: {
      '100': Greens[100],
      '200': Greens[200],
      '300': Greens[300],
      '400': Greens[400],
      '500': Greens[500],
      '600': Greens[600],
      '700': Greens[700],
      '800': Greens[800],
    },
    Tertiary: {
      '200': Reds[200],
      '300': Reds[300],
      '400': Reds[400],
      '600': Reds[500],
    },
  } as const
  const Text = {
    TextColors: {
      Primary: Light.Text.primary,
      Secondary: Light.Text.secondary,
      Tertiary: Light.Text.tertiary,
      Highlight: Light.Text.highlight,
      Disabled: Light.Text.Disabled,
      Success: Greens[500],
      Warning: Reds[400],
      Error: Reds[500],
    },
    FontFamily: {
      Heading: 'Mona Sans',
      Body: 'Mona Sans',
      Mono: 'Mona Sans',
      Button: 'Mona Sans',
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
    Highlight: {
      Fill: Light.Layer.Highlight,
      Outline: Light.Layer.Highlight,
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
  const Feedback = {
    Success: Greens[300],
    Info: Blues[200],
    Warning: Reds[300],
    Error: Reds[500],
  } as const
  return {
    Color,
    Text,
    Button,
    Feedback,
    Layer,

    Tabs: {
      UnderLined: {
        Container_Border: Light.Layer[1].Outline,
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
        Default: {
          Label: Text.TextColors.Secondary,
        },
        Hover: {
          Label: Text.TextColors.Primary,
          Outline: Color.Neutral[500],
        },
        Current: {
          Label: Text.TextColors.Primary,
          Outline: Color.Primary[500],
        },
      },
    },
    Chips: {
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
    },
    Toggles: {
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
    },
    Table: {
      Header_Fill: Light.Tables.Header_Fill,
    },
    Inputs: {
      Base: {
        Default: {
          Fill: Grays[100],
          Border: {
            Default: Grays[400],
            Active: Light.Text.highlight,
            Filled: Grays[850],
            Error: Feedback.Error,
          },
        },
        Nested: {
          Nested: Grays[10],
          Fill: Grays[100],
          Border: {
            Default: Grays[400],
            Active: Light.Text.highlight,
            Filled: Grays[850],
            Error: Feedback.Error,
          },
        },
      },
      Large: {
        Default: {
          Fill: Grays[150],
        },
      },
    },
    Switch: {
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
    },
  } as const
}

export const createDarkDesign = (Dark: typeof plain.Dark | typeof inverted.Dark) => {
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
      '200': Reds[500],
      '300': Reds[400],
      '400': Reds[300],
      '600': Reds[200],
    },
  } as const
  const Text = {
    TextColors: {
      Primary: Dark.Text.primary,
      Secondary: Dark.Text.secondary,
      Tertiary: Dark.Text.tertiary,
      Highlight: Dark.Text.highlight,
      Disabled: Dark.Text.Disabled,
      Success: Greens[400],
      Warning: Reds[300],
      Error: Reds[500],
    },
    FontFamily: {
      Heading: 'Mona Sans',
      Body: 'Mona Sans',
      Mono: 'Mona Sans',
      Button: 'Mona Sans',
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
        Label: Grays[900],
        Fill: Grays[50],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Blues[500],
      },
    },
    Secondary: {
      Default: {
        Label: Grays[900],
        Fill: Grays[50],
      },
      Hover: {
        Label: Grays[900],
        Fill: Blues[500],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Color.Neutral[50],
      },
    },
    Outlined: {
      Default: {
        Label: Grays[50],
        Outline: Grays[700],
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
        Label: Grays[50],
      },
      Disabled: {
        Label: Text.TextColors.Disabled,
        Fill: Grays[850],
      },
    },
    Success: {
      Default: {
        Label: Grays[900],
        Fill: Greens[300],
      },
      Hover: {
        Label: Greens[500],
        Fill: Grays[50],
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
  const Feedback = {
    Success: Greens[400],
    Info: Blues[300],
    Warning: Reds[300],
    Error: Reds[500],
  } as const
  return {
    Color,
    Text,
    Button,
    Feedback,
    Layer,

    Tabs: {
      UnderLined: {
        Container_Border: Dark.Layer[1].Outline,
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
        Default: { Label: Text.TextColors.Secondary },
        Hover: {
          Label: Text.TextColors.Primary,
          Outline: Color.Neutral[500],
        },
        Current: {
          Label: Text.TextColors.Primary,
          Outline: Color.Primary[500],
        },
      },
    },
    Chips: {
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
    },
    Toggles: {
      Default: {
        Label: Text.TextColors.Primary,
      },
      Hover: {
        Label: Text.TextColors.Highlight,
        Fill: Layer[3].Fill,
      },
      Current: {
        Label: Color.Neutral[950],
        Fill: Color.Neutral[900],
      },
    },
    Table: {
      Header_Fill: Dark.Tables.Header_Fill,
    },
    Inputs: {
      Base: {
        Default: {
          Fill: Grays[850],
          Border: {
            Default: Grays[600],
            Active: Dark.Text.highlight,
            Filled: Grays[75],
            Error: Feedback.Error,
          },
        },
        Nested: {
          Nested: Grays[850],
          Fill: Grays[850],
          Border: {
            Default: Grays[600],
            Active: Dark.Text.highlight,
            Filled: Grays[75],
            Error: Feedback.Error,
          },
        },
      },
      Large: {
        Default: {
          Fill: Grays[975],
        },
      },
    },
    Switch: {
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
    },
  } as const
}

export const createChadDesign = (Chad: typeof plain.Chad | typeof inverted.Chad) => {
  const Color = {
    Neutral: {
      '25': Grays[25],
      '50': Grays[50],
      '75': Grays[75],
      '100': Grays[100],
      '150': Grays[150],
      '200': Grays[200],
      '300': Grays[300],
      '400': Grays[400],
      '500': Grays[500],
      '600': Grays[600],
      '700': Grays[700],
      '750': Grays[750],
      '800': Grays[800],
      '850': Grays[850],
      '900': Grays[900],
      '950': Grays[950],
      '975': Grays[975],
    },
    Primary: {
      '50': Violet[50],
      '100': Violet[100],
      '200': Violet[200],
      '300': Violet[300],
      '400': Violet[400],
      '500': Violet[500],
      '600': Violet[600],
      '700': Violet[700],
      '800': Violet[800],
      '900': Violet[900],
      '950': Violet[950],
    },
    Secondary: {
      '100': Greens[100],
      '200': Greens[200],
      '300': Greens[300],
      '400': Greens[400],
      '500': Greens[500],
      '600': Greens[600],
      '700': Greens[700],
      '800': Greens[800],
    },
    Tertiary: {
      '200': Reds[200],
      '300': Reds[300],
      '400': Reds[400],
      '600': Reds[500],
    },
  } as const
  const Text = {
    TextColors: {
      Primary: Chad.Text.primary,
      Secondary: Chad.Text.secondary,
      Tertiary: Chad.Text.tertiary,
      Highlight: Chad.Text.highlight,
      Disabled: Chad.Text.Disabled,
      Success: Greens[500],
      Warning: Reds[400],
      Error: Reds[500],
    },
    FontFamily: {
      Heading: 'Minecraft',
      Body: 'Hubot Sans',
      Mono: 'Hubot Sans',
      Button: 'Minecraft',
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
    Highlight: {
      Fill: Chad.Layer.Highlight,
      Outline: Chad.Layer.Highlight,
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
  const Feedback = {
    Success: Greens[400],
    Info: Blues[300],
    Warning: Reds[300],
    Error: Reds[500],
  } as const
  return {
    Color,
    Text,
    Button,
    Feedback,
    Layer,

    Tabs: {
      UnderLined: {
        Container_Border: Layer[1].Outline,
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
        Default: {
          Label: Text.TextColors.Secondary,
        },
        Hover: {
          Label: Text.TextColors.Primary,
          Outline: Color.Neutral[500],
        },
        Current: {
          Label: Text.TextColors.Primary,
          Outline: Color.Primary[500],
        },
      },
    },
    Chips: {
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
    },
    Toggles: {
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
    },
    Table: {
      Header_Fill: Chad.Tables.Header_Fill,
    },
    Inputs: {
      Base: {
        Default: {
          Fill: Violet[50],
          Border: {
            Default: Violet[200],
            Active: Chad.Text.highlight,
            Filled: Violet[400],
            Error: Feedback.Error,
          },
        },
        Nested: {
          Nested: Violet[50],
          Fill: Violet[50],
          Border: {
            Default: Violet[200],
            Active: Chad.Text.highlight,
            Filled: Violet[400],
            Error: Feedback.Error,
          },
        },
      },
      Large: {
        Default: {
          Fill: Violet[50],
        },
      },
    },
    Switch: {
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
    },
  } as const
}
