import { Grays, Blues, Violet } from './0_primitives'

export const SurfacesAndText = {
  plain: {
    Light: {
      Text: {
        primary: Grays[950],
        secondary: Grays[700],
        tertiary: Grays[500],
        Disabled: Grays[400],
        highlight: Blues[500],
      },
      Layer: {
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
      },
      Tables: {
        Header_Fill: Grays[200],
      },
    },
    Dark: {
      Text: {
        primary: Grays[50],
        secondary: Grays[300],
        tertiary: Grays[400],
        Disabled: Grays[500],
        highlight: Blues[500],
      },
      Layer: {
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
      },
      Tables: {
        Header_Fill: Grays[800],
      },
    },
    Chad: {
      Text: {
        primary: Grays[950],
        secondary: Grays[700],
        tertiary: Grays[500],
        Disabled: Grays[400],
        highlight: Violet[600],
      },
      Tables: {
        Header_Fill: Violet[400],
      },
      Layer: {
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
      },
    },
  },
  inverted: {
    Light: {
      Text: {
        primary: Grays[50],
        secondary: Grays[300],
        tertiary: Grays[400],
        Disabled: Grays[500],
        highlight: Blues[500],
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
      },
      Tables: {
        Header_Fill: Grays[800],
      },
    },
    Dark: {
      Text: {
        primary: Grays[950],
        secondary: Grays[700],
        tertiary: Grays[600],
        Disabled: Grays[400],
        highlight: Blues[500],
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
      },
      Tables: {
        Header_Fill: Grays[200],
      },
    },
    Chad: {
      Text: {
        primary: Grays[50],
        secondary: Grays[300],
        tertiary: Grays[400],
        Disabled: Grays[500],
        highlight: Violet[400],
      },
      Tables: {
        Header_Fill: Violet[800],
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
      },
    },
  },
}
