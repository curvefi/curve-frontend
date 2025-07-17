import { useState } from 'react'
import { Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { BorrowPositionDetails, type BorrowPositionDetailsProps } from './BorrowPositionDetails'
import { LendPositionDetails, type LendPositionDetailsProps } from './LendPositionDetails'

type PositionDetailsProps = {
  borrowPositionDetails: BorrowPositionDetailsProps
  lendPositionDetails?: LendPositionDetailsProps // lend is optional since it's not available for crvusd
}

const TABS = [
  { value: 'borrow', label: t`Borrow`, href: '' },
  { value: 'lend', label: t`Lend`, href: '' },
]

export const PositionDetails = ({ borrowPositionDetails, lendPositionDetails }: PositionDetailsProps) => {
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>(TABS[0].value)
  return (
    <Box>
      {lendPositionDetails && (
        <TabsSwitcher value={tab} onChange={setTab} variant="contained" size="small" options={TABS} />
      )}
      <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        {tab === 'borrow' && <BorrowPositionDetails {...borrowPositionDetails} />}
        {tab === 'lend' && lendPositionDetails && <LendPositionDetails {...lendPositionDetails} />}
      </Box>
    </Box>
  )
}
