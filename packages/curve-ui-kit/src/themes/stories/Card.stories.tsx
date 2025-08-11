import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import type { CardProps } from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const CardStory = (props: CardProps) => (
  <Card sx={{ maxWidth: '20rem' }} {...props}>
    <CardHeader
      avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>L</Avatar>}
      title="Llama Card"
      subheader="September 14, 2024"
    />

    <CardMedia
      component="img"
      height="200"
      image="https://images.unsplash.com/photo-1511885663737-eea53f6d6187"
      alt="Llama image"
    />

    <CardContent>
      <Typography variant="bodySRegular" color="textSecondary">
        This impressive llama is a perfect example of the species. Llamas are domesticated South American camelids.
      </Typography>
    </CardContent>

    <CardActions disableSpacing>
      <Stack direction="row" gap={Spacing.xs} flexGrow={1}>
        <Button fullWidth>Share</Button>
        <Button fullWidth color="secondary">
          Learn More
        </Button>
      </Stack>
    </CardActions>
  </Card>
)

const CardStorySimple = (props: CardProps) => (
  <Card sx={{ maxWidth: '20rem' }} {...props}>
    <CardHeader title="Simple card" />

    <CardContent>
      <Typography variant="bodySRegular" color="textSecondary">
        A simple card with just content. Perfect for displaying basic information about llamas and their habitat.
      </Typography>
    </CardContent>

    <CardActions>
      <Button fullWidth>Action</Button>
    </CardActions>
  </Card>
)

const CardStoryHeaderOnly = (props: CardProps) => (
  <Card sx={{ maxWidth: '20rem' }} {...props}>
    <CardHeader title="Header Only Card" subheader="With subtitle" />

    <CardContent>
      <Typography variant="bodySRegular" color="text.secondary">
        This card focuses on the header section with a clean content area below.
      </Typography>
    </CardContent>
  </Card>
)

const CardStoryTokenPairAvatar = (props: CardProps) => (
  <Card sx={{ maxWidth: '20rem' }} {...props}>
    <CardHeader
      avatar={
        <TokenPair
          hideChainIcon
          chain="ethereum"
          assets={{
            primary: { symbol: 'crvUSD', address: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' },
            secondary: { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
          }}
        />
      }
      title="USDC/crvUSD"
    />

    <CardContent>
      <Typography variant="headingSBold">Simple Card</Typography>
      <Typography variant="bodySRegular" color="textSecondary">
        A simple card with just content. Perfect for displaying basic information about llamas and their habitat.
      </Typography>
    </CardContent>

    <CardActions>
      <Button fullWidth>Action</Button>
    </CardActions>
  </Card>
)

const meta: Meta<typeof CardStory> = {
  title: 'UI Kit/Primitives/Card',
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevation', 'outlined'],
      description: 'The variant of the component',
    },
  },
}

type Story = StoryObj<typeof CardStory>

export const Default: Story = { render: (args) => <CardStory {...args} /> }
export const Simple: Story = { render: (args) => <CardStorySimple {...args} /> }
export const HeaderOnly: Story = { render: (args) => <CardStoryHeaderOnly {...args} /> }
export const TokenPairAvatar: Story = { render: (args) => <CardStoryTokenPairAvatar {...args} /> }

export default meta
