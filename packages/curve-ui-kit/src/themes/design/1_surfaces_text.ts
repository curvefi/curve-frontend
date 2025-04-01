import { Blues, Grays, Greens, Reds, Violet } from './0_primitives'

function createLightSurfaces() {
  const Text = {
    Primary: Grays[950],
    Secondary: Grays[700],
    Tertiary: Grays[500],
    Disabled: Grays[400],
    Highlight: Blues[500],
    Feedback: {
      Success: Greens[600],
      Warning: Reds[400],
      Error: Reds[500],
      Inverted: Grays[50],
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
        Active: Blues[500],
        Alert: Reds[500],
        Highlight: Blues[500],
        Warning: Reds[400],
        Accent: Blues[500],
      },
      Fill: {
        Default: Layer[1],
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Blues[500],
        Warning: Reds[300],
        Accent: Blues[400],
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
      Error: Reds[500],
      Inverted: Grays[950],
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
        Active: Blues[500],
        Alert: Reds[500],
        Highlight: Blues[400],
        Warning: Reds[400],
        Accent: Blues[400],
      },
      Fill: {
        Default: Layer[1],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Layer[1],
        Warning: Reds[300],
        Accent: Blues[500],
      },
    },
  } as const
}

function createChadSurfaces() {
  const Text = {
    Primary: Grays[950],
    Secondary: Grays[700],
    Tertiary: Grays[500],
    Disabled: Grays[400],
    Highlight: Violet[600],
    Feedback: {
      Success: Greens[600],
      Warning: Reds[400],
      Error: Reds[500],
      Inverted: Grays[50],
    },
  } as const
  const Layer = {
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
  } as const

  return {
    Text,
    Layer,
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
        Default: Layer[1],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Layer[1],
        Warning: Reds[300],
        Accent: Violet[800],
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
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Header: { Fill: Grays[800] },
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
  } as const
}

function createChadInvertedSurfaces() {
  const Text = {
    Primary: Grays[50],
    Secondary: Grays[300],
    Tertiary: Grays[400],
    Disabled: Grays[500],
    Highlight: Violet[400],
    Feedback: {
      Success: Greens[500],
      Warning: Reds[300],
      Error: Reds[500],
      Inverted: Grays[950],
    },
  } as const
  const Layer = {
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
  } as const
  return {
    Text: Text,
    Tables: {
      Header: { Fill: Violet[800] },
    },
    Layer: Layer,
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
