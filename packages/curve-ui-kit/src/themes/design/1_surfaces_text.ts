import { Grays, Blues, Violet, Reds, Greens } from './0_primitives'

export const SurfacesAndText = {
  plain: {
    Light: {
      Text: {
        primary: Grays[950],
        secondary: Grays[700],
        tertiary: Grays[500],
        Disabled: Grays[400],
        highlight: Blues[500],
        Feedback: {
          Success: Greens[500],
          Warning: Reds[400],
          Error: Reds[500],
          Inverted: Grays[50],
        },
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
        TypeAction: {
          Selected: Grays[100],
          Hover: Grays[150],
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
    Dark: {
      Text: {
        primary: Grays[50],
        secondary: Grays[300],
        tertiary: Grays[400],
        Disabled: Grays[500],
        highlight: Blues[500],
        Feedback: {
          Success: Greens[400],
          Warning: Reds[300],
          Error: Reds[500],
          Inverted: Grays[950],
        },
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
        TypeAction: {
          Selected: Grays[750],
          Hover: Grays[800],
        },
        Feedback: {
          Info: Blues[50],
          Success: Greens[300],
          Warning: Reds[400],
          Error: Reds[500],
        },
      },
      Tables: {
        Header: { Fill: Grays[800] },
      },
    },
    Chad: {
      Text: {
        primary: Grays[950],
        secondary: Grays[700],
        tertiary: Grays[500],
        Disabled: Grays[400],
        highlight: Violet[600],
        Feedback: {
          Success: Greens[600],
          Warning: Reds[400],
          Error: Reds[500],
          Inverted: Grays[50],
        },
      },
      Tables: {
        Header: { Fill: Violet[50] },
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
        Disabled: Grays[400],
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
        Disabled: Grays[500],
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
