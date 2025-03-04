/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'storybook/internal/preview-api' // Intentionally, can't use React's useState: https://github.com/storybookjs/storybook/issues/29189
import type { Meta, StoryObj } from '@storybook/react'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill'
import CheckIcon from '@mui/icons-material/Check'

const meta: Meta<typeof ToggleButtonGroup> = {
  title: 'UI Kit/Primitives/ToggleButton',
  component: ToggleButtonGroup,
  argTypes: {
    size: {
      control: 'select',
      options: ['extraSmall', 'small', 'medium', 'extraSmallSquare', 'smallSquare', 'mediumSquare'],
      description: 'The size of the component',
    },
    compact: {
      control: 'boolean',
      description: 'If there should be spacing between the buttons in a group',
    },
  },
  args: {
    size: 'small',
    compact: false,
  },
}

type Story = StoryObj<typeof ToggleButtonGroup>

export const Exclusive: Story = {
  render: (args) => {
    const [alignment, setAlignment] = useState('left')

    const handleAlignment = (_: MouseEvent<HTMLElement>, newAlignment: string) => {
      if (newAlignment) {
        setAlignment(newAlignment)
      }
    }

    return (
      <ToggleButtonGroup exclusive value={alignment} onChange={handleAlignment} aria-label="alignments" {...args}>
        <ToggleButton value="left" aria-label="left aligned">
          <FormatAlignLeftIcon />
        </ToggleButton>

        <ToggleButton value="center" aria-label="centered">
          <FormatAlignCenterIcon />
        </ToggleButton>

        <ToggleButton value="right" aria-label="right aligned">
          <FormatAlignRightIcon />
        </ToggleButton>

        <ToggleButton value="justify" aria-label="justified" disabled>
          <FormatAlignJustifyIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    )
  },
}

export const Multiple: Story = {
  render: (args) => {
    const [formats, setFormats] = useState(['bold', 'italic'])

    const handleFormat = (_: MouseEvent<HTMLElement>, newFormats: string[]) => {
      setFormats(newFormats)
    }

    return (
      <ToggleButtonGroup value={formats} onChange={handleFormat} aria-label="text formatting" {...args}>
        <ToggleButton value="bold" aria-label="bold">
          <FormatBoldIcon />
        </ToggleButton>

        <ToggleButton value="italic" aria-label="italic">
          <FormatItalicIcon />
        </ToggleButton>

        <ToggleButton value="underlined" aria-label="underlined">
          <FormatUnderlinedIcon />
        </ToggleButton>

        <ToggleButton value="justify" aria-label="color" disabled>
          <FormatColorFillIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    )
  },
  args: {
    size: 'smallSquare',
    compact: true,
  },
}

export const Standalone: Story = {
  render: () => {
    const [selected, setSelected] = useState(false)

    return (
      <ToggleButton value="check" selected={selected} onChange={() => setSelected((prevSelected) => !prevSelected)}>
        <CheckIcon />
      </ToggleButton>
    )
  },
}

export const Text: Story = {
  render: (args) => {
    const [alignment, setAlignment] = useState('left')

    const handleAlignment = (_: MouseEvent<HTMLElement>, newAlignment: string | null) => {
      if (newAlignment) {
        setAlignment(newAlignment)
      }
    }

    return (
      <ToggleButtonGroup exclusive value={alignment} onChange={handleAlignment} aria-label="alignments" {...args}>
        <ToggleButton value="left" aria-label="left aligned">
          Left
        </ToggleButton>

        <ToggleButton value="center" aria-label="centered">
          Center
        </ToggleButton>

        <ToggleButton value="right" aria-label="right aligned">
          Right
        </ToggleButton>

        <ToggleButton value="justify" aria-label="justified" disabled>
          Justify
        </ToggleButton>
      </ToggleButtonGroup>
    )
  },
}

export default meta
