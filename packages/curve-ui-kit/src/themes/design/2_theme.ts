import { alpha } from '@mui/material'
import { Blues, Grays, Greens, Oranges, Reds, Transparent, Violets, Yellows } from './0_primitives'
import { SizesAndSpaces } from './1_sizes_spaces'
import { SurfacesAndText } from './1_surfaces_text'

/* TOKENS-STUDIO:BEGIN_THEME_CONSTANTS */
const ImportedThemeConstants = {
  light: {
    appBackground: '#f0edeb',
    slider: {
      default: {
        SliderThumbImage: '/mui/slider-thumb-white.svg',
        SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
      },
      hover: {
        SliderThumbImage: '/mui/slider-thumb-white.svg',
        SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
      },
    },
  },
  dark: {
    appBackground: '#12110f',
    slider: {
      default: {
        SliderThumbImage: '/mui/slider-thumb-blue.svg',
        SliderThumbImageVertical: '/mui/slider-thumb-blue-90.svg',
      },
      hover: {
        SliderThumbImage: '/mui/slider-thumb-white.svg',
        SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
      },
    },
  },
  chad: {
    appBackground: '#bdbbec',
    slider: {
      default: {
        SliderThumbImage: '/mui/slider-thumb-white.svg',
        SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
      },
      hover: {
        SliderThumbImage: '/mui/slider-thumb-white.svg',
        SliderThumbImageVertical: '/mui/slider-thumb-white-90.svg',
      },
    },
  },
} as const
/* TOKENS-STUDIO:END_THEME_CONSTANTS */

