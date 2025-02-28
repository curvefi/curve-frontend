import type { UserCollateralEvents } from '@curvefi/prices-api/src/crvusd/models'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'

type UserLlammaEventsListProps = {
  userCollateralEvents: UserCollateralEvents
}

export const UserLlammaEventsList = ({ userCollateralEvents }: UserLlammaEventsListProps) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMore />}>
      <Typography>Llama Events</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography>No events found</Typography>
    </AccordionDetails>
  </Accordion>
)
