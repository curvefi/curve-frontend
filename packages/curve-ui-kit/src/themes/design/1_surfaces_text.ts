import { Blues, Grays, Greens, Reds, Violets } from './0_primitives'

function createLightSurfaces() {
  const Text = {
    Primary: Grays[950],
    Secondary: Grays[700],
    Tertiary: Grays[500],
    Disabled: Grays[500],
    Highlight: Blues[500],
    Feedback: {
      Success: Greens[600],
      Warning: Reds[400],
      Danger: Reds[400],
      Error: Reds[500],
      Inverted: Grays[50],
    },
    FilledFeedback: {
      Info: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
      Highlight: {
        Primary: Grays[50],
        Secondary: Grays[200],
      },
      Warning: {
        Primary: Grays[50],
        Secondary: Grays[700],
      },
      Alert: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
      Success: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
    },
  } as const

  const Layer = {
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
      Danger: Reds[400],
      Error: Reds[500],
    },
  } as const

  return {
    Text,
    Layer,
    Tables: {
      Header: { Fill: Grays[200] },
    },
    Badges: {
      Label: {
        Default: Text.Primary,
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Blues[500],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[400],
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Blues[500],
        Warning: Reds[300],
        Accent: Blues[500],
      },
      Fill: {
        Default: Layer[1].Fill,
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Layer[1].Fill,
        Warning: Reds[300],
        Accent: Blues[500],
      },
    },
  } as const
}

function createDarkSurfaces() {
  const Text = {
    Primary: Grays[50],
    Secondary: Grays[300],
    Tertiary: Grays[400],
    Disabled: Grays[500],
    Highlight: Blues[400],
    Feedback: {
      Success: Greens[400],
      Warning: Reds[300],
      Danger: Reds[400],
      Error: Reds[500],
      Inverted: Grays[950],
    },
    FilledFeedback: {
      Info: {
        Primary: Blues[300],
        Secondary: Grays[300],
      },
      Highlight: {
        Primary: Blues[500],
        Secondary: Grays[700],
      },
      Warning: {
        Primary: Grays[50],
        Secondary: Grays[150],
      },
      Alert: {
        Primary: Grays[50],
        Secondary: Grays[150],
      },
      Success: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
    },
  } as const

  const Layer = {
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
      Danger: Reds[400],
      Error: Reds[500],
    },
  } as const

  return {
    Text,
    Layer,
    Tables: {
      Header: { Fill: Grays[800] },
    },
    Badges: {
      Label: {
        Default: Text.Primary,
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Blues[400],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[600],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Blues[400],
        Warning: Reds[300],
        Accent: Blues[400],
      },
      Fill: {
        Default: Layer[1].Fill,
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Layer[1].Fill,
        Warning: Reds[300],
        Accent: Blues[400],
      },
    },
  } as const
}

function createChadSurfaces() {
  const Text = {
    Primary: Grays[950],
    Secondary: Grays[750],
    Tertiary: Grays[700],
    Disabled: Grays[500],
    Highlight: Violets[600],
    Feedback: {
      Success: Greens[600],
      Warning: Reds[400],
      Danger: Reds[400],
      Error: Reds[500],
      Inverted: Grays[50],
    },
    FilledFeedback: {
      Info: {
        Primary: Violets[500],
        Secondary: Grays[700],
      },
      Highlight: {
        Primary: Blues[50],
        Secondary: Grays[300],
      },
      Warning: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Alert: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
      Success: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
    },
  } as const
  const Layer = {
    '1': {
      Fill: Grays[150],
      Outline: Grays[400],
    },
    '2': {
      Fill: Grays[300],
      Outline: Grays[500],
    },
    '3': {
      Fill: Grays[400],
      Outline: Grays[600],
    },
    Highlight: Violets[700],
    TypeAction: {
      Selected: Violets[50],
      Hover: Violets[200],
    },
    Feedback: {
      Info: Violets[700],
      Success: Greens[600],
      Warning: Reds[300],
      Danger: Reds[400],
      Error: Reds[500],
    },
  } as const

  return {
    Text,
    Layer,
    Tables: {
      Header: { Fill: Layer[3].Fill },
    },
    Badges: {
      Label: {
        Default: Text.Primary,
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Violets[800],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[975],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Violets[800],
        Warning: Reds[300],
        Accent: Violets[800],
      },
      Fill: {
        Default: Layer[1].Fill,
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Layer[1].Fill,
        Warning: Reds[300],
        Accent: Violets[800],
      },
    },
  } as const
}

