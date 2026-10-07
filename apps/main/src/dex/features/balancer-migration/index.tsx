import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { ConnectWalletPrompt } from '@evm-ui/features/connect-wallet'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { recordValues } from '@primitives/objects.utils'
import { EmptyStateCard } from '@ui/components/EmptyStateCard'
import { PageHeader } from '@ui/components/PageHeader'
import { SelectableCard } from '@ui/components/SelectableCard'
import { TokenIcons } from '@ui/components/TokenIcons'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { type BalancerPosition, getBalancerChain } from './api/balancer.api'
import { MigrationFormTabs } from './components/MigrationFormTabs'
import { findCurveTargets } from './migration.utils'
import { useBalancerPositions } from './queries/balancer-positions.query'

const { Spacing } = SizesAndSpaces

const PositionCard = ({
  position,
  blockchainId,
  isSelected,
  onSelect,
}: {
  position: BalancerPosition
  blockchainId: string
  isSelected: boolean
  onSelect: () => void
}) => {
  const { totalBalanceUsd, walletBalanceUsd } = position.userBalance
  const stakedUsd = totalBalanceUsd - walletBalanceUsd
  return (
    <SelectableCard
      isSelected={isSelected}
      onClick={onSelect}
      sx={{ padding: Spacing.md, display: 'flex', justifyContent: 'space-between', gap: Spacing.md }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons
          blockchainId={blockchainId}
          tokens={position.poolTokens.map(
            ({ underlyingToken, address, symbol }) => underlyingToken ?? { address, symbol },
          )}
          size="lg"
        />
        <Stack sx={{ alignItems: 'start' }}>
          <Typography variant="bodyMBold">{position.name}</Typography>
          <Typography variant="bodyXsRegular" color="textSecondary">
            {t`Balancer v${position.protocolVersion}`} · {position.type}
          </Typography>
        </Stack>
      </Stack>
      <Stack sx={{ alignItems: 'end' }}>
        <Typography variant="bodyMBold">{formatNumber(totalBalanceUsd, 'usd.amount')}</Typography>
        {stakedUsd > 0.01 && (
          <Typography variant="bodyXsRegular" color="warning">
            {t`${formatNumber(stakedUsd, 'usd.amount')} staked`}
          </Typography>
        )}
      </Stack>
    </SelectableCard>
  )
}

export const PageBalancerMigration = () => {
  const network = useNetworkFromUrl()
  const { address: userAddress } = useConnection()
  const chainId = network?.chainId
  const blockchainId = network?.blockchainId ?? 'ethereum'
  const isSupportedChain = chainId != null && !!getBalancerChain(chainId)

  const positions = useBalancerPositions({ chainId, userAddress }, isSupportedChain)
  const curvePools = usePoolsPricesApi({ blockchainId: getPricesApiBlockchainId(blockchainId) })
  const [selectedId, setSelectedId] = useState<string>()

  const selected = positions.data?.find(({ id }) => id === selectedId) ?? positions.data?.[0]
  const targets = useMemo(
    () => (selected && curvePools.data ? findCurveTargets(selected, recordValues(curvePools.data)) : []),
    [selected, curvePools.data],
  )

  const isReady = !!userAddress && isSupportedChain
  return (
    <DetailPageLayout
      header={
        <PageHeader
          title={t`Migrate from Balancer`}
          subtitle={t`Balancer is winding down. Move your liquidity into a Curve pool with the same tokens in one transaction.`}
        />
      }
      formTabs={
        isReady && selected && chainId != null
          ? {
              // Wait for Curve pools so the form starts with the best target selected; the layout shows a skeleton.
              content: curvePools.data && (
                <MigrationFormTabs
                  // Remount per position so target and amount selections reset.
                  key={selected.id}
                  chainId={chainId}
                  blockchainId={blockchainId}
                  position={selected}
                  targets={targets}
                />
              ),
            }
          : null
      }
      testId="balancer-migration-page"
    >
      {isReady && positions.data?.length ? (
        <Stack sx={{ gap: Spacing.sm }}>
          <Typography variant="headingXsBold">{t`Your Balancer positions`}</Typography>
          {positions.data.map(position => (
            <PositionCard
              key={position.id}
              position={position}
              blockchainId={blockchainId}
              isSelected={position.id === selected?.id}
              onSelect={() => setSelectedId(position.id)}
            />
          ))}
        </Stack>
      ) : isReady && positions.data ? (
        <EmptyStateCard
          title={t`No Balancer positions`}
          description={t`This wallet has no Balancer liquidity on this network.`}
        />
      ) : isReady && positions.error ? (
        <Alert variant="outlined" severity="error">
          {t`Couldn't load Balancer positions:`} {positions.error.message}
        </Alert>
      ) : isReady ? (
        <Skeleton variant="rectangular" height={200} />
      ) : userAddress ? (
        <Alert variant="outlined" severity="info">{t`Balancer migration isn't available on this network.`}</Alert>
      ) : (
        <ConnectWalletPrompt description={t`Connect your wallet to see your Balancer positions.`} />
      )}
    </DetailPageLayout>
  )
}
