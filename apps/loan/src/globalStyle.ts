import { createGlobalStyle } from 'styled-components'
import { CURVE_ASSETS_URL } from '@/ui/utils'

const GlobalStyle = createGlobalStyle`
  /* || GENERAL STYLES */
  html,
  body {
    display: block;
    height: 100%;
    width: 100%;
  }

  body {
    min-width: 20rem;
    
    font-size: 16px;

    color: var(--page--text-color);
    background-color: var(--page--background-color);
    /* background-image: url(${CURVE_ASSETS_URL + '/branding/curve-app-header.webp'}); */
    /* background-size: auto 400px;
    background-repeat: repeat-x;
    background-attachment: fixed; */
    //background-position-y: var(--header-height);
    
    &.scrollSmooth {
      scroll-behavior: smooth;
    }
  }

  * {
    box-sizing: border-box;
  }

  html, body, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, button, abbr, acronym, address, big, cite, code, del, dfn, em, img, input, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-family: var(--font);
  }

  li {
    list-style: none;
  }

  /* || UTILITIES */
  .width--full {
    width: 100%;
  }

  .height--full {
    height: 100%;
  }

  .vertical-align-middle {
    vertical-align: middle;
  }
`

export default GlobalStyle
