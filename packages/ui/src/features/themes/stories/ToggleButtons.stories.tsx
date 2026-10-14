import type { MouseEvent } from 'react'
import { useState } from 'storybook/internal/preview-api' // Intentionally, can't use React's useState: https://github.com/storybookjs/storybook/issues/29189
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon } from '@ui/icons/CheckIcon'
import { FontBoldIcon } from '@ui/icons/FontBoldIcon'
import { FontItalicIcon } from '@ui/icons/FontItalicIcon'
import { TextAlignCenterIcon } from '@ui/icons/TextAlignCenterIcon'
import { TextAlignJustifyIcon } from '@ui/icons/TextAlignJustifyIcon'
import { TextAlignLeftIcon } from '@ui/icons/TextAlignLeftIcon'
import { TextAlignRightIcon } from '@ui/icons/TextAlignRightIcon'
import { UnderlineIcon } from '@ui/icons/UnderlineIcon'

const meta: Meta<typeof ToggleButtonGroup> = {
  title: 'UI/Themes/ToggleButtons',
  component: ToggleButtonGroup,
  argTypes: {
    size: {
      control: 'select',
      options: ['extraSmall', 'small', 'medium', 'extraSmallSquare', 'smallSquare', 'mediumSquare'],
      description: 'The size of the component',
    },
    compact: { control: 'boolean', description: 'If there should be spacing between the buttons in a group' },
  },
  args: { size: 'small', compact: false },
}

type Story = StoryObj<typeof ToggleButtonGroup>

export const Exclusive: Story = {
  render: args => {
    // eslint-disable-next-line @eslint-react/rules-of-hooks
    const [alignment, setAlignment] = useState('left')

    const handleAlignment = (_: MouseEvent<HTMLElement>, newAlignment: string) => {
      if (newAlignment) {
        setAlignment(newAlignment)
      }
    }

    return (
      <ToggleButtonGroup exclusive value={alignment} onChange={handleAlignment} aria-label="alignments" {...args}>
        <ToggleButton value="left" aria-label="left aligned">
          <TextAlignLeftIcon />
        </ToggleButton>

        <ToggleButton value="center" aria-label="centered">
          <TextAlignCenterIcon />
        </ToggleButton>

        <ToggleButton value="right" aria-label="right aligned">
          <TextAlignRightIcon />
        </ToggleButton>

        <ToggleButton value="justify" aria-label="justified" disabled>
          <TextAlignJustifyIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    )
  },
}

export const Multiple: Story = {
  render: args => {
    // eslint-disable-next-line @eslint-react/rules-of-hooks
    const [formats, setFormats] = useState(['bold', 'italic'])

    const handleFormat = (_: MouseEvent<HTMLElement>, newFormats: string[]) => {
      setFormats(newFormats)
    }

    return (
      <ToggleButtonGroup value={formats} onChange={handleFormat} aria-label="text formatting" {...args}>
        <ToggleButton value="bold" aria-label="bold">
          <FontBoldIcon />
        </ToggleButton>

        <ToggleButton value="italic" aria-label="italic">
          <FontItalicIcon />
        </ToggleButton>

        <ToggleButton value="underlined" aria-label="underlined">
          <UnderlineIcon />
        </ToggleButton>

        <ToggleButton value="justify" aria-label="justify" disabled>
          <TextAlignJustifyIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    )
  },
  args: { size: 'smallSquare', compact: true },
}

export const Standalone: Story = {
  render: () => {
    // eslint-disable-next-line @eslint-react/rules-of-hooks
    const [selected, setSelected] = useState(false)

    return (
      <ToggleButton value="check" selected={selected} onChange={() => setSelected(prevSelected => !prevSelected)}>
        <CheckIcon />
      </ToggleButton>
    )
  },
}

export const Text: Story = {
  render: args => {
    // eslint-disable-next-line @eslint-react/rules-of-hooks
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
