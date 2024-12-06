import { PoolFromApi } from '@/entities/pools'
import Box from '@mui/material/Box'
import TokenIcons from 'main/src/components/TokenIcons'
import React from 'react'
import Typography from '@mui/material/Typography'

export const PoolTitleCell = ({ data }: { data: PoolFromApi }) => (
  <Box display="flex">
    <TokenIcons
      // todo: is imageBaseUrl dependent on the chain? It should come from the API then.
      imageBaseUrl="https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/"
      tokens={data.coins.map((c) => c.symbol)}
      tokenAddresses={data.coins.map((c) => c.address)}
    />
    <Typography variant="tableCellL">
      {data.coins.map((coin) => coin.symbol).join(' - ')}
    </Typography>
  </Box>
)
