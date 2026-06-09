import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGoBack } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ArrowLeft } from '@ui-kit/shared/icons/ArrowLeft'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useRefuelPool } from '../queries/pools.query'

const { Spacing } = SizesAndSpaces

/** Temporary header to show something for the refuel page, as the Figma design wants a breadcrumb instead which we don't have yet. */
export const Header = ({ blockchainId, poolAddress }: { blockchainId: Chain; poolAddress: Address }) => {
  const { data: pool, isLoading } = useRefuelPool({ blockchainId, poolAddress })

  return (
    <Stack direction="row" sx={{ gap: Spacing.sm, alignItems: 'center', paddingBlock: Spacing.sm }}>
      <IconButton
        size="small"
        aria-label={t`Back to pool`}
        component={RouterLink}
        href={getInternalUrl('dex', blockchainId, `${DEX_ROUTES.PAGE_POOLS}/${poolAddress}`)}
        onClick={useGoBack()}
      >
        <ArrowLeft />
      </IconButton>

      <WithSkeleton loading={isLoading} variant="rectangular" width={35} height={35}>
        {pool?.coins && (
          <TokenPair chain={blockchainId} assets={{ primary: pool.coins[0], secondary: pool.coins[1] }} hideChainIcon />
        )}
      </WithSkeleton>

      <WithSkeleton loading={isLoading} width={140} height={24}>
        <Typography variant="headingSBold">{pool?.name ?? poolAddress}</Typography>
      </WithSkeleton>
    </Stack>
  )
}
