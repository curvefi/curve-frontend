import { Feedback } from '@mui/icons-material'
import { Grays, Blues, Violet, Reds, Greens } from './0_primitives'

const LightText = {
    primary: Grays[950],
    secondary: Grays[700],
    tertiary: Grays[500],
    disabled: Grays[400],
    highlight: Blues[500],
    Feedback: {
      Success: Greens[500],
      Warning: Reds[400],
      Error: Reds[500],
      Inverted: Grays[50],
  },
}

const LightLayer = {
  '1': {
    Fill: Grays[50],
    Outline: Grays[300],
  },
  '2': {
    Fill: Grays[100],
    Outline: Grays[200],
  },
  '3': {
    Fill: Grays[50],
    Outline: Grays[300],
  },
  Highlight: Blues[500],
  TypeAction: {
    Selected: Blues[100],
    Hover: Grays[150],
  },
  Feedback: {
    Info: Blues[500],
    Success: Greens[600],
    Warning: Reds[300],
    Error: Reds[500],
  },
}

const DarkText = {
  primary: Grays[50],
  secondary: Grays[300],
  tertiary: Grays[400],
  disabled: Grays[500],
  highlight: Blues[400],
  Feedback: {
    Success: Greens[400],
    Warning: Reds[300],
    Error: Reds[500],
    Inverted: Grays[950],
  },
}

const DarkLayer = {
  '1': {
    Fill: Grays[950],
    Outline: Grays[900],
  },
  '2': {
    Fill: Grays[900],
    Outline: Grays[800],
  },
  '3': {
    Fill: Grays[800],
    Outline: Grays[700],
  },
  Highlight: Blues[500],
  TypeAction: {
    Selected: Blues[900],
    Hover: Grays[800],
  },
  Feedback: {
    Info: Blues[50],
    Success: Greens[300],
    Warning: Reds[400],
    Error: Reds[500],
  },
}

const ChadText = {
  primary: Grays[950],
  secondary: Grays[700],
  tertiary: Grays[500],
  disabled: Grays[400],
  highlight: Violet[600],
  Feedback: {
    Success: Greens[600],
    Warning: Reds[400],
    Error: Reds[500],
    Inverted: Grays[50],
  },
}

 const ChadLayer = {
  '1': {
    Fill: Violet[100],
    Outline: Violet[300],
  },
  '2': {
    Fill: Violet[200],
    Outline: Violet[400],
  },
  '3': {
    Fill: Violet[300],
    Outline: Violet[500],
  },
  Highlight: Violet[800],
  TypeAction: {
    Selected: Violet[50],
    Hover: Violet[200],
  },
  Feedback: {
    Info: Violet[700],
    Success: Greens[600],
    Warning: Reds[300],
    Error: Reds[500],
  },
}