function createLightInvertedSurfaces() {
  const Layer = {
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
  } as const
  const Text = {
    Primary: Grays[50],
    Secondary: Grays[300],
    Tertiary: Grays[400],
    Disabled: Grays[500],
    Highlight: Blues[500],
    Feedback: {
      Success: Greens[300],
      Warning: Reds[300],
      Error: Reds[500],
      Inverted: Grays[950],
    },
    FilledFeedback: {
      Info: {
        Primary: Blues[300],
        Secondary: Grays[300],
      },
      Highlight: {
        Primary: Blues[500],
        Secondary: Grays[700],
      },
      Warning: {
        Primary: Grays[50],
        Secondary: Grays[150],
      },
      Alert: {
        Primary: Grays[50],
        Secondary: Grays[150],
      },
      Success: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
    },
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Header: { Fill: Grays[800] },
    },
    Badges: {
      Label: {
        Default: Text.Primary,
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Blues[400],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[600],
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Blues[400],
        Warning: Reds[300],
        Accent: Blues[400],
      },
      Fill: {
        Default: Layer[1].Fill,
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Grays[10],
        Warning: Reds[300],
        Accent: Blues[400],
      },
    },
  } as const
}

function createDarkInvertedSurfaces() {
  const Text = {
    Primary: Grays[950],
    Secondary: Grays[700],
    Tertiary: Grays[600],
    Disabled: Grays[400],
    Highlight: Blues[500],
    Feedback: {
      Success: Greens[600],
      Warning: Reds[400],
      Error: Reds[500],
      Inverted: Grays[50],
    },
    FilledFeedback: {
      Info: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
      Highlight: {
        Primary: Grays[50],
        Secondary: Grays[200],
      },
      Warning: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Alert: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
      Success: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
    },
  } as const
  const Layer = {
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
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Header: { Fill: Grays[200] },
    },
    Badges: {
      Label: {
        Default: Grays[975],
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Blues[500],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[975],
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Blues[500],
        Warning: Reds[300],
        Accent: Blues[500],
      },
      Fill: {
        Default: Layer[1].Fill,
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Layer[1].Fill,
        Warning: Reds[300],
        Accent: Blues[500],
      },
    },
  } as const
}

function createChadInvertedSurfaces() {
  const Text = {
    Primary: Grays[50],
    Secondary: Grays[300],
    Tertiary: Grays[400],
    Disabled: Grays[500],
    Highlight: Violets[400],
    Feedback: {
      Success: Greens[500],
      Warning: Reds[300],
      Error: Reds[500],
      Inverted: Grays[950],
    },
    FilledFeedback: {
      Info: {
        Primary: Blues[300],
        Secondary: Grays[300],
      },
      Highlight: {
        Primary: Blues[500],
        Secondary: Grays[700],
      },
      Warning: {
        Primary: Grays[50],
        Secondary: Grays[150],
      },
      Alert: {
        Primary: Grays[50],
        Secondary: Grays[150],
      },
      Success: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
    },
  } as const
  const Layer = {
    '1': {
      Fill: Violets[950],
      Outline: Violets[800],
    },
    '2': {
      Fill: Violets[800],
      Outline: Violets[600],
    },
    '3': {
      Fill: Violets[700],
      Outline: Violets[500],
    },
    Highlight: Violets[400],
    TypeAction: {
      Selected: Violets[800],
      Hover: Violets[900],
    },
    Feedback: {
      Info: Grays[850],
      Success: Greens[300],
      Warning: Reds[400],
      Error: Reds[500],
    },
  } as const
  return {
    Text: Text,
    Layer: Layer,
    Tables: {
      Header: { Fill: Violets[800] },
    },
    Badges: {
      Label: {
        Default: Text.Primary,
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Violets[200],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[600],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Violets[200],
        Warning: Reds[300],
        Accent: Violets[400],
      },
      Fill: {
        Default: Layer[1].Fill,
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Layer[1].Fill,
        Warning: Reds[300],
        Accent: Violets[400],
      },
    },
  } as const
}

export const SurfacesAndText = {
  plain: {
    Light: createLightSurfaces(),
    Dark: createDarkSurfaces(),
    Chad: createChadSurfaces(),
  },
  inverted: {
    Light: createLightInvertedSurfaces(),
    Dark: createDarkInvertedSurfaces(),
    Chad: createChadInvertedSurfaces(),
  },
}
