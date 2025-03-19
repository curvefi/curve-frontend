import { useState, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Meta, StoryObj } from '@storybook/react'
import { SearchField } from '../SearchField'

const meta: Meta<typeof SearchField> = {
  title: 'UI Kit/Primitives/SearchField',
  component: SearchField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Search field with debounced search. It is cleared and focused when clicking the close button.',
      },
    },
  },
  argTypes: {
    onSearch: { action: 'searched' },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    placeholder: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof SearchField>

export const Default: Story = {
  args: {
    onSearch: (value: string) => console.log('Search:', value),
  },
}

export const WithCustomPlaceholder: Story = {
  args: {
    onSearch: (value: string) => console.log('Search:', value),
    placeholder: 'Search networks',
  },
}

export const Small: Story = {
  args: {
    onSearch: (value: string) => console.log('Search:', value),
    size: 'small',
  },
}

// Example with input reference
export const WithInputRef = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')

  return (
    <Box sx={{ width: '300px' }}>
      <SearchField inputRef={inputRef} onSearch={setSearchValue} />
      <Box mt={2}>
        <Button variant="contained" onClick={() => inputRef.current?.focus()}>
          Focus input
        </Button>
      </Box>
      <Box mt={1}>Current search value: {searchValue}</Box>
    </Box>
  )
}

export const CustomStyled: Story = {
  args: {
    onSearch: (value: string) => console.log('Search:', value),
    sx: {
      width: '300px',
      backgroundColor: '#f5f5f5',
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
      },
    },
  },
}
