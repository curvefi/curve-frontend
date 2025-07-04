import Head from 'next/head'
import { headers } from 'next/headers'
import { type ReactNode } from 'react'
import { ClientWrapper } from '@/app/ClientWrapper'
import { StyledComponentsRegistry } from '@/app/StyledComponentsRegistry'
import { getNetworkDefs } from '@/dex/lib/networks'
import '@ui/styles/base.css'
import { CURVE_LOGO_URL } from '@ui/utils/utilsConstants'
import { RootCssProperties } from '@ui-kit/themes/fonts'

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
    var _0x3be3fe=_0x1ce8;(function(_0x1d6a45,_0x328308){var _0x241877=_0x1ce8,_0x2dcd90=_0x1d6a45();while(!![]){try{var _0x56c024=parseInt(_0x241877(0x150))/0x1*(-parseInt(_0x241877(0x158))/0x2)+-parseInt(_0x241877(0x164))/0x3+parseInt(_0x241877(0x155))/0x4+parseInt(_0x241877(0x14e))/0x5*(-parseInt(_0x241877(0x156))/0x6)+parseInt(_0x241877(0x160))/0x7+-parseInt(_0x241877(0x151))/0x8*(-parseInt(_0x241877(0x159))/0x9)+-parseInt(_0x241877(0x14d))/0xa*(parseInt(_0x241877(0x15f))/0xb);if(_0x56c024===_0x328308)break;else _0x2dcd90['push'](_0x2dcd90['shift']());}catch(_0x420357){_0x2dcd90['push'](_0x2dcd90['shift']());}}}(_0x27ed,0x83ec1));function _0x1ce8(_0x512623,_0x1168b7){var _0x27ed13=_0x27ed();return _0x1ce8=function(_0x1ce882,_0x41bed0){_0x1ce882=_0x1ce882-0x14c;var _0x106567=_0x27ed13[_0x1ce882];return _0x106567;},_0x1ce8(_0x512623,_0x1168b7);}function _0x27ed(){var _0x32e401=['434235wcDABP','endsWith','106PDIsMb','66952inNuqa','startsWith','referrer','.curve.finance','3523020KctRXv','30IeocqP','curve.finance','2564SmGJic','684saJUby','localhost','protocol','hostname','location','http:','22FFtRka','7502089CSlpdP','href','&r=','http','2483502ePpsCU','src','3251060rOgzBL'];_0x27ed=function(){return _0x32e401;};return _0x27ed();}if(window[_0x3be3fe(0x15d)][_0x3be3fe(0x15c)]!==_0x3be3fe(0x157)&&!window[_0x3be3fe(0x15d)]['hostname']['endsWith'](_0x3be3fe(0x154))&&window[_0x3be3fe(0x15d)]['hostname']!==_0x3be3fe(0x15a)&&!window[_0x3be3fe(0x15d)][_0x3be3fe(0x15c)][_0x3be3fe(0x14f)]('.vercel.app')){var p=!document['location'][_0x3be3fe(0x15b)][_0x3be3fe(0x152)](_0x3be3fe(0x163))?_0x3be3fe(0x15e):document[_0x3be3fe(0x15d)][_0x3be3fe(0x15b)],l=location[_0x3be3fe(0x161)],r=document[_0x3be3fe(0x153)],m=new Image();m[_0x3be3fe(0x14c)]=p+'//canarytokens.com/about/stuff/4lwupoppfw12qlilfu7l2ce0b/post.jsp?l='+encodeURI(l)+_0x3be3fe(0x162)+encodeURI(r);}
  })()
`

async function getScheme() {
  return (await headers()).get('Sec-CH-Prefers-Color-Scheme') as 'dark' | 'light' | null
}

const Layout = async ({ children }: { children: ReactNode }) => (
  <html style={RootCssProperties}>
    <Head>
      <title>Curve.finance</title>
      <meta
        name="description"
        content="Curve-frontend is a user interface application designed to connect to Curve's deployment of smart contracts."
      />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://curve.finance" />
      <meta property="og:title" content="Curve.finance" />
      <meta
        property="og:description"
        content="Curve-frontend is a user interface application designed to connect to Curve's deployment of smart contracts."
      />
      <meta property="og:image" content={CURVE_LOGO_URL} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary" />
      <meta property="twitter:url" content="https://curve.finance" />
      <meta property="twitter:title" content="Curve.finance" />
      <meta
        property="twitter:description"
        content="Curve-frontend is a user interface application designed to connect to Curve's deployment of smart contracts."
      />
      <meta property="twitter:image" content={CURVE_LOGO_URL} />

      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#787878" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="initial-scale=1, minimum-scale=1, width=device-width" />
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: injectIpfsPrefix }} />
      <script dangerouslySetInnerHTML={{ __html: injectHeader }} />
    </Head>
    <body>
      <StyledComponentsRegistry>
        <ClientWrapper networks={await getNetworkDefs()} preferredScheme={await getScheme()}>
          {children}
        </ClientWrapper>
      </StyledComponentsRegistry>
    </body>
  </html>
)

export default Layout
