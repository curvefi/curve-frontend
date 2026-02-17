import { Blues, Grays, Greens, Reds, Violets, Yellows, Oranges } from './0_primitives'

function createLightSurfaces() {
  const Text = {
    Primary: Grays[950],
    Secondary: Grays[700],
    Tertiary: Grays[500],
    Disabled: Grays[500],
    Highlight: Blues[500],
    Feedback: {
      Success: Greens[300],
      Warning: Yellows[500],
      Error: Reds[500],
      Danger: Oranges[500],
      Inverted: Grays[50],
    },
    FilledFeedback: {
      Info: {
        Primary: Blues[500],
        Secondary: Grays[700],
      },
      Highlight: {
        Primary: Grays[50],
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
    Feedback: {
      Info: Blues[500],
      Success: Greens[300],
      Danger: Oranges[500],
      Warning: Yellows[500],
      Error: Reds[500],
    },
    Highlight: Blues[500],
    TypeAction: {
      Selected: Blues[100],
      Hover: Grays[150],
    },
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Row: {
        Default: Grays[50],
        Selected: Grays[150],
        Hover: Blues[100],
      },
      Header: {
        Fill: Grays[200],
        Label: {
          Default: Grays[700],
          Hover: Blues[500],
          Active: Grays[950],
        },
      },
    },
    Badges: {
      Label: {
        Default: Grays[950],
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
        Warning: Oranges[500],
        Accent: Blues[500],
      },
      Fill: {
        Default: Grays[50],
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Grays[50],
        Warning: Yellows[500],
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
        Primary: Grays[975],
        Secondary: Grays[700],
      },
      Alert: {
        Primary: Grays[50],
        Secondary: Grays[300],
      },
      Success: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
    },
    Feedback: {
      Success: Greens[400],
      Warning: Yellows[500],
      Error: Reds[500],
      Danger: Oranges[500],
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
    Feedback: {
      Info: Blues[50],
      Success: Greens[400],
      Warning: Yellows[500],
      Danger: Oranges[500],
      Error: Reds[500],
    },
    Highlight: Blues[50],
    TypeAction: {
      Selected: Blues[900],
      Hover: Grays[750],
    },
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Row: {
        Default: Grays[950],
        Selected: Blues[900],
        Hover: Grays[750],
      },
      Header: {
        Fill: Grays[800],
        Label: {
          Default: Grays[300],
          Hover: Blues[400],
          Active: Grays[50],
        },
      },
    },
    Badges: {
      Label: {
        Default: Grays[10],
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
        Warning: Oranges[500],
        Accent: Blues[400],
      },
      Fill: {
        Default: Grays[950],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Grays[950],
        Warning: Yellows[500],
        Accent: Blues[400],
      },
    },
  } as const
}

function createChadSurfaces() {
  const Text = {
    Feedback: {
      Warning: Yellows[500],
      Success: Greens[400],
      Danger: Oranges[500],
      Error: Reds[500],
      Inverted: Grays[50],
    },
    FilledFeedback: {
      Info: {
        Primary: Violets[500],
        Secondary: Grays[700],
      },
      Highlight: {
        Primary: Grays[50],
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
    Primary: Grays[950],
    Secondary: Grays[750],
    Tertiary: Grays[700],
    Disabled: Grays[500],
    Highlight: Violets[600],
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
    Feedback: {
      Info: Violets[700],
      Success: Greens[400],
      Warning: Yellows[500],
      Danger: Oranges[500],
      Error: Reds[500],
    },
    TypeAction: {
      Selected: Violets[50],
      Hover: Violets[200],
    },
    Highlight: Violets[800],
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Row: {
        Default: Grays[150],
        Selected: Violets[50],
        Hover: Violets[200],
      },
      Header: {
        Fill: Grays[400],
        Label: {
          Default: Grays[750],
          Hover: Violets[600],
          Active: Grays[950],
        },
      },
    },
    Badges: {
      Label: {
        Default: Grays[950],
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Violets[800],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[400],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Violets[800],
        Warning: Oranges[500],
        Accent: Violets[800],
      },
      Fill: {
        Default: Grays[150],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Grays[150],
        Warning: Yellows[500],
        Accent: Violets[800],
      },
    },
  } as const
}

function createLightInvertedSurfaces() {
  const Text = {
    Primary: Grays[50],
    Secondary: Grays[300],
    Tertiary: Grays[400],
    Disabled: Grays[500],
    Highlight: Blues[300],
    Feedback: {
      Success: Greens[300],
      Warning: Yellows[500],
      Error: Reds[500],
      Danger: Oranges[500],
      Inverted: Grays[50],
    },
    FilledFeedback: {
      Info: {
        Primary: Blues[300],
        Secondary: Grays[300],
      },
      Highlight: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Warning: {
        Primary: Grays[25],
        Secondary: Grays[300],
      },
      Alert: {
        Primary: Grays[950],
        Secondary: Grays[700],
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
    Feedback: {
      Info: Blues[800],
      Success: Greens[300],
      Warning: Yellows[500],
      Danger: Oranges[500],
      Error: Reds[500],
    },
    Highlight: Blues[500],
    TypeAction: {
      Selected: Grays[750],
      Hover: Grays[850],
    },
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Row: {
        Default: Grays[950],
        Selected: Grays[850],
        Hover: Grays[750],
      },
      Header: {
        Fill: Grays[800],
        Label: {
          Default: Grays[50],
          Hover: Blues[300],
          Active: Grays[300],
        },
      },
    },
    Badges: {
      Label: {
        Default: Grays[50],
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
        Warning: Oranges[500],
        Accent: Blues[400],
      },
      Fill: {
        Default: Grays[950],
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Grays[10],
        Warning: Yellows[500],
        Accent: Blues[400],
      },
    },
  } as const
}

function createDarkInvertedSurfaces() {
  const Text = {
    Primary: Grays[950],
    Secondary: Grays[750],
    Tertiary: Grays[700],
    Disabled: Grays[500],
    Highlight: Blues[500],
    FilledFeedback: {
      Info: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Highlight: {
        Primary: Blues[300],
        Secondary: Grays[300],
      },
      Warning: {
        Primary: Grays[10],
        Secondary: Grays[200],
      },
      Alert: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Success: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
    },
    Feedback: {
      Success: Greens[400],
      Warning: Yellows[500],
      Error: Reds[500],
      Danger: Oranges[500],
      Inverted: Grays[950],
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
    Feedback: {
      Info: Blues[500],
      Success: Greens[400],
      Warning: Yellows[500],
      Danger: Oranges[500],
      Error: Reds[500],
    },
    Highlight: Blues[50],
    TypeAction: {
      Selected: Blues[50],
      Hover: Blues[100],
    },
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Row: {
        Default: Grays[75],
        Selected: Blues[50],
        Hover: Blues[100],
      },
      Header: {
        Fill: Grays[200],
        Label: {
          Default: Grays[750],
          Hover: Blues[500],
          Active: Grays[950],
        },
      },
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
        Default: Grays[400],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Blues[500],
        Warning: Oranges[500],
        Accent: Blues[500],
      },
      Fill: {
        Default: Grays[75],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Grays[75],
        Warning: Yellows[500],
        Accent: Blues[500],
      },
    },
  } as const
}

function createChadInvertedSurfaces() {
  const Text = {
    Feedback: {
      Warning: Yellows[500],
      Success: Greens[400],
      Error: Reds[500],
      Danger: Oranges[500],
      Inverted: Grays[50],
    },
    FilledFeedback: {
      Info: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Highlight: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Warning: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Alert: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
      Success: {
        Primary: Grays[950],
        Secondary: Grays[700],
      },
    },
    Primary: Grays[50],
    Secondary: Grays[300],
    Tertiary: Grays[400],
    Disabled: Grays[500],
    Highlight: Violets[400],
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
    Feedback: {
      Info: Grays[850],
      Success: Greens[400],
      Warning: Yellows[500],
      Error: Reds[500],
      Danger: Oranges[500],
    },
    TypeAction: {
      Selected: Violets[900],
      Hover: Violets[800],
    },
    Highlight: Violets[950],
  } as const
  return {
    Text,
    Layer,
    Tables: {
      Row: {
        Default: Violets[950],
        Selected: Violets[900],
        Hover: Violets[800],
      },
      Header: {
        Fill: Violets[700],
        Label: {
          Default: Grays[300],
          Hover: Violets[400],
          Active: Grays[50],
        },
      },
    },
    Badges: {
      Label: {
        Default: Grays[50],
        Active: Grays[10],
        Alert: Grays[10],
        Highlight: Violets[200],
        Warning: Grays[975],
        Accent: Grays[10],
      },
      Border: {
        Default: Grays[600],
        Active: Greens[400],
        Alert: Reds[500],
        Highlight: Violets[200],
        Warning: Oranges[500],
        Accent: Violets[400],
      },
      Fill: {
        Default: Violets[950],
        Active: Greens[500],
        Alert: Reds[500],
        Highlight: Violets[950],
        Warning: Yellows[500],
        Accent: Violets[400],
      },
    },
  } as const
}

export const SurfacesAndText = {
  plain: { Light: createLightSurfaces(), Dark: createDarkSurfaces(), Chad: createChadSurfaces() },
  inverted: {
    Light: createLightInvertedSurfaces(),
    Dark: createDarkInvertedSurfaces(),
    Chad: createChadInvertedSurfaces(),
  },
}
