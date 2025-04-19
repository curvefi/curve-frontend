import { createSvgIcon } from '@mui/material/utils'
import { svg as frameSvg } from './FrameWalletIcon'
import { svg as metamaskSvg } from './MetamaskWalletIcon'
import { svg as phantomSvg } from './PhantomWalletIcon'
import { svg as rabbySvg } from './RabbyWalletIcon'

export const svg = (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      {/* Top left - Rabby */}
      <g transform="translate(0, 0) scale(0.5)">{rabbySvg}</g>

      {/* Top right - Phantom */}
      <g transform="translate(50, 0) scale(0.5)">{phantomSvg}</g>

      {/* Bottom left - Frame */}
      <g transform="translate(0, 50) scale(0.5)">{frameSvg}</g>

      {/* Bottom right - Metamask */}
      <g transform="translate(50, 50) scale(1.5)">{metamaskSvg}</g>
    </g>
  </svg>
)

export const BrowserWalletIcon = createSvgIcon(svg, 'BrowserWallet')