/* TOKENS-STUDIO:BEGIN_THEME_TOKENS */
const ImportedThemeTokens = {
  light: {
    App: {
      Background: SurfacesAndText.plain.Light['App']['Background'],
    },
    Badges: {
      Border: {
        Accent: SurfacesAndText.plain.Light['Badges']['Border']['Accent'],
        Active: SurfacesAndText.plain.Light['Badges']['Border']['Active'],
        Alert: SurfacesAndText.plain.Light['Badges']['Border']['Alert'],
        Default: SurfacesAndText.plain.Light['Badges']['Border']['Default'],
        Highlight: SurfacesAndText.plain.Light['Badges']['Border']['Highlight'],
        Warning: SurfacesAndText.plain.Light['Badges']['Border']['Warning'],
      },
      Fill: {
        Accent: SurfacesAndText.plain.Light['Badges']['Fill']['Accent'],
        Active: SurfacesAndText.plain.Light['Badges']['Fill']['Active'],
        Alert: SurfacesAndText.plain.Light['Badges']['Fill']['Alert'],
        Default: SurfacesAndText.plain.Light['Badges']['Fill']['Default'],
        Highlight: SurfacesAndText.plain.Light['Badges']['Fill']['Highlight'],
        Warning: SurfacesAndText.plain.Light['Badges']['Fill']['Warning'],
      },
      Label: {
        Accent: SurfacesAndText.plain.Light['Badges']['Label']['Accent'],
        Active: SurfacesAndText.plain.Light['Badges']['Label']['Active'],
        Alert: SurfacesAndText.plain.Light['Badges']['Label']['Alert'],
        Default: SurfacesAndText.plain.Light['Badges']['Label']['Default'],
        Highlight: SurfacesAndText.plain.Light['Badges']['Label']['Highlight'],
        Warning: SurfacesAndText.plain.Light['Badges']['Label']['Warning'],
      },
    },
    Blues: {
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
    Button: {
      Error: {
        Default: {
          Fill: SurfacesAndText.plain.Light['Button']['Error']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Error']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Light['Button']['Error']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Error']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Light['Button']['Error']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Error']['Hover']['Label & Icon'],
        },
      },
      'Focus Outline': Blues['500'],
      'Focus Outline Width': '2px',
      Ghost: {
        Default: {
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Ghost']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: Grays['500'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Ghost']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Light['Button']['Ghost']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Ghost']['Hover']['Label & Icon'],
        },
      },
      Navigation: {
        Current: {
          Fill: SurfacesAndText.plain.Light['Button']['Navigation']['Current']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Navigation']['Current']['Label & Icon'],
        },
        Default: {
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Navigation']['Default']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Light['Button']['Navigation']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Navigation']['Hover']['Label & Icon'],
        },
      },
      Outline: {
        Default: {
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Outline']['Default']['Label & Icon'],
          Outline: SurfacesAndText.plain.Light['Button']['Outline']['Default']['Outline'],
        },
        Disabled: {
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Outline']['Disabled']['Label & Icon'],
          Outline: SurfacesAndText.plain.Light['Button']['Outline']['Disabled']['Outline'],
        },
        Hover: {
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Outline']['Hover']['Label & Icon'],
          Outline: SurfacesAndText.plain.Light['Button']['Outline']['Hover']['Outline'],
        },
      },
      Outlined: {
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
          Fill: SurfacesAndText.plain.Light['Button']['Primary']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Primary']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Light['Button']['Primary']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Primary']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Light['Button']['Primary']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Primary']['Hover']['Label & Icon'],
        },
      },
      Radius: {
        lg: '0px',
        md: '0px',
        sm: '0px',
        xs: '0px',
      },
      Secondary: {
        Default: {
          Fill: SurfacesAndText.plain.Light['Button']['Secondary']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Secondary']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Light['Button']['Secondary']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Secondary']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Light['Button']['Secondary']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Secondary']['Hover']['Label & Icon'],
        },
      },
      Success: {
        Default: {
          Fill: SurfacesAndText.plain.Light['Button']['Success']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Success']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Light['Button']['Success']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Success']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Light['Button']['Success']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Light['Button']['Success']['Hover']['Label & Icon'],
        },
      },
    },
    Chart: {
      Candles: {
        Negative: Reds['600'],
        Positive: Greens['400'],
      },
      Index: {
        '1': Blues['500'],
        '2': Greens['500'],
        '3': Yellows['600'],
        '4': Violets['500'],
        '5': Oranges['500'],
        '6': Blues['300'],
        '7': Greens['300'],
        '8': Reds['700'],
        'Line 1': Blues['500'],
        'Line 2': Greens['500'],
        'Line 3': Yellows['600'],
        Negative: Reds['600'],
        Positive: Greens['400'],
      },
      'Liquidation Zone': {
        Current: Yellows['400'],
        Future: Blues['200'],
      },
    },
    Chips: {
      Current: {
        Fill: Grays['100'],
        'Label & Icon': Blues['500'],
        Outline: Blues['500'],
      },
      Default: {
        Fill: Grays['100'],
        'Label & Icon': Grays['950'],
        Stroke: Grays['950'],
      },
      Hover: {
        Fill: Grays['900'],
        'Label & Icon': Grays['50'],
      },
    },
    Color: {
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
    },
    Feedback: {
      Danger: Oranges['500'],
      Error: Reds['500'],
      Success: Greens['300'],
      Warning: Yellows['500'],
    },
    Grays: {
      '10': Grays['10'],
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
    Greens: {
      '100': Greens['100'],
      '200': Greens['200'],
      '300': Greens['300'],
      '400': Greens['400'],
      '500': Greens['500'],
      '600': Greens['600'],
      '700': Greens['700'],
      '800': Greens['800'],
    },
    'Input & Select': {
      Base: {
        Default: {
          Border: {
            Active: Blues['500'],
            Default: Grays['200'],
            Error: Reds['500'],
            Filled: Grays['850'],
          },
          Fill: {
            Active: Grays['50'],
            Default: Grays['100'],
          },
        },
        Nested: {
          Border: {
            Active: Blues['500'],
            Default: Grays['400'],
            Error: Reds['500'],
            Filled: Grays['850'],
          },
          Fill: Grays['100'],
          Nested: Grays['10'],
        },
      },
      Large: {
        Default: {
          Fill: Grays['100'],
          Outline: Grays['200'],
        },
      },
    },
    Layer: {
      '1': {
        Fill: SurfacesAndText.plain.Light['Layer']['1']['Fill'],
        Outline: SurfacesAndText.plain.Light['Layer']['1']['Outline'],
      },
      '2': {
        Fill: SurfacesAndText.plain.Light['Layer']['2']['Fill'],
        Outline: SurfacesAndText.plain.Light['Layer']['2']['Outline'],
      },
      '3': {
        Fill: SurfacesAndText.plain.Light['Layer']['3']['Fill'],
        Outline: SurfacesAndText.plain.Light['Layer']['3']['Outline'],
      },
      App: {
        Background: '#f0edeb',
      },
      Feedback: {
        Error: SurfacesAndText.plain.Light['Layer']['Feedback']['Error'],
        Info: SurfacesAndText.plain.Light['Layer']['Feedback']['Info'],
        Informational: Blues['500'],
        Success: SurfacesAndText.plain.Light['Layer']['Feedback']['Success'],
        Warning: SurfacesAndText.plain.Light['Layer']['Feedback']['Warning'],
      },
      Highlight: {
        Fill: Blues['500'],
        Outline: Blues['500'],
      },
      TypeAction: {
        Hover: SurfacesAndText.plain.Light['Layer']['TypeAction']['Hover'],
        Selected: SurfacesAndText.plain.Light['Layer']['TypeAction']['Selected'],
      },
    },
    Orange: {
      '50': Oranges['50'],
      '100': Oranges['100'],
      '200': Oranges['200'],
      '300': Oranges['300'],
      '400': Oranges['400'],
      '500': Oranges['500'],
      '600': Oranges['600'],
      '700': Oranges['700'],
      '800': Oranges['800'],
      '900': Oranges['900'],
      '950': Oranges['950'],
    },
    Reds: {
      '200': Reds['200'],
      '300': Reds['300'],
      '400': Reds['400'],
      '500': Reds['500'],
      '600': Reds['600'],
      '700': Reds['700'],
      '800': Reds['800'],
    },
    Table: {
      Header: {
        Fill: Grays['200'],
        'Label & icon': {
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
    Tables: {
      Header: {
        Fill: SurfacesAndText.plain.Light['Tables']['Header']['Fill'],
        'Label & Icon': {
          Active: Grays['950'],
          Default: Grays['700'],
          Hover: Blues['500'],
        },
      },
      Row: {
        Default: SurfacesAndText.plain.Light['Tables']['Row']['Default'],
        Hover: SurfacesAndText.plain.Light['Tables']['Row']['Hover'],
        Selected: SurfacesAndText.plain.Light['Tables']['Row']['Selected'],
      },
    },
    Tabs: {
      Contained: {
        Current: {
          Fill: Grays['50'],
          'Label & Icon': Grays['950'],
          Outline: Blues['500'],
        },
        Default: {
          Fill: '#f0edeb',
          'Label & Icon': Grays['700'],
        },
        Hover: {
          Fill: Grays['900'],
          'Label & Icon': Blues['500'],
        },
      },
      OverLined: {
        Current: {
          'Label & Icon': Grays['950'],
          Outline: Blues['500'],
        },
        Default: {
          'Label & Icon': Grays['700'],
          Outline: Grays['200'],
        },
        Hover: {
          'Label & Icon': Blues['500'],
          Outline: Blues['500'],
        },
      },
      UnderLined: {
        'Container Border': Grays['300'],
        Current: {
          'Label & Icon': Blues['500'],
          Outline: Blues['500'],
        },
        Default: {
          'Label & Icon': Grays['700'],
          Outline: Grays['200'],
        },
        Hover: {
          'Label & Icon': Blues['500'],
          Outline: Blues['500'],
        },
      },
    },
    Text: {
      colorTest: '#ffffff',
      Disabled: SurfacesAndText.plain.Light['Text']['Disabled'],
      Feedback: {
        Error: SurfacesAndText.plain.Light['Text']['Feedback']['Error'],
        Success: SurfacesAndText.plain.Light['Text']['Feedback']['Success'],
        Warning: SurfacesAndText.plain.Light['Text']['Feedback']['Warning'],
      },
      FilledFeedback: {
        alert: {
          primary: Grays['50'],
          secondary: Grays['300'],
        },
        highlight: {
          primary: Grays['50'],
          secondary: Grays['300'],
        },
        info: {
          primary: Blues['500'],
          secondary: Grays['700'],
        },
        success: {
          primary: Grays['50'],
          secondary: Grays['300'],
        },
        warning: {
          primary: Grays['950'],
          secondary: Grays['700'],
        },
      },
      Highlight: SurfacesAndText.plain.Light['Text']['Highlight'],
      Primary: SurfacesAndText.plain.Light['Text']['Primary'],
      Secondary: SurfacesAndText.plain.Light['Text']['Secondary'],
      Tertiary: SurfacesAndText.plain.Light['Text']['Tertiary'],
      TextColors: {
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
    Toggles: {
      Current: {
        Fill: Grays['900'],
        'Label & Icon': Grays['50'],
      },
      Default: {
        Fill: Grays['100'],
        'Label & Icon': Grays['950'],
      },
      Hover: {
        Fill: Grays['50'],
        'Label & Icon': Blues['500'],
      },
    },
    Transparent: Transparent,
    Violet: {
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
    Yellow: {
      '50': Yellows['50'],
      '100': Yellows['100'],
      '200': Yellows['200'],
      '300': Yellows['300'],
      '400': Yellows['400'],
      '500': Yellows['500'],
      '600': Yellows['600'],
      '700': Yellows['700'],
      '800': Yellows['800'],
      '900': Yellows['900'],
      '950': Yellows['950'],
    },
  },
  dark: {
    App: {
      Background: SurfacesAndText.plain.Dark['App']['Background'],
    },
    Badges: {
      Border: {
        Accent: SurfacesAndText.plain.Dark['Badges']['Border']['Accent'],
        Active: SurfacesAndText.plain.Dark['Badges']['Border']['Active'],
        Alert: SurfacesAndText.plain.Dark['Badges']['Border']['Alert'],
        Default: SurfacesAndText.plain.Dark['Badges']['Border']['Default'],
        Highlight: SurfacesAndText.plain.Dark['Badges']['Border']['Highlight'],
        Warning: SurfacesAndText.plain.Dark['Badges']['Border']['Warning'],
      },
      Fill: {
        Accent: SurfacesAndText.plain.Dark['Badges']['Fill']['Accent'],
        Active: SurfacesAndText.plain.Dark['Badges']['Fill']['Active'],
        Alert: SurfacesAndText.plain.Dark['Badges']['Fill']['Alert'],
        Default: SurfacesAndText.plain.Dark['Badges']['Fill']['Default'],
        Highlight: SurfacesAndText.plain.Dark['Badges']['Fill']['Highlight'],
        Warning: SurfacesAndText.plain.Dark['Badges']['Fill']['Warning'],
      },
      Label: {
        Accent: SurfacesAndText.plain.Dark['Badges']['Label']['Accent'],
        Active: SurfacesAndText.plain.Dark['Badges']['Label']['Active'],
        Alert: SurfacesAndText.plain.Dark['Badges']['Label']['Alert'],
        Default: SurfacesAndText.plain.Dark['Badges']['Label']['Default'],
        Highlight: SurfacesAndText.plain.Dark['Badges']['Label']['Highlight'],
        Warning: SurfacesAndText.plain.Dark['Badges']['Label']['Warning'],
      },
    },
    Blues: {
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
    Button: {
      Error: {
        Default: {
          Fill: SurfacesAndText.plain.Dark['Button']['Error']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Error']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Dark['Button']['Error']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Error']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Dark['Button']['Error']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Error']['Hover']['Label & Icon'],
        },
      },
      'Focus Outline': SurfacesAndText.plain.Dark['Button']['Focus Outline'],
      'Focus Outline Width': '2px',
      Ghost: {
        Default: {
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Ghost']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: Grays['850'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Ghost']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Dark['Button']['Ghost']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Ghost']['Hover']['Label & Icon'],
        },
      },
      Navigation: {
        Current: {
          Fill: SurfacesAndText.plain.Dark['Button']['Navigation']['Current']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Navigation']['Current']['Label & Icon'],
        },
        Default: {
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Navigation']['Default']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Dark['Button']['Navigation']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Navigation']['Hover']['Label & Icon'],
        },
      },
      Outline: {
        Default: {
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Outline']['Default']['Label & Icon'],
          Outline: SurfacesAndText.plain.Dark['Button']['Outline']['Default']['Outline'],
        },
        Disabled: {
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Outline']['Disabled']['Label & Icon'],
          Outline: SurfacesAndText.plain.Dark['Button']['Outline']['Disabled']['Outline'],
        },
        Hover: {
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Outline']['Hover']['Label & Icon'],
          Outline: SurfacesAndText.plain.Dark['Button']['Outline']['Hover']['Outline'],
        },
      },
      Outlined: {
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
          Fill: SurfacesAndText.plain.Dark['Button']['Primary']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Primary']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Dark['Button']['Primary']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Primary']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Dark['Button']['Primary']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Primary']['Hover']['Label & Icon'],
        },
      },
      Radius: {
        lg: '0px',
        md: '0px',
        sm: '0px',
        xs: '0px',
      },
      Secondary: {
        Default: {
          Fill: SurfacesAndText.plain.Dark['Button']['Secondary']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Secondary']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Dark['Button']['Secondary']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Secondary']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Dark['Button']['Secondary']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Secondary']['Hover']['Label & Icon'],
        },
      },
      Success: {
        Default: {
          Fill: SurfacesAndText.plain.Dark['Button']['Success']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Success']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Dark['Button']['Success']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Success']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Dark['Button']['Success']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Dark['Button']['Success']['Hover']['Label & Icon'],
        },
      },
    },
    Chart: {
      Candles: {
        Negative: Reds['500'],
        Positive: Greens['300'],
      },
      Index: {
        '1': Blues['500'],
        '2': Greens['400'],
        '3': Yellows['500'],
        '4': Blues['400'],
        '5': Oranges['500'],
        '6': Blues['300'],
        '7': Greens['300'],
        '8': Reds['200'],
        'Line 1': Blues['500'],
        'Line 2': Greens['400'],
        'Line 3': Yellows['500'],
        Negative: Reds['500'],
        Positive: Greens['300'],
      },
      'Liquidation Zone': {
        Current: Oranges['900'],
        Future: Blues['800'],
      },
    },
    Chips: {
      Current: {
        Fill: Grays['900'],
        'Label & Icon': Blues['500'],
        Outline: Blues['500'],
      },
      Default: {
        Fill: Grays['900'],
        'Label & Icon': Grays['50'],
        Stroke: Grays['50'],
      },
      Hover: {
        Fill: Grays['75'],
        'Label & Icon': Grays['950'],
      },
    },
    Color: {
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
    },
    Feedback: {
      Danger: Oranges['500'],
      Error: Reds['500'],
      Success: Greens['400'],
      Warning: Yellows['500'],
    },
    Grays: {
      '10': Grays['10'],
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
    Greens: {
      '100': Greens['100'],
      '200': Greens['200'],
      '300': Greens['300'],
      '400': Greens['400'],
      '500': Greens['500'],
      '600': Greens['600'],
      '700': Greens['700'],
      '800': Greens['800'],
    },
    'Input & Select': {
      Base: {
        Default: {
          Border: {
            Active: Blues['400'],
            Default: Grays['800'],
            Error: Reds['500'],
            Filled: Grays['75'],
          },
          Fill: {
            Active: Grays['900'],
            Default: Grays['900'],
          },
        },
        Nested: {
          Border: {
            Active: Blues['400'],
            Default: Grays['600'],
            Error: Reds['500'],
            Filled: Grays['75'],
          },
          Fill: Grays['850'],
          Nested: Grays['850'],
        },
      },
      Large: {
        Default: {
          Fill: Grays['900'],
          Outline: Grays['800'],
        },
      },
    },
    Layer: {
      '1': {
        Fill: SurfacesAndText.plain.Dark['Layer']['1']['Fill'],
        Outline: SurfacesAndText.plain.Dark['Layer']['1']['Outline'],
      },
      '2': {
        Fill: SurfacesAndText.plain.Dark['Layer']['2']['Fill'],
        Outline: SurfacesAndText.plain.Dark['Layer']['2']['Outline'],
      },
      '3': {
        Fill: SurfacesAndText.plain.Dark['Layer']['3']['Fill'],
        Outline: SurfacesAndText.plain.Dark['Layer']['3']['Outline'],
      },
      App: {
        Background: '#12110f',
      },
      Feedback: {
        Error: SurfacesAndText.plain.Dark['Layer']['Feedback']['Error'],
        Info: SurfacesAndText.plain.Dark['Layer']['Feedback']['Info'],
        Informational: Blues['50'],
        Success: SurfacesAndText.plain.Dark['Layer']['Feedback']['Success'],
        Warning: SurfacesAndText.plain.Dark['Layer']['Feedback']['Warning'],
      },
      Highlight: {
        Fill: Blues['50'],
        Outline: Blues['500'],
      },
      TypeAction: {
        Hover: SurfacesAndText.plain.Dark['Layer']['TypeAction']['Hover'],
        Selected: SurfacesAndText.plain.Dark['Layer']['TypeAction']['Selected'],
      },
    },
    Orange: {
      '50': Oranges['50'],
      '100': Oranges['100'],
      '200': Oranges['200'],
      '300': Oranges['300'],
      '400': Oranges['400'],
      '500': Oranges['500'],
      '600': Oranges['600'],
      '700': Oranges['700'],
      '800': Oranges['800'],
      '900': Oranges['900'],
      '950': Oranges['950'],
    },
    Reds: {
      '200': Reds['200'],
      '300': Reds['300'],
      '400': Reds['400'],
      '500': Reds['500'],
      '600': Reds['600'],
      '700': Reds['700'],
      '800': Reds['800'],
    },
    Table: {
      Header: {
        Fill: Grays['800'],
        'Label & icon': {
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
    Tables: {
      Header: {
        Fill: SurfacesAndText.plain.Dark['Tables']['Header']['Fill'],
        'Label & Icon': {
          Active: Grays['50'],
          Default: Grays['300'],
          Hover: Blues['400'],
        },
      },
      Row: {
        Default: SurfacesAndText.plain.Dark['Tables']['Row']['Default'],
        Hover: SurfacesAndText.plain.Dark['Tables']['Row']['Hover'],
        Selected: SurfacesAndText.plain.Dark['Tables']['Row']['Selected'],
      },
    },
    Tabs: {
      Contained: {
        Current: {
          Fill: Grays['950'],
          'Label & Icon': Grays['50'],
          Outline: Blues['500'],
        },
        Default: {
          Fill: '#12110f',
          'Label & Icon': Grays['300'],
        },
        Hover: {
          Fill: Grays['75'],
          'Label & Icon': Blues['400'],
        },
      },
      OverLined: {
        Current: {
          'Label & Icon': Grays['50'],
          Outline: Blues['500'],
        },
        Default: {
          'Label & Icon': Grays['300'],
          Outline: Grays['800'],
        },
        Hover: {
          'Label & Icon': Blues['400'],
          Outline: Blues['500'],
        },
      },
      UnderLined: {
        'Container Border': Grays['900'],
        Current: {
          'Label & Icon': Blues['400'],
          Outline: Blues['600'],
        },
        Default: {
          'Label & Icon': Grays['300'],
          Outline: Grays['800'],
        },
        Hover: {
          'Label & Icon': Blues['400'],
          Outline: Blues['500'],
        },
      },
    },
    Text: {
      colorTest: '#ffffff',
      Disabled: SurfacesAndText.plain.Dark['Text']['Disabled'],
      Feedback: {
        Error: SurfacesAndText.plain.Dark['Text']['Feedback']['Error'],
        Success: SurfacesAndText.plain.Dark['Text']['Feedback']['Success'],
        Warning: SurfacesAndText.plain.Dark['Text']['Feedback']['Warning'],
      },
      FilledFeedback: {
        alert: {
          primary: Grays['50'],
          secondary: Grays['300'],
        },
        highlight: {
          primary: Blues['500'],
          secondary: Grays['700'],
        },
        info: {
          primary: Blues['300'],
          secondary: Grays['300'],
        },
        success: {
          primary: Grays['950'],
          secondary: Grays['700'],
        },
        warning: {
          primary: Grays['975'],
          secondary: Grays['700'],
        },
      },
      highlight: Blues['400'],
      primary: Grays['50'],
      secondary: Grays['300'],
      tertiary: Grays['400'],
      TextColors: {
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
    Toggles: {
      Current: {
        Fill: Grays['50'],
        'Label & Icon': Grays['950'],
      },
      Default: {
        Fill: Grays['850'],
        'Label & Icon': Grays['50'],
      },
      Hover: {
        Fill: Grays['800'],
        'Label & Icon': Blues['400'],
      },
    },
    Transparent: Transparent,
    Violet: {
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
    Yellow: {
      '50': Yellows['50'],
      '100': Yellows['100'],
      '200': Yellows['200'],
      '300': Yellows['300'],
      '400': Yellows['400'],
      '500': Yellows['500'],
      '600': Yellows['600'],
      '700': Yellows['700'],
      '800': Yellows['800'],
      '900': Yellows['900'],
      '950': Yellows['950'],
    },
  },
  chad: {
    App: {
      Background: SurfacesAndText.plain.Chad['App']['Background'],
    },
    Badges: {
      Border: {
        Accent: SurfacesAndText.plain.Chad['Badges']['Border']['Accent'],
        Active: SurfacesAndText.plain.Chad['Badges']['Border']['Active'],
        Alert: SurfacesAndText.plain.Chad['Badges']['Border']['Alert'],
        Default: SurfacesAndText.plain.Chad['Badges']['Border']['Default'],
        Highlight: SurfacesAndText.plain.Chad['Badges']['Border']['Highlight'],
        Warning: SurfacesAndText.plain.Chad['Badges']['Border']['Warning'],
      },
      Fill: {
        Accent: SurfacesAndText.plain.Chad['Badges']['Fill']['Accent'],
        Active: SurfacesAndText.plain.Chad['Badges']['Fill']['Active'],
        Alert: SurfacesAndText.plain.Chad['Badges']['Fill']['Alert'],
        Default: SurfacesAndText.plain.Chad['Badges']['Fill']['Default'],
        Highlight: SurfacesAndText.plain.Chad['Badges']['Fill']['Highlight'],
        Warning: SurfacesAndText.plain.Chad['Badges']['Fill']['Warning'],
      },
      Label: {
        Accent: SurfacesAndText.plain.Chad['Badges']['Label']['Accent'],
        Active: SurfacesAndText.plain.Chad['Badges']['Label']['Active'],
        Alert: SurfacesAndText.plain.Chad['Badges']['Label']['Alert'],
        Default: SurfacesAndText.plain.Chad['Badges']['Label']['Default'],
        Highlight: SurfacesAndText.plain.Chad['Badges']['Label']['Highlight'],
        Warning: SurfacesAndText.plain.Chad['Badges']['Label']['Warning'],
      },
    },
    Blues: {
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
    Button: {
      Error: {
        Default: {
          Fill: SurfacesAndText.plain.Chad['Button']['Error']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Error']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Chad['Button']['Error']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Error']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Chad['Button']['Error']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Error']['Hover']['Label & Icon'],
        },
      },
      'Focus Outline': SurfacesAndText.plain.Chad['Button']['Focus Outline'],
      'Focus Outline Width': '2px',
      Ghost: {
        Default: {
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Ghost']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: Grays['500'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Ghost']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Chad['Button']['Ghost']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Ghost']['Hover']['Label & Icon'],
        },
      },
      Navigation: {
        Current: {
          Fill: SurfacesAndText.plain.Chad['Button']['Navigation']['Current']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Navigation']['Current']['Label & Icon'],
        },
        Default: {
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Navigation']['Default']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Chad['Button']['Navigation']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Navigation']['Hover']['Label & Icon'],
        },
      },
      Outline: {
        Default: {
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Outline']['Default']['Label & Icon'],
          Outline: SurfacesAndText.plain.Chad['Button']['Outline']['Default']['Outline'],
        },
        Disabled: {
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Outline']['Disabled']['Label & Icon'],
          Outline: SurfacesAndText.plain.Chad['Button']['Outline']['Disabled']['Outline'],
        },
        Hover: {
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Outline']['Hover']['Label & Icon'],
          Outline: SurfacesAndText.plain.Chad['Button']['Outline']['Hover']['Outline'],
        },
      },
      Outlined: {
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
          Fill: SurfacesAndText.plain.Chad['Button']['Primary']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Primary']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Chad['Button']['Primary']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Primary']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Chad['Button']['Primary']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Primary']['Hover']['Label & Icon'],
        },
      },
      Radius: {
        lg: '0px',
        md: '0px',
        sm: '0px',
        xs: '0px',
      },
      Secondary: {
        Default: {
          Fill: SurfacesAndText.plain.Chad['Button']['Secondary']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Secondary']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Chad['Button']['Secondary']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Secondary']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Chad['Button']['Secondary']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Secondary']['Hover']['Label & Icon'],
        },
      },
      Success: {
        Default: {
          Fill: SurfacesAndText.plain.Chad['Button']['Success']['Default']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Success']['Default']['Label & Icon'],
        },
        Disabled: {
          Fill: SurfacesAndText.plain.Chad['Button']['Success']['Disabled']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Success']['Disabled']['Label & Icon'],
        },
        Hover: {
          Fill: SurfacesAndText.plain.Chad['Button']['Success']['Hover']['Fill'],
          'Label & Icon': SurfacesAndText.plain.Chad['Button']['Success']['Hover']['Label & Icon'],
        },
      },
    },
    Chart: {
      Candles: {
        Negative: Reds['600'],
        Positive: Greens['400'],
      },
      Index: {
        '1': Violets['500'],
        '2': Greens['500'],
        '3': Yellows['600'],
        '4': Violets['600'],
        '5': Oranges['500'],
        '6': Blues['300'],
        '7': Greens['300'],
        '8': Reds['700'],
        'Line 1': Violets['500'],
        'Line 2': Greens['500'],
        'Line 3': Yellows['600'],
        Negative: Reds['600'],
        Positive: Greens['400'],
      },
      'Liquidation Zone': {
        Current: Yellows['400'],
        Future: Blues['200'],
      },
    },
    Chips: {
      Current: {
        Fill: Grays['200'],
        'Label & Icon': Violets['600'],
        Outline: Violets['500'],
      },
      Default: {
        Fill: Grays['150'],
        'Label & Icon': Grays['950'],
        Stroke: Grays['950'],
      },
      Hover: {
        Fill: Violets['950'],
        'Label & Icon': Grays['50'],
      },
    },
    Color: {
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
    },
    Feedback: {
      Danger: Oranges['500'],
      Error: Reds['500'],
      Success: Greens['400'],
      Warning: Yellows['500'],
    },
    Grays: {
      '10': Grays['10'],
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
    Greens: {
      '100': Greens['100'],
      '200': Greens['200'],
      '300': Greens['300'],
      '400': Greens['400'],
      '500': Greens['500'],
      '600': Greens['600'],
      '700': Greens['700'],
      '800': Greens['800'],
    },
    'Input & Select': {
      Base: {
        Default: {
          Border: {
            Active: Violets['400'],
            Default: Grays['400'],
            Error: Reds['500'],
            Filled: Violets['600'],
          },
          Fill: {
            Active: Grays['100'],
            Default: Grays['100'],
          },
        },
        Nested: {
          Border: {
            Active: Violets['400'],
            Default: Grays['200'],
            Error: Reds['500'],
            Filled: Violets['400'],
          },
          Fill: Violets['50'],
          Nested: Grays['50'],
        },
      },
      Large: {
        Default: {
          Fill: Grays['100'],
          Outline: Grays['400'],
        },
      },
    },
    Layer: {
      '1': {
        Fill: SurfacesAndText.plain.Chad['Layer']['1']['Fill'],
        Outline: SurfacesAndText.plain.Chad['Layer']['1']['Outline'],
      },
      '2': {
        Fill: SurfacesAndText.plain.Chad['Layer']['2']['Fill'],
        Outline: SurfacesAndText.plain.Chad['Layer']['2']['Outline'],
      },
      '3': {
        Fill: SurfacesAndText.plain.Chad['Layer']['3']['Fill'],
        Outline: SurfacesAndText.plain.Chad['Layer']['3']['Outline'],
      },
      App: {
        Background: '#bdbbec',
      },
      Feedback: {
        Error: SurfacesAndText.plain.Chad['Layer']['Feedback']['Error'],
        Info: SurfacesAndText.plain.Chad['Layer']['Feedback']['Info'],
        Informational: Violets['700'],
        Success: SurfacesAndText.plain.Chad['Layer']['Feedback']['Success'],
        Warning: SurfacesAndText.plain.Chad['Layer']['Feedback']['Warning'],
      },
      Highlight: {
        Fill: Violets['800'],
        Outline: Violets['500'],
      },
      TypeAction: {
        Hover: SurfacesAndText.plain.Chad['Layer']['TypeAction']['Hover'],
        Selected: SurfacesAndText.plain.Chad['Layer']['TypeAction']['Selected'],
      },
    },
    Orange: {
      '50': Oranges['50'],
      '100': Oranges['100'],
      '200': Oranges['200'],
      '300': Oranges['300'],
      '400': Oranges['400'],
      '500': Oranges['500'],
      '600': Oranges['600'],
      '700': Oranges['700'],
      '800': Oranges['800'],
      '900': Oranges['900'],
      '950': Oranges['950'],
    },
    Reds: {
      '200': Reds['200'],
      '300': Reds['300'],
      '400': Reds['400'],
      '500': Reds['500'],
      '600': Reds['600'],
      '700': Reds['700'],
      '800': Reds['800'],
    },
    Table: {
      Header: {
        Fill: Grays['300'],
        'Label & icon': {
          Active: Grays['950'],
          Default: Grays['750'],
          Hover: Grays['950'],
        },
      },
      Row: {
        Default: Grays['150'],
        Hover: Grays['75'],
        Selected: Violets['50'],
      },
    },
    Tables: {
      Header: {
        Fill: SurfacesAndText.plain.Chad['Tables']['Header']['Fill'],
        'Label & Icon': {
          Active: Grays['950'],
          Default: Grays['750'],
          Hover: Violets['600'],
        },
      },
      Row: {
        Default: SurfacesAndText.plain.Chad['Tables']['Row']['Default'],
        Hover: SurfacesAndText.plain.Chad['Tables']['Row']['Hover'],
        Selected: SurfacesAndText.plain.Chad['Tables']['Row']['Selected'],
      },
    },
    Tabs: {
      Contained: {
        Current: {
          Fill: Grays['150'],
          'Label & Icon': Grays['950'],
          Outline: Violets['500'],
        },
        Default: {
          Fill: '#bdbbec',
          'Label & Icon': Grays['750'],
        },
        Hover: {
          Fill: Violets['800'],
          'Label & Icon': Violets['600'],
        },
      },
      OverLined: {
        Current: {
          'Label & Icon': Grays['950'],
          Outline: Violets['500'],
        },
        Default: {
          'Label & Icon': Grays['750'],
          Outline: Grays['500'],
        },
        Hover: {
          'Label & Icon': Violets['600'],
          Outline: Violets['500'],
        },
      },
      UnderLined: {
        'Container Border': Grays['400'],
        Current: {
          'Label & Icon': Violets['600'],
          Outline: Violets['500'],
        },
        Default: {
          'Label & Icon': Grays['750'],
          Outline: Grays['500'],
        },
        Hover: {
          'Label & Icon': Violets['600'],
          Outline: Violets['500'],
        },
      },
    },
    Text: {
      colorTest: '#ffffff',
      Disabled: SurfacesAndText.plain.Chad['Text']['Disabled'],
      Feedback: {
        Error: SurfacesAndText.plain.Chad['Text']['Feedback']['Error'],
        Success: SurfacesAndText.plain.Chad['Text']['Feedback']['Success'],
        Warning: SurfacesAndText.plain.Chad['Text']['Feedback']['Warning'],
      },
      FilledFeedback: {
        alert: {
          primary: Grays['50'],
          secondary: Grays['300'],
        },
        highlight: {
          primary: Grays['50'],
          secondary: Grays['300'],
        },
        info: {
          primary: Violets['500'],
          secondary: Grays['700'],
        },
        success: {
          primary: Grays['50'],
          secondary: Grays['300'],
        },
        warning: {
          primary: Grays['950'],
          secondary: Grays['700'],
        },
      },
      Highlight: SurfacesAndText.plain.Chad['Text']['Highlight'],
      Primary: SurfacesAndText.plain.Chad['Text']['Primary'],
      Secondary: SurfacesAndText.plain.Chad['Text']['Secondary'],
      Tertiary: SurfacesAndText.plain.Chad['Text']['Tertiary'],
      TextColors: {
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
    Toggles: {
      Current: {
        Fill: Violets['800'],
        'Label & Icon': Grays['50'],
      },
      Default: {
        Fill: Violets['300'],
        'Label & Icon': Grays['950'],
      },
      Hover: {
        Fill: Grays['300'],
        'Label & Icon': Violets['600'],
      },
    },
    Transparent: Transparent,
    Violet: {
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
    Yellow: {
      '50': Yellows['50'],
      '100': Yellows['100'],
      '200': Yellows['200'],
      '300': Yellows['300'],
      '400': Yellows['400'],
      '500': Yellows['500'],
      '600': Yellows['600'],
      '700': Yellows['700'],
      '800': Yellows['800'],
      '900': Yellows['900'],
      '950': Yellows['950'],
    },
  },
} as const
/* TOKENS-STUDIO:END_THEME_TOKENS */

const InsetOverline = '0 0 auto' as const // Top border only
const InsetUnderline = 'auto 0 0' as const // Bottom border only

const SliderBackground = {
  Safe: { 25: Reds[400], 50: Reds[300], 75: Reds[200], 100: Greens[500] },
  Danger: { 25: Reds[200], 50: Reds[300], 75: Reds[400], 100: Reds[500] },
  Disabled: {
    25: alpha(Grays[300], 0.5),
    50: alpha(Grays[300], 0.5),
    75: alpha(Grays[300], 0.5),
    100: alpha(Grays[300], 0.5),
  },
} as const

type ThemeName = 'light' | 'dark' | 'chad'

const getThemeTokenByPath = (theme: ThemeName, path: string): unknown => {
  const segments = path.split('.').filter(Boolean)
  let node: unknown = ImportedThemeTokens[theme]

  for (const segment of segments) {
    if (
      !node ||
      typeof node !== 'object' ||
      Array.isArray(node) ||
      !Object.prototype.hasOwnProperty.call(node, segment)
    ) {
      return undefined
    }
    node = (node as Record<string, unknown>)[segment]
  }

  return node
}

const getThemeStringToken = (theme: ThemeName, path: string, fallback: string) => {
  const value = getThemeTokenByPath(theme, path)
  return typeof value === 'string' ? value : fallback
}

export const createLightDesign = (
  Light: typeof SurfacesAndText.plain.Light | typeof SurfacesAndText.inverted.Light,
) => {
  const theme: ThemeName = 'light'

  const Color = {
    Neutral: Grays,
    Primary: Blues,
    Secondary: Greens,
    Tertiary: {
      '200': Reds[200],
      '300': Yellows[500],
      '400': Oranges[500],
      '600': Reds[500],
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
      Background: ImportedThemeConstants.light.appBackground,
    },
    Feedback: {
      Info: Light.Layer.Feedback.Info,
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
      Outline: Color.Primary[500],
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
          Primary: Light.Text.FilledFeedback.Info.Primary,
          Secondary: Light.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: Light.Text.FilledFeedback.Highlight.Primary,
          Secondary: Light.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: Light.Text.FilledFeedback.Warning.Primary,
          Secondary: Light.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: Light.Text.FilledFeedback.Alert.Primary,
          Secondary: Light.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: Light.Text.FilledFeedback.Success.Primary,
          Secondary: Light.Text.FilledFeedback.Success.Secondary,
        },
      },
      Feedback: {
        Success: Light.Text.Feedback.Success,
        Warning: Light.Text.Feedback.Warning,
        Error: Light.Text.Feedback.Error,
        Inverted: getThemeStringToken(theme, 'Text.Feedback.Inverted', Grays[50]),
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
    Focus_Outline_Width: getThemeStringToken(theme, 'Button.Focus Outline Width', SizesAndSpaces.OutlineWidth),
    Focus_Outline: getThemeStringToken(theme, 'Button.Focus Outline', Color.Primary[500]),
    Radius: {
      xs: getThemeStringToken(theme, 'Button.Radius.xs', '0'),
      sm: getThemeStringToken(theme, 'Button.Radius.sm', '0'),
      md: getThemeStringToken(theme, 'Button.Radius.md', '0'),
      lg: getThemeStringToken(theme, 'Button.Radius.lg', '0'),
    },
    Primary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Primary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Default.Fill', Blues[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Primary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Hover.Fill', Grays[950]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Primary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Primary.Disabled.Fill', Color.Primary[100]),
      },
    },
    Secondary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Default.Fill', Grays[950]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Hover.Fill', Blues[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Disabled.Fill', Color.Neutral[400]),
      },
    },
    Outlined: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Default.Label & Icon', Text.TextColors.Primary),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Default.Outline', Text.TextColors.Primary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Hover.Label & Icon', Blues[500]),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Hover.Outline', Blues[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Disabled.Label & Icon', Text.TextColors.Disabled),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Disabled.Outline', Text.TextColors.Disabled),
      },
    },
    Ghost: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Default.Label & Icon', Text.TextColors.Highlight),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Hover.Label & Icon', Grays[975]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Hover.Fill', Transparent),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Disabled.Fill', Transparent),
      },
    },
    Success: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Success.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Success.Default.Fill', Greens[400]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Success.Hover.Label & Icon', Greens[400]),
        Fill: getThemeStringToken(theme, 'Button.Success.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Success.Disabled.Label & Icon', Light.Text.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Success.Disabled.Fill', Greens[600]),
      },
    },
    Error: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Error.Default.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Error.Default.Fill', Reds[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Error.Hover.Label & Icon', Reds[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Hover.Fill', Grays[10]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Error.Disabled.Label & Icon', Grays[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Disabled.Fill', Reds[800]),
      },
    },
    Navigation: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Default.Label & Icon', Text.TextColors.Tertiary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Hover.Label & Icon', Text.TextColors.Primary),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Hover.Fill', Layer[1].Fill),
      },
      Current: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Current.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Current.Fill', Layer.Highlight.Fill),
      },
    },
    Transition: 'Transition',
  } as const

  const Tabs = {
    UnderLined: {
      Inset: InsetUnderline,
      Container_Border: Light.Layer[1].Outline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
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
      },
      Hover: {
        Label: Text.TextColors.Highlight,
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
        Outline: Layer[2].Outline,
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
    Transition: 'Transition',
  } as const

  const Chips = {
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer[1].Fill,
      Stroke: Light.Badges.Border.Default,
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
    BorderRadius: {
      Clickable: '0',
      NonClickable: '6.25rem', // 100px
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
    LiquidationZone: {
      Current: Yellows[400],
      Future: Blues[200],
    },
    Candles: {
      Positive: Greens[400],
      Negative: Reds[600],
    },
    Lines: {
      Positive: Greens[400],
      Negative: Reds[600],
      Line1: Color.Primary[500],
      Line2: Yellows[500],
      Line3: Color.Secondary[500],
    },
  } as const

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Neutral[100],
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
    Header: {
      Fill: Light.Tables.Header.Fill,
      'Label_&_icon': {
        Default: Light.Tables.Header.Label.Default,
        Hover: Light.Tables.Header.Label.Hover,
        Active: Light.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: Light.Tables.Row.Default,
      Selected: Light.Tables.Row.Selected,
      Hover: Light.Tables.Row.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays[100],
          Active: Grays[50],
        },
        Border: {
          Default: Grays[200],
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
        Fill: Grays[100],
        Outline: Grays[200],
      },
    },
  } as const

  const Sliders = {
    default: ImportedThemeConstants.light.slider.default,
    hover: ImportedThemeConstants.light.slider.hover,
    SliderBackground: { ...SliderBackground, Filled: { 100: Color.Primary[200] } },
  } as const

  const Switch = {
    Default: { Fill: Layer[1].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
    Checked: { Fill: Color.Primary[500], Outline: Color.Neutral[400], Label: Grays[50] },
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

export const createDarkDesign = (Dark: typeof SurfacesAndText.plain.Dark | typeof SurfacesAndText.inverted.Dark) => {
  const theme: ThemeName = 'dark'

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
      '200': Reds[800],
      '300': Oranges[500],
      '400': Yellows[500],
      '600': Yellows[400],
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
      Background: ImportedThemeConstants.dark.appBackground,
    },
    Feedback: {
      Info: Dark.Layer.Feedback.Info,
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
      Outline: Color.Primary[500],
    },
  } as const

  const Text = {
    TextColors: {
      Primary: Dark.Text.Primary,
      Secondary: Dark.Text.Secondary,
      Tertiary: Dark.Text.Tertiary,
      Highlight: Dark.Text.Highlight,
      Disabled: Dark.Text.Disabled,
      FilledFeedback: {
        Info: {
          Primary: Dark.Text.FilledFeedback.Info.Primary,
          Secondary: Dark.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: Dark.Text.FilledFeedback.Highlight.Primary,
          Secondary: Dark.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: Dark.Text.FilledFeedback.Warning.Primary,
          Secondary: Dark.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: Dark.Text.FilledFeedback.Alert.Primary,
          Secondary: Dark.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: Dark.Text.FilledFeedback.Success.Primary,
          Secondary: Dark.Text.FilledFeedback.Success.Secondary,
        },
      },
      Feedback: {
        Success: Dark.Text.Feedback.Success,
        Warning: Dark.Text.Feedback.Warning,
        Error: Dark.Text.Feedback.Error,
        Inverted: getThemeStringToken(theme, 'Text.Feedback.Inverted', Grays[950]),
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
    Focus_Outline_Width: getThemeStringToken(theme, 'Button.Focus Outline Width', SizesAndSpaces.OutlineWidth),
    Focus_Outline: getThemeStringToken(theme, 'Button.Focus Outline', Color.Primary[500]),
    Radius: {
      xs: getThemeStringToken(theme, 'Button.Radius.xs', '0'),
      sm: getThemeStringToken(theme, 'Button.Radius.sm', '0'),
      md: getThemeStringToken(theme, 'Button.Radius.md', '0'),
      lg: getThemeStringToken(theme, 'Button.Radius.lg', '0'),
    },
    Primary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Primary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Default.Fill', Blues[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Primary.Hover.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Hover.Fill', Grays[50]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Primary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Primary.Disabled.Fill', Color.Primary[800]),
      },
    },
    Secondary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Default.Fill', Grays[50]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Hover.Fill', Blues[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Disabled.Fill', Grays[750]),
      },
    },
    Outlined: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Default.Label & Icon', Text.TextColors.Primary),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Default.Outline', Text.TextColors.Primary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Hover.Label & Icon', Text.TextColors.Highlight),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Hover.Outline', Text.TextColors.Highlight),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Disabled.Label & Icon', Text.TextColors.Disabled),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Disabled.Outline', Text.TextColors.Disabled),
      },
    },
    Ghost: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Default.Label & Icon', Text.TextColors.Highlight),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Hover.Fill', Transparent),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Disabled.Label & Icon', Blues[700]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Disabled.Fill', Transparent),
      },
    },
    Success: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Success.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Success.Default.Fill', Greens[400]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Success.Hover.Label & Icon', Greens[400]),
        Fill: getThemeStringToken(theme, 'Button.Success.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Success.Disabled.Label & Icon', Dark.Text.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Success.Disabled.Fill', Greens[600]),
      },
    },
    Error: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Error.Default.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Error.Default.Fill', Reds[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Error.Hover.Label & Icon', Reds[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Hover.Fill', Grays[10]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Error.Disabled.Label & Icon', Grays[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Disabled.Fill', Reds[800]),
      },
    },
    Navigation: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Default.Label & Icon', Text.TextColors.Tertiary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Hover.Label & Icon', Text.TextColors.Primary),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Hover.Fill', Layer[1].Fill),
      },
      Current: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Current.Label & Icon', Grays[975]),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Current.Fill', Layer.Highlight.Fill),
      },
    },
    Transition: 'Transition',
  } as const

  const Tabs = {
    UnderLined: {
      Inset: InsetUnderline,
      Container_Border: Dark.Layer[1].Outline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
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
      },
      Hover: {
        Label: Text.TextColors.Highlight,
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
        Outline: Layer[2].Outline,
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
    Transition: 'Transition',
  } as const

  const Chips = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Layer[1].Fill,
      Stroke: Dark.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral[50],
      Fill: Color.Neutral[900],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[1].Fill,
      Outline: Layer.Highlight.Outline,
    },
    BorderRadius: {
      Clickable: '0',
      NonClickable: '6.25rem', // 100px
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
    LiquidationZone: {
      Current: Oranges[900],
      Future: Blues[800],
    },
    Candles: {
      Positive: Greens[300],
      Negative: Reds[500],
    },
    Lines: {
      Positive: Greens[300],
      Negative: Reds[500],
      Line1: Color.Primary[500],
      Line2: Yellows[500],
      Line3: Color.Secondary[500],
    },
  } as const

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Neutral[100],
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
    Header: {
      Fill: Dark.Tables.Header.Fill,
      'Label_&_icon': {
        Default: Dark.Tables.Header.Label.Default,
        Hover: Dark.Tables.Header.Label.Hover,
        Active: Dark.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: Dark.Tables.Row.Default,
      Selected: Dark.Tables.Row.Selected,
      Hover: Dark.Tables.Row.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays[900],
          Active: Grays[900],
        },
        Border: {
          Default: Grays[800],
          Active: Dark.Text.Highlight,
          Filled: Grays[75],
          Error: Reds[500],
        },
      },
      Nested: {
        Nested: Grays[850],
        Fill: Grays[850],
        Border: {
          Default: Grays[600],
          Active: Dark.Text.Highlight,
          Filled: Grays[75],
          Error: Reds[500],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays[900],
        Outline: Grays[800],
      },
    },
  } as const

  const Sliders = {
    default: ImportedThemeConstants.dark.slider.default,
    hover: ImportedThemeConstants.dark.slider.hover,
    SliderBackground: { ...SliderBackground, Filled: { 100: Color.Primary[200] } },
  } as const

  const Switch = {
    Default: { Fill: Layer[1].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
    Checked: { Fill: Color.Primary[500], Outline: Color.Neutral[400], Label: Grays[50] },
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

export const createChadDesign = (Chad: typeof SurfacesAndText.plain.Chad | typeof SurfacesAndText.inverted.Chad) => {
  const theme: ThemeName = 'chad'

  const Color = {
    Neutral: Grays,
    Primary: Violets,
    Secondary: Greens,
    Tertiary: {
      '200': Reds[200],
      '300': Yellows[500],
      '400': Oranges[500],
      '600': Reds[500],
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
      Background: ImportedThemeConstants.chad.appBackground,
    },
    Feedback: {
      Info: Chad.Layer.Feedback.Info,
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
      Outline: Color.Primary[500],
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
          Primary: Chad.Text.FilledFeedback.Info.Primary,
          Secondary: Chad.Text.FilledFeedback.Info.Secondary,
        },
        Highlight: {
          Primary: Chad.Text.FilledFeedback.Highlight.Primary,
          Secondary: Chad.Text.FilledFeedback.Highlight.Secondary,
        },
        Warning: {
          Primary: Chad.Text.FilledFeedback.Warning.Primary,
          Secondary: Chad.Text.FilledFeedback.Warning.Secondary,
        },
        Alert: {
          Primary: Chad.Text.FilledFeedback.Alert.Primary,
          Secondary: Chad.Text.FilledFeedback.Alert.Secondary,
        },
        Success: {
          Primary: Chad.Text.FilledFeedback.Success.Primary,
          Secondary: Chad.Text.FilledFeedback.Success.Secondary,
        },
      },
      Feedback: {
        Success: Chad.Text.Feedback.Success,
        Warning: Chad.Text.Feedback.Warning,
        Error: Chad.Text.Feedback.Error,
        Inverted: getThemeStringToken(theme, 'Text.Feedback.Inverted', Grays[50]),
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
    Focus_Outline_Width: getThemeStringToken(theme, 'Button.Focus Outline Width', SizesAndSpaces.OutlineWidth),
    Focus_Outline: getThemeStringToken(theme, 'Button.Focus Outline', Color.Primary[500]),
    Radius: {
      xs: getThemeStringToken(theme, 'Button.Radius.xs', '0'),
      sm: getThemeStringToken(theme, 'Button.Radius.sm', '0'),
      md: getThemeStringToken(theme, 'Button.Radius.md', '0'),
      lg: getThemeStringToken(theme, 'Button.Radius.lg', '0'),
    },
    Primary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Primary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Default.Fill', Violets[950]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Primary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Primary.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Primary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Primary.Disabled.Fill', Violets[200]),
      },
    },
    Secondary: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Default.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Default.Fill', Grays[900]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Hover.Label & Icon', Grays[50]),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Hover.Fill', Violets[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Secondary.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Secondary.Disabled.Fill', Grays[600]),
      },
    },
    Outlined: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Default.Label & Icon', Text.TextColors.Primary),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Default.Outline', Text.TextColors.Primary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Hover.Label & Icon', Violets[500]),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Hover.Outline', Violets[500]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Outlined.Disabled.Label & Icon', Text.TextColors.Disabled),
        Outline: getThemeStringToken(theme, 'Button.Outlined.Disabled.Outline', Text.TextColors.Disabled),
      },
    },
    Ghost: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Default.Label & Icon', Text.TextColors.Highlight),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Hover.Label & Icon', Violets[800]),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Hover.Fill', Transparent),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Ghost.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Ghost.Disabled.Fill', Transparent),
      },
    },
    Success: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Success.Default.Label & Icon', Grays[900]),
        Fill: getThemeStringToken(theme, 'Button.Success.Default.Fill', Greens[400]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Success.Hover.Label & Icon', Greens[400]),
        Fill: getThemeStringToken(theme, 'Button.Success.Hover.Fill', Grays[900]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Success.Disabled.Label & Icon', Text.TextColors.Disabled),
        Fill: getThemeStringToken(theme, 'Button.Success.Disabled.Fill', Greens[600]),
      },
    },
    Error: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Error.Default.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Error.Default.Fill', Reds[500]),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Error.Hover.Label & Icon', Reds[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Hover.Fill', Grays[10]),
      },
      Disabled: {
        Label: getThemeStringToken(theme, 'Button.Error.Disabled.Label & Icon', Grays[500]),
        Fill: getThemeStringToken(theme, 'Button.Error.Disabled.Fill', Reds[800]),
      },
    },
    Navigation: {
      Default: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Default.Label & Icon', Text.TextColors.Tertiary),
      },
      Hover: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Hover.Label & Icon', Text.TextColors.Primary),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Hover.Fill', Layer[1].Fill),
      },
      Current: {
        Label: getThemeStringToken(theme, 'Button.Navigation.Current.Label & Icon', Grays[10]),
        Fill: getThemeStringToken(theme, 'Button.Navigation.Current.Fill', Layer.Highlight.Fill),
      },
    },
    Transition: 'Transition',
  } as const

  const Tabs = {
    UnderLined: {
      Inset: InsetUnderline,
      Container_Border: Layer[1].Outline,
      Default: {
        Label: Text.TextColors.Secondary,
        Outline: Layer[2].Outline,
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
      },
      Hover: {
        Label: Text.TextColors.Highlight,
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
        Outline: Layer[2].Outline,
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
    Transition: 'Transition',
  } as const

  const Chips = {
    Default: {
      Label: Text.TextColors.Secondary,
      Fill: Layer[1].Fill,
      Stroke: Chad.Badges.Border.Default,
    },
    Hover: {
      Label: Color.Neutral[50],
      Fill: Color.Primary[950],
    },
    Current: {
      Label: Text.TextColors.Highlight,
      Fill: Layer[2].Fill,
      Outline: Layer.Highlight.Outline,
    },
    BorderRadius: {
      Clickable: '0',
      NonClickable: '0',
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
    LiquidationZone: {
      Current: Yellows[400],
      Future: Blues[200],
    },
    Candles: {
      Positive: Greens[400],
      Negative: Reds[600],
    },
    Lines: {
      Positive: Greens[400],
      Negative: Reds[600],
      Line1: Color.Primary[500],
      Line2: Yellows[500],
      Line3: Color.Secondary[500],
    },
  } as const

  const Toggles = {
    Default: {
      Label: Text.TextColors.Primary,
      Fill: Color.Primary[300],
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
    Header: {
      Fill: Chad.Tables.Header.Fill,
      'Label_&_icon': {
        Default: Chad.Tables.Header.Label.Default,
        Hover: Chad.Tables.Header.Label.Active,
        Active: Chad.Tables.Header.Label.Active,
      },
    },
    Row: {
      Default: Chad.Tables.Row.Default,
      Selected: Chad.Tables.Row.Selected,
      Hover: Chad.Tables.Row.Hover,
    },
  } as const

  const Inputs = {
    Base: {
      Default: {
        Fill: {
          Default: Grays[100],
          Active: Grays[100],
        },
        Border: {
          Default: Grays[400],
          Active: Violets[400],
          Filled: Violets[600],
          Error: Reds[500],
        },
      },
      Nested: {
        Nested: Grays[50],
        Fill: Violets[50],
        Border: {
          Default: Grays[200],
          Active: Violets[400],
          Filled: Violets[400],
          Error: Reds[500],
        },
      },
    },
    Large: {
      Default: {
        Fill: Grays[100],
        Outline: Grays[200],
      },
    },
  } as const

  const Sliders = {
    default: ImportedThemeConstants.chad.slider.default,
    hover: ImportedThemeConstants.chad.slider.hover,
    SliderBackground: { ...SliderBackground, Filled: { 100: Color.Primary[200] } },
  } as const

  const Switch = {
    Default: { Fill: Layer[1].Fill, Outline: Color.Neutral[400], Label: Color.Primary[500] },
    Checked: { Fill: Color.Primary[500], Outline: Color.Neutral[400], Label: Grays[50] },
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
