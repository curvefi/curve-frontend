import { type ComponentProps, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Meta, StoryObj } from '@storybook/react-vite'
import { SearchField } from '../SearchField'

const ControlledSearchField = ({
  onSearch,
  value: initialValue = '',
  ...props
}: ComponentProps<typeof SearchField>) => {
  const [value, setValue] = useState(initialValue)

  return (
    <SearchField
      {...props}
      value={value}
      onSearch={nextValue => {
        setValue(nextValue)
        onSearch(nextValue)
      }}
    />
  )
}

const meta: Meta<typeof SearchField> = {
  title: 'UI Kit/Primitives/SearchField',
  component: SearchField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Controlled search field. It is cleared and focused when clicking the close button.',
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
  render: args => <ControlledSearchField {...args} />,
  args: {
    value: '',
    onSearch: (value: string) => console.info('Search:', value),
  },
}

export const WithCustomPlaceholder: Story = {
  render: args => <ControlledSearchField {...args} />,
  args: {
    value: '',
    onSearch: (value: string) => console.info('Search:', value),
    placeholder: 'Search networks',
  },
}

export const Small: Story = {
  render: args => <ControlledSearchField {...args} />,
  args: {
    value: '',
    onSearch: (value: string) => console.info('Search:', value),
    size: 'small',
  },
}

// Example with input reference
export const WithInputRef = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')

  return (
    <Box sx={{ width: '300px' }}>
      <SearchField inputRef={inputRef} value={searchValue} onSearch={setSearchValue} />
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
  render: args => <ControlledSearchField {...args} />,
  args: {
    value: '',
    onSearch: (value: string) => console.info('Search:', value),
    sx: {
      width: '300px',
      backgroundColor: '#f5f5f5',
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
      },
    },
  },
}
