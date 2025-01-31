import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import React from 'react'
import MuiLink from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'

export const MarketLink = ({ market, children }: { market: LlamaMarket; children: React.ReactNode }) => (
  <MuiLink
    color="inherit"
    underline="hover"
    {...(market.type === LlamaMarketType.Mint
      ? {
          component: RouterLink,
          to: `/${market.blockchainId}/markets/${market.assets.collateral.symbol}/create`,
        }
      : { href: `/lend#/${market.blockchainId}/markets/${market.address}/create` })}
  >
    {children}
  </MuiLink>
)
