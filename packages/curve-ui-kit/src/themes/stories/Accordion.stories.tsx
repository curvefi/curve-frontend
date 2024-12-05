import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

type StoryProps = {
  title?: string
}

const AccordionStory = ({ title }: StoryProps) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
        sit amet blandit leo lobortis eget.
      </Typography>
    </AccordionDetails>
  </Accordion>
)

const meta: Meta<typeof AccordionStory> = {
  title: 'UI Kit/Primitives/Accordion',
  component: AccordionStory,
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the accordion',
    },
  },
  args: {
    title: 'Accordion Title',
  }
}

type Story = StoryObj<typeof AccordionStory>

export const accordion: Story = {

}

export default meta
