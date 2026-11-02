import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CREATE_POOL_COLUMNS } from './constants'
import { CreatePoolTokenSelector } from './CreatePoolTokenSelector'
import type { CreatePoolTokensProps } from './types'

const { Spacing } = SizesAndSpaces

export const CreatePoolTokens = ({
  form: { values },
  blockchainId,
  tokenOptions,
  tokenSearch,
  onTokenSearch,
  setTokens,
  inputsDisabled,
  tokenCountRange,
}: CreatePoolTokensProps) => (
  <>
    <Stack sx={{ ...CREATE_POOL_COLUMNS, gap: Spacing.sm }}>
      {values.tokens.map((token, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- Token slots must remain mounted when selections change.
        <Stack key={index} sx={{ gap: Spacing.xs }}>
          <Typography variant="bodySRegular">{`${t`Token`} ${index + 1}`}</Typography>
          <Stack direction="row" sx={{ gap: Spacing.sm }}>
            <CreatePoolTokenSelector
              blockchainId={blockchainId}
              tokenOptions={tokenOptions}
              tokenSearch={tokenSearch}
              onTokenSearch={onTokenSearch}
              selectedToken={token}
              excluded={values.tokens}
              disabled={inputsDisabled}
              onToken={token => setTokens(values.tokens.map((current, i) => (i === index ? token : current)))}
            />
            {values.tokens.length > tokenCountRange.min && (
              <Button
                color="ghost"
                disabled={inputsDisabled}
                onClick={() => setTokens(values.tokens.filter((_, i) => i !== index))}
              >{t`Remove`}</Button>
            )}
          </Stack>
        </Stack>
      ))}
    </Stack>
    <Button
      color="ghost"
      size="small"
      sx={{ alignSelf: 'start' }}
      disabled={inputsDisabled || values.tokens.length >= tokenCountRange.max}
      onClick={() => setTokens([...values.tokens, undefined])}
    >{t`Add token +`}</Button>
  </>
)
