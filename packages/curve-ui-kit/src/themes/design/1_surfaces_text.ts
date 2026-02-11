import { Blues, Grays, Greens, Reds, Transparent, Violets, Yellows, Oranges } from './0_primitives'

/* TOKENS-STUDIO:BEGIN_SURFACES_PLAIN */
const PlainSurfaces = {
  Light: {
    App: {
      Background: '#f0edeb',
    },
    Badges: {
      Border: {
        Accent: Blues['500'],
        Active: Blues['500'],
        Alert: Reds['500'],
        Default: Grays['400'],
        Highlight: Blues['500'],
        Warning: Oranges['500'],
      },
      Fill: {
        Accent: Blues['500'],
        Active: Greens['400'],
        Alert: Reds['500'],
        Default: Grays['50'],
        Highlight: Grays['50'],
        Warning: Yellows['500'],
      },
      Label: {
        Accent: Grays['10'],
        Active: Grays['10'],
        Alert: Grays['10'],
        Default: Grays['950'],
        Highlight: Blues['500'],
        Warning: Grays['975'],
      },
    },
    Button: {
      Error: {
        Default: {
          Fill: Reds['500'],
          'Label & Icon': Grays['10'],
        },
        Disabled: {
          Fill: Reds['800'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['10'],
          'Label & Icon': Reds['500'],
        },
      },
      Ghost: {
        Default: {
          'Label & Icon': Blues['500'],
        },
        Disabled: {
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Transparent,
          'Label & Icon': Grays['975'],
        },
      },
      Navigation: {
        Current: {
          Fill: Blues['500'],
          'Label & Icon': Grays['10'],
        },
        Default: {
          'Label & Icon': Grays['700'],
        },
        Hover: {
          Fill: Grays['50'],
          'Label & Icon': Grays['950'],
        },
      },
      Outline: {
        Default: {
          'Label & Icon': Grays['950'],
          Outline: Grays['950'],
        },
        Disabled: {
          'Label & Icon': Grays['500'],
          Outline: Grays['500'],
        },
        Hover: {
          'Label & Icon': Blues['500'],
          Outline: Blues['500'],
        },
      },
      Primary: {
        Default: {
          Fill: Blues['500'],
          'Label & Icon': Grays['50'],
        },
        Disabled: {
          Fill: Blues['100'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['950'],
          'Label & Icon': Grays['50'],
        },
      },
      Secondary: {
        Default: {
          Fill: Grays['950'],
          'Label & Icon': Grays['50'],
        },
        Disabled: {
          Fill: Grays['400'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Blues['500'],
          'Label & Icon': Grays['50'],
        },
      },
      Success: {
        Default: {
          Fill: Greens['400'],
          'Label & Icon': Grays['900'],
        },
        Disabled: {
          Fill: Greens['600'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['900'],
          'Label & Icon': Greens['400'],
        },
      },
    },
    Layer: {
      '1': {
        Fill: Grays['50'],
        Outline: Grays['300'],
      },
      '2': {
        Fill: Grays['100'],
        Outline: Grays['200'],
      },
      '3': {
        Fill: Grays['50'],
        Outline: Grays['300'],
      },
      Feedback: {
        Error: Reds['500'],
        Info: Blues['500'],
        Success: Greens['600'],
        Warning: Yellows['500'],
      },
      Highlight: Blues['500'],
      TypeAction: {
        Hover: Grays['10'],
        Selected: Blues['100'],
      },
    },
    Tables: {
      Header: {
        Fill: Grays['200'],
        Label: {
          Active: Grays['950'],
          Default: Grays['700'],
          Hover: Blues['500'],
        },
      },
      Row: {
        Default: Grays['50'],
        Hover: Grays['10'],
        Selected: Blues['100'],
      },
    },
    Text: {
      Disabled: Grays['500'],
      Feedback: {
        Error: Reds['500'],
        Success: Greens['600'],
        Warning: Oranges['500'],
      },
      FilledFeedback: {
        Alert: {
          Primary: Grays['50'],
          Secondary: Grays['300'],
        },
        Highlight: {
          Primary: Grays['50'],
          Secondary: Grays['300'],
        },
        Info: {
          Primary: Blues['500'],
          Secondary: Grays['700'],
        },
        Success: {
          Primary: Grays['50'],
          Secondary: Grays['300'],
        },
        Warning: {
          Primary: Grays['950'],
          Secondary: Grays['700'],
        },
      },
      Highlight: Blues['500'],
      Primary: Grays['950'],
      Secondary: Grays['700'],
      Tertiary: Grays['500'],
    },
  },
  Dark: {
    App: {
      Background: '#12110f',
    },
    Badges: {
      Border: {
        Accent: Blues['400'],
        Active: Blues['400'],
        Alert: Reds['500'],
        Default: Grays['600'],
        Highlight: Blues['400'],
        Warning: Oranges['500'],
      },
      Fill: {
        Accent: Blues['400'],
        Active: Greens['500'],
        Alert: Reds['500'],
        Default: Grays['950'],
        Highlight: Grays['950'],
        Warning: Yellows['500'],
      },
      Label: {
        Accent: Grays['10'],
        Active: Grays['10'],
        Alert: Grays['10'],
        Default: Grays['10'],
        Highlight: Blues['400'],
        Warning: Grays['975'],
      },
    },
    Button: {
      Error: {
        Default: {
          Fill: Reds['500'],
          'Label & Icon': Grays['10'],
        },
        Disabled: {
          Fill: Reds['800'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['10'],
          'Label & Icon': Reds['500'],
        },
      },
      'Focus Outline': Blues['500'],
      Ghost: {
        Default: {
          'Label & Icon': Blues['400'],
        },
        Disabled: {
          'Label & Icon': Blues['700'],
        },
        Hover: {
          Fill: Transparent,
          'Label & Icon': Grays['50'],
        },
      },
      Navigation: {
        Current: {
          Fill: Blues['50'],
          'Label & Icon': Grays['975'],
        },
        Default: {
          'Label & Icon': Grays['400'],
        },
        Hover: {
          Fill: Grays['950'],
          'Label & Icon': Grays['50'],
        },
      },
      Outline: {
        Default: {
          'Label & Icon': Grays['50'],
          Outline: Grays['50'],
        },
        Disabled: {
          'Label & Icon': Grays['500'],
          Outline: Grays['500'],
        },
        Hover: {
          'Label & Icon': Blues['400'],
          Outline: Blues['400'],
        },
      },
      Primary: {
        Default: {
          Fill: Blues['500'],
          'Label & Icon': Grays['50'],
        },
        Disabled: {
          Fill: Blues['200'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['50'],
          'Label & Icon': Grays['900'],
        },
      },
      Secondary: {
        Default: {
          Fill: Grays['50'],
          'Label & Icon': Grays['900'],
        },
        Disabled: {
          Fill: Grays['750'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Blues['500'],
          'Label & Icon': Grays['50'],
        },
      },
      Success: {
        Default: {
          Fill: Greens['400'],
          'Label & Icon': Grays['900'],
        },
        Disabled: {
          Fill: Greens['600'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['900'],
          'Label & Icon': Greens['400'],
        },
      },
    },
    Layer: {
      '1': {
        Fill: Grays['950'],
        Outline: Grays['900'],
      },
      '2': {
        Fill: Grays['900'],
        Outline: Grays['800'],
      },
      '3': {
        Fill: Grays['800'],
        Outline: Grays['700'],
      },
      Feedback: {
        Error: Reds['500'],
        Info: Blues['50'],
        Success: Greens['300'],
        Warning: Yellows['500'],
      },
      Highlight: Blues['50'],
      TypeAction: {
        Hover: Grays['750'],
        Selected: Grays['850'],
      },
    },
    Tables: {
      Header: {
        Fill: Grays['800'],
        Label: {
          Active: Grays['50'],
          Default: Grays['300'],
          Hover: Blues['400'],
        },
      },
      Row: {
        Default: Grays['950'],
        Hover: Grays['750'],
        Selected: Grays['850'],
      },
    },
    Text: {
      Disabled: Grays['500'],
      Feedback: {
        Error: Reds['500'],
        Success: Greens['400'],
        Warning: Yellows['500'],
      },
      FilledFeedback: {
        Alert: {
          Primary: Grays['50'],
          Secondary: Grays['300'],
        },
        Highlight: {
          Primary: Blues['500'],
          Secondary: Grays['700'],
        },
        Info: {
          Primary: Blues['300'],
          Secondary: Grays['300'],
        },
        Success: {
          Primary: Grays['950'],
          Secondary: Grays['700'],
        },
        Warning: {
          Primary: Grays['975'],
          Secondary: Grays['700'],
        },
      },
      Highlight: Blues['400'],
      Primary: Grays['50'],
      Secondary: Grays['300'],
      Tertiary: Grays['400'],
    },
  },
  Chad: {
    App: {
      Background: '#bdbbec',
    },
    Badges: {
      Border: {
        Accent: Violets['800'],
        Active: Violets['500'],
        Alert: Reds['500'],
        Default: Grays['400'],
        Highlight: Violets['800'],
        Warning: Oranges['500'],
      },
      Fill: {
        Accent: Violets['800'],
        Active: Greens['500'],
        Alert: Reds['500'],
        Default: Grays['150'],
        Highlight: Grays['150'],
        Warning: Yellows['500'],
      },
      Label: {
        Accent: Grays['10'],
        Active: Grays['10'],
        Alert: Grays['10'],
        Default: Grays['950'],
        Highlight: Violets['800'],
        Warning: Grays['975'],
      },
    },
    Button: {
      Error: {
        Default: {
          Fill: Reds['500'],
          'Label & Icon': Grays['10'],
        },
        Disabled: {
          Fill: Reds['800'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['10'],
          'Label & Icon': Reds['500'],
        },
      },
      'Focus Outline': Violets['500'],
      Ghost: {
        Default: {
          'Label & Icon': Violets['600'],
        },
        Disabled: {
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Transparent,
          'Label & Icon': Violets['800'],
        },
      },
      Navigation: {
        Current: {
          Fill: Violets['800'],
          'Label & Icon': Grays['10'],
        },
        Default: {
          'Label & Icon': Grays['700'],
        },
        Hover: {
          Fill: Grays['150'],
          'Label & Icon': Grays['950'],
        },
      },
      Outline: {
        Default: {
          'Label & Icon': Grays['950'],
          Outline: Grays['950'],
        },
        Disabled: {
          'Label & Icon': Grays['500'],
          Outline: Grays['500'],
        },
        Hover: {
          'Label & Icon': Violets['500'],
          Outline: Violets['500'],
        },
      },
      Primary: {
        Default: {
          Fill: Violets['950'],
          'Label & Icon': Grays['50'],
        },
        Disabled: {
          Fill: Violets['200'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['900'],
          'Label & Icon': Grays['50'],
        },
      },
      Secondary: {
        Default: {
          Fill: Grays['900'],
          'Label & Icon': Grays['50'],
        },
        Disabled: {
          Fill: Grays['600'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Violets['500'],
          'Label & Icon': Grays['50'],
        },
      },
      Success: {
        Default: {
          Fill: Greens['400'],
          'Label & Icon': Grays['900'],
        },
        Disabled: {
          Fill: Greens['600'],
          'Label & Icon': Grays['500'],
        },
        Hover: {
          Fill: Grays['900'],
          'Label & Icon': Greens['400'],
        },
      },
    },
    Layer: {
      '1': {
        Fill: Grays['150'],
        Outline: Grays['400'],
      },
      '2': {
        Fill: Grays['200'],
        Outline: Grays['500'],
      },
      '3': {
        Fill: Grays['300'],
        Outline: Grays['600'],
      },
      Feedback: {
        Error: Reds['500'],
        Info: Violets['700'],
        Success: Greens['600'],
        Warning: Yellows['500'],
      },
      Highlight: Violets['800'],
      TypeAction: {
        Hover: Grays['75'],
        Selected: Violets['50'],
      },
    },
    Tables: {
      Header: {
        Fill: Grays['300'],
        Label: {
          Active: Grays['950'],
          Default: Grays['750'],
          Hover: Violets['600'],
        },
      },
      Row: {
        Default: Grays['150'],
        Hover: Grays['75'],
        Selected: Violets['50'],
      },
    },
    Text: {
      Disabled: Grays['500'],
      Feedback: {
        Error: Reds['500'],
        Success: Greens['600'],
        Warning: Oranges['500'],
      },
      FilledFeedback: {
        Alert: {
          Primary: Grays['50'],
          Secondary: Grays['300'],
        },
        Highlight: {
          Primary: Grays['50'],
          Secondary: Grays['300'],
        },
        Info: {
          Primary: Violets['500'],
          Secondary: Grays['700'],
        },
        Success: {
          Primary: Grays['50'],
          Secondary: Grays['300'],
        },
        Warning: {
          Primary: Grays['950'],
          Secondary: Grays['700'],
        },
      },
      Highlight: Violets['600'],
      Primary: Grays['950'],
      Secondary: Grays['750'],
      Tertiary: Grays['700'],
    },
  },
} as const
/* TOKENS-STUDIO:END_SURFACES_PLAIN */

function createLightInvertedSurfaces() {
  const Text = {
    Primary: Grays[50],
    Secondary: Grays[300],
    Tertiary: Grays[400],
    Disabled: Grays[500],
    Highlight: Blues[300],
    Feedback: {
      Success: Greens[300],
      Warning: Oranges[500],
      Error: Reds[500],
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
      Warning: Oranges[500],
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
      Success: Greens[600],
      Warning: Oranges[500],
      Error: Reds[500],
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
      Success: Greens[600],
      Warning: Yellows[500],
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
      Success: Greens[500],
      Error: Reds[500],
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
      Success: Greens[300],
      Warning: Oranges[500],
      Error: Reds[500],
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
  plain: PlainSurfaces,
  inverted: {
    Light: createLightInvertedSurfaces(),
    Dark: createDarkInvertedSurfaces(),
    Chad: createChadInvertedSurfaces(),
  },
}
