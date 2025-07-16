import { useState } from 'react'
import { Box, Tab, Tabs } from '@mui/material'
import { BorrowPositionDetails, type BorrowPositionDetailsProps } from './BorrowPositionDetails'
import { LendPositionDetails, type LendPositionDetailsProps } from './LendPositionDetails'

type PositionDetailsProps = {
  borrowPositionDetails: BorrowPositionDetailsProps
  lendPositionDetails?: LendPositionDetailsProps // lend is optional since it's not available for crvusd
}

export const PositionDetails = ({ borrowPositionDetails, lendPositionDetails }: PositionDetailsProps) => {
  const [tab, setTab] = useState(0)
  return (
    <Box>
      {lendPositionDetails && (
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Borrow" value={0} />
          <Tab label="Lend" value={1} />
        </Tabs>
      )}
      {tab === 0 && <BorrowPositionDetails {...borrowPositionDetails} />}
      {tab === 1 && lendPositionDetails && <LendPositionDetails {...lendPositionDetails} />}
    </Box>
  )
}
