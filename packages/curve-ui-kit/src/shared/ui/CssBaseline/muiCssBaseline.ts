import type { Components } from '@mui/material/styles'

export const defineMuiCssBaseline = (): Components['MuiCssBaseline'] => {
  return {
    styleOverrides: `
      @font-face {
        font-family: 'Mona Sans';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: local('Mona Sans'), local('MonaSans-Regular'), url('fonts/Mona-Sans.woff2') format('woff2');
        unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
      }
      @font-face {
        font-family: 'Hubot Sans';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: local('Hubot Sans'), local('HubotSans-Regular'), url('fonts/Hubot-Sans.woff2') format('woff2');
        unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
      }
    `,
  }
}