export const SurfacesAndText = {
  plain: {
    Light: {
      Text: {
        primary: LightText.primary,
        secondary: LightText.secondary,
        tertiary: LightText.tertiary,
        disabled: LightText.disabled,
        highlight: LightText.highlight,
        Feedback: {
          Success: LightText.Feedback.Success,
          Warning: LightText.Feedback.Warning,
          Error: LightText.Feedback.Error,
          Inverted: LightText.Feedback.Inverted,
        },
      },
      Layer: {
        '1': LightLayer[1],
        '2': LightLayer[2],
        '3': LightLayer[3],
        Highlight: LightLayer.Highlight,
        Feedback: LightLayer.Feedback,
        TypeAction: {
          Selected: LightLayer.TypeAction.Selected,
          Hover: LightLayer.TypeAction.Hover,
        },
      },
      Tables: {
        Header: { Fill: Grays[200] },
      },
      Badges: {
        Label: { 
          Default: LightText.primary,
          Active: Grays[10],
          Alert: Grays[10],
          Highlight: Blues[500],
          Warning: Grays[975],
          Accent: Grays[10],
         },
        Border: { 
          Default: Grays[400],
          Active: Blues[500],
          Alert: Reds[500],
          Highlight: Blues[500],
          Warning: Reds[400],
          Accent: Blues[500],
         },
         Fill: { 
          Default: LightLayer[1],
          Active: Greens[400],
          Alert: Reds[500],
          Highlight: Blues[500],
          Warning: Reds[300],
          Accent: Blues[400],
         },
      },
    },
    Dark: {
      Text: {
        Text: DarkText,
      },
      Layer: {
        '1': DarkLayer[1],
        '2': DarkLayer[2],
        '3': DarkLayer[3],
        Highlight: DarkLayer.Highlight,
        Feedback: DarkLayer.Feedback,
        TypeAction: {
          Selected: DarkLayer.TypeAction.Selected,
          Hover: DarkLayer.TypeAction.Hover,
        },
      },
      Tables: {
        Header: { Fill: Grays[800] },
      },
      Badges: {
        Label: { 
          Default: DarkText.primary,
          Active: Grays[10],
          Alert: Grays[10],
          Highlight: Blues[400],
          Warning: Grays[975],
          Accent: Grays[10],
         },
        Border: { 
          Default: Grays[600],
          Active: Blues[500],
          Alert: Reds[500],
          Highlight: Blues[400],
          Warning: Reds[400],
          Accent: Blues[400],
         },
         Fill: { 
          Default: DarkLayer[1],
          Active: Greens[500],
          Alert: Reds[500],
          Highlight: DarkLayer[1],
          Warning: Reds[300],
          Accent: Blues[500],
         },
      },
    },
    Chad: {
      Text: {
        primary: ChadText.primary,
        secondary: ChadText.secondary,
        tertiary: ChadText.tertiary,
        disabled: ChadText.disabled,
        highlight: ChadText.highlight,
        Feedback: {
          Success: ChadText.Feedback.Success,
          Warning: ChadText.Feedback.Warning,
          Error: ChadText.Feedback.Error,
          Inverted: ChadText.Feedback.Inverted,
        },
      },
      Layer: {
        '1': ChadLayer[1],
        '2': ChadLayer[2],
        '3': ChadLayer[3],
        Highlight: ChadLayer.Highlight,
        Feedback: ChadLayer.Feedback,
        TypeAction: {
          Selected: ChadLayer.TypeAction.Selected,
          Hover: ChadLayer.TypeAction.Hover,
        },
      },
      Tables: {
        Header: { Fill: Violet[50] },
      },
      Badges: {
        Label: { 
          Default: Grays[975],
          Active: Grays[10],
          Alert: Violet[800],
          Highlight: Blues[400],
          Warning: Grays[975],
          Accent: Grays[10],
         },
        Border: { 
          Default: Grays[400],
          Active: Violet[500],
          Alert: Reds[500],
          Highlight: Violet[800],
          Warning: Reds[400],
          Accent: Violet[800],
         },
         Fill: { 
          Default: ChadLayer[1],
          Active: Greens[500],
          Alert: Reds[500],
          Highlight: ChadLayer[1],
          Warning: Reds[300],
          Accent: Violet[800],
         },
      },
    },
  },
  inverted: {
    Light: {
      Text: {
        primary: Grays[50],
        secondary: Grays[300],
        tertiary: Grays[400],
        disabled: Grays[500],
        highlight: Blues[500],
        Feedback: {
          Success: Greens[300],
          Warning: Reds[300],
          Error: Reds[500],
          Inverted: Grays[950],
        },
      },
      Layer: {
        '1': {
          Fill: Grays[950],
          Outline: Grays[600],
        },
        '2': {
          Fill: Grays[900],
          Outline: Grays[750],
        },
        '3': {
          Fill: Grays[750],
          Outline: Grays[600],
        },
        Highlight: Blues[500],
        TypeAction: {
          Selected: Grays[850],
          Hover: Grays[900],
        },
        Feedback: {
          Info: Blues[800],
          Success: Greens[300],
          Warning: Reds[400],
          Error: Reds[500],
        },
      },
      Tables: {
        Header: { Fill: Grays[800] },
      },
    },
    Dark: {
      Text: {
        primary: Grays[950],
        secondary: Grays[700],
        tertiary: Grays[600],
        disabled: Grays[400],
        highlight: Blues[500],
        Feedback: {
          Success: Greens[600],
          Warning: Reds[400],
          Error: Reds[500],
          Inverted: Grays[50],
        },
      },
      Layer: {
        '1': {
          Fill: Grays[75],
          Outline: Grays[300],
        },
        '2': {
          Fill: Grays[100],
          Outline: Grays[200],
        },
        '3': {
          Fill: Grays[50],
          Outline: Grays[300],
        },
        Highlight: Blues[500],
        TypeAction: {
          Selected: Blues[100],
          Hover: Blues[50],
        },
        Feedback: {
          Info: Blues[500],
          Success: Greens[600],
          Warning: Reds[300],
          Error: Reds[500],
        },
      },
      Tables: {
        Header: { Fill: Grays[200] },
      },
    },
    Chad: {
      Text: {
        primary: Grays[50],
        secondary: Grays[300],
        tertiary: Grays[400],
        disabled: Grays[500],
        highlight: Violet[400],
        Feedback: {
          Success: Greens[500],
          Warning: Reds[300],
          Error: Reds[500],
          Inverted: Grays[950],
        },
      },
      Tables: {
        Header: { Fill: Violet[800] },
      },
      Layer: {
        '1': {
          Fill: Violet[950],
          Outline: Violet[800],
        },
        '2': {
          Fill: Violet[800],
          Outline: Violet[600],
        },
        '3': {
          Fill: Violet[700],
          Outline: Violet[500],
        },
        Highlight: Violet[400],
        TypeAction: {
          Selected: Violet[800],
          Hover: Violet[900],
        },
        Feedback: {
          Info: Grays[850],
          Success: Greens[300],
          Warning: Reds[400],
          Error: Reds[500],
        },
      },
    },
  },
}
