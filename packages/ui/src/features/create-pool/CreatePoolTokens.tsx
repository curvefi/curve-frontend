import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { TrashIcon } from '@ui/icons/TrashIcon'
import { t } from '@ui/lib/i18n'
import { getCreatePoolTokens } from './create-pool.utils'
import { CreatePoolTokenAvailability } from './CreatePoolTokenAvailability'
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
      <Stack sx={{ gap: Spacing.sm }}>
        {tokens.map((token, index) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Token slots must remain mounted when selections change.
          <Stack key={index} sx={{ gap: Spacing.xs }}>
            <Typography variant="bodySRegular">{`${t`Token`} ${index + 1}`}</Typography>
            <Stack direction="row" sx={{ gap: Spacing.sm, alignItems: 'center' }}>
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
                <IconButton
                  size="extraSmall"
                  disabled={inputsDisabled}
                  onClick={() => setTokens(tokens.filter((_, i) => i !== index))}
                >
                  <TrashIcon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Button
        data-testid="create-pool-add-token"
        color="ghost"
        size="small"
        sx={{ alignSelf: 'start' }}
        disabled={inputsDisabled || tokens.length >= tokenCountRange.max}
        onClick={() => setTokens([...tokens, undefined])}
      >{t`Add token +`}</Button>
      <CreatePoolTokenAvailability
        availability={availability}
        networkName={network.name}
        tokenCount={values.tokenCount}
      />
    </Stack>
  )
}
