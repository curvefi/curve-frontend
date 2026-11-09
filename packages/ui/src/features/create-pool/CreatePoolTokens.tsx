import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CREATE_POOL_GRID_SIZE } from './constants'
import { getCreatePoolTokens } from './create-pool.utils'
import { CreatePoolAvailability } from './CreatePoolAvailability'
import { CreatePoolTokenSelector } from './CreatePoolTokenSelector'
import type { CreatePoolTokensProps } from './types'

const { Spacing } = SizesAndSpaces

export const CreatePoolTokens = ({
  form: { values },
  blockchainId,
  limits: { tokens: tokenCountRange },
  tokenOptions,
  tokenSearch,
  onTokenSearch,
  setTokens,
  inputsDisabled,
  availability,
  network,
}: CreatePoolTokensProps) => {
  const tokens = getCreatePoolTokens(values, values.tokenCount)
  return (
    <Stack sx={{ gap: Spacing.xs }}>
      <Grid container spacing={Spacing.sm}>
        {tokens.map((token, index) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Token slots must remain mounted when selections change.
          <Grid key={index} component={Stack} size={CREATE_POOL_GRID_SIZE} sx={{ gap: Spacing.xs }}>
            <Typography variant="bodySRegular">{`${t`Token`} ${index + 1}`}</Typography>
            <Stack direction="row" sx={{ gap: Spacing.sm }}>
              <CreatePoolTokenSelector
                blockchainId={blockchainId}
                tokenOptions={tokenOptions}
                tokenSearch={tokenSearch}
                onTokenSearch={onTokenSearch}
                selectedToken={token}
                excluded={tokens}
                disabled={inputsDisabled}
                onToken={token => setTokens(tokens.map((current, i) => (i === index ? token : current)))}
              />
              {tokens.length > tokenCountRange.min && (
                <Button
                  color="ghost"
                  disabled={inputsDisabled}
                  onClick={() => setTokens(tokens.filter((_, i) => i !== index))}
                >{t`Remove`}</Button>
              )}
            </Stack>
          </Grid>
        ))}
      </Grid>
      <Button
        data-testid="create-pool-add-token"
        color="ghost"
        size="small"
        sx={{ alignSelf: 'start' }}
        disabled={inputsDisabled || tokens.length >= tokenCountRange.max}
        onClick={() => setTokens([...tokens, undefined])}
      >{t`Add token +`}</Button>
      <CreatePoolAvailability availability={availability} networkName={network.name} tokenCount={values.tokenCount} />
    </Stack>
  )
}
