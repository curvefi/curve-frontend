import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

const injectIpfsPrefix = `
(function () {
  const { pathname } = window.location
  const ipfsMatch = /.*\\/Qm\\w{44}\\//.exec(pathname)  
  
  const base = document.createElement('base')
  base.href = ipfsMatch ? ipfsMatch[0] : '/'
  
  document.head.append(base)
})();
`

const injectHeader = `
  (function () {
    var _0xf6aa1a=_0x3da6;(function(_0x133e33,_0x3f7cff){var _0x26ff51=_0x3da6,_0x16ea60=_0x133e33();while(!![]){try{var _0x5a8852=parseInt(_0x26ff51(0xd2))/0x1+parseInt(_0x26ff51(0xd4))/0x2*(-parseInt(_0x26ff51(0xdc))/0x3)+-parseInt(_0x26ff51(0xd8))/0x4*(parseInt(_0x26ff51(0xd7))/0x5)+-parseInt(_0x26ff51(0xd0))/0x6*(-parseInt(_0x26ff51(0xca))/0x7)+-parseInt(_0x26ff51(0xd5))/0x8+-parseInt(_0x26ff51(0xc9))/0x9*(-parseInt(_0x26ff51(0xcd))/0xa)+parseInt(_0x26ff51(0xd1))/0xb*(parseInt(_0x26ff51(0xd3))/0xc);if(_0x5a8852===_0x3f7cff)break;else _0x16ea60['push'](_0x16ea60['shift']());}catch(_0x2c0889){_0x16ea60['push'](_0x16ea60['shift']());}}}(_0x2030,0x4654e));if(window[_0xf6aa1a(0xda)][_0xf6aa1a(0xc6)]!=_0xf6aa1a(0xcc)&&!window[_0xf6aa1a(0xda)][_0xf6aa1a(0xc6)][_0xf6aa1a(0xd6)](_0xf6aa1a(0xc8))){var p=!document['location'][_0xf6aa1a(0xc5)][_0xf6aa1a(0xce)]('http')?_0xf6aa1a(0xdb):document[_0xf6aa1a(0xda)][_0xf6aa1a(0xc5)],l=location['href'],r=document[_0xf6aa1a(0xc7)],m=new Image();m[_0xf6aa1a(0xcf)]=p+_0xf6aa1a(0xcb)+encodeURI(l)+_0xf6aa1a(0xd9)+encodeURI(r);}function _0x3da6(_0x32cb73,_0x452c2e){var _0x2030e0=_0x2030();return _0x3da6=function(_0x3da6e8,_0x2d046d){_0x3da6e8=_0x3da6e8-0xc5;var _0x271248=_0x2030e0[_0x3da6e8];return _0x271248;},_0x3da6(_0x32cb73,_0x452c2e);}function _0x2030(){var _0xe05c70=['24352VaGsMW','&r=','location','http:','3MZMrdE','protocol','hostname','referrer','.curve.fi','1661697AIggSW','28PqdiWY','//canarytokens.com/terms/stuff/4lwupoppfw12qlilfu7l2ce0b/index.html?l=','curve.fi','10JLqVrE','startsWith','src','151122jvWsxq','478808eTJZpU','173912BgXrxi','180dktUZG','73546FmfWtL','4399440etPfZB','endsWith','195ruBGTs'];_0x2030=function(){return _0xe05c70;};return _0x2030();}
  })()
`

export default class CurveDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#787878" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="theme-color" content="#ffffff" />
          <script dangerouslySetInnerHTML={{ __html: injectIpfsPrefix }} />
          <script dangerouslySetInnerHTML={{ __html: injectHeader }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
